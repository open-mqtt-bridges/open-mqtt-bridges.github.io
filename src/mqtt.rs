//! Ordered, bounded MQTT 3.1.1 publication with a fresh session on reconnect.

use std::{
    collections::BTreeMap, fs::File, future::Future, io::BufReader, sync::Arc, time::Duration,
};

use anyhow::{Context, Result, bail, ensure};
use rumqttc::{
    AsyncClient, ConnectionError, Event, EventLoop, MqttOptions, Packet, QoS, TlsConfiguration,
    Transport,
};
use rustls::{ClientConfig, RootCertStore};
use tokio::{sync::mpsc, time};

use crate::{
    config::{Broker, Credentials},
    health::Health,
    icmp::Outcome,
};

/// Connected results queue; the scheduler applies backpressure rather than dropping samples.
pub const RESULT_QUEUE: usize = 64;
const MAX_BACKOFF: Duration = Duration::from_secs(30);
const ACK_TIMEOUT: Duration = Duration::from_secs(15);

pub struct Sample {
    pub device: String,
    pub outcome: Outcome,
}

type Latest = BTreeMap<String, Outcome>;

pub fn options(broker: &Broker, credentials: Option<Credentials>) -> Result<MqttOptions> {
    let mut options = MqttOptions::new(&broker.client_id, &broker.host, broker.port);
    options
        .set_clean_session(true)
        .set_keep_alive(Duration::from_secs(10))
        .set_max_packet_size(1024 * 1024, 1024 * 1024)
        .set_inflight(1);
    if let Some(credentials) = credentials {
        options.set_credentials(
            credentials.username,
            credentials.password.unwrap_or_default(),
        );
    }
    if broker.tls {
        let mut roots = RootCertStore::empty();
        if let Some(path) = &broker.ca_file {
            let mut pem = BufReader::new(File::open(path).context("cannot open broker.ca_file")?);
            for certificate in rustls_pemfile::certs(&mut pem) {
                roots
                    .add(certificate.context("invalid PEM in broker.ca_file")?)
                    .context("invalid certificate in broker.ca_file")?;
            }
            ensure!(!roots.is_empty(), "broker.ca_file contains no certificates");
        } else {
            roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
        }
        let config =
            ClientConfig::builder_with_provider(Arc::new(rustls::crypto::ring::default_provider()))
                .with_safe_default_protocol_versions()?
                .with_root_certificates(roots)
                .with_no_client_auth();
        options.set_transport(Transport::tls_with_config(TlsConfiguration::from(config)));
    }
    Ok(options)
}

/// Keep consuming while disconnected. Never allow MQTT-library retransmits from
/// an old session to race with newer data from the application buffer.
pub async fn run(
    options: MqttOptions,
    base: &str,
    mut results: mpsc::Receiver<Sample>,
    health: &Health,
) -> Result<()> {
    let mut latest = Latest::new();
    let mut backoff = Duration::from_secs(1);
    loop {
        let (client, mut events) = AsyncClient::new(options.clone(), 1);
        match collect_while(events.poll(), &mut results, &mut latest).await? {
            Ok(Event::Incoming(Packet::ConnAck(_))) => {
                // Include results that raced with the connection acknowledgement.
                drain_queue(&mut results, &mut latest);
                health.set_broker(true);
                tracing::info!("MQTT broker connected");
                backoff = Duration::from_secs(1);
                let failure =
                    connected(&client, &mut events, base, &mut results, &mut latest).await;
                health.set_broker(false);
                match failure {
                    Ok(()) => return Ok(()),
                    Err(reason) => tracing::warn!(reason, "MQTT broker disconnected"),
                }
            }
            Ok(_) => tracing::warn!("MQTT broker did not acknowledge connection"),
            Err(error) => {
                tracing::warn!(reason = connection_reason(&error), "MQTT connection failed")
            }
        }
        // Drop the old socket, pending requests, and packet identifiers before retrying.
        drop((client, events));
        collect_while(time::sleep(backoff), &mut results, &mut latest).await?;
        backoff = (backoff * 2).min(MAX_BACKOFF);
    }
}

async fn collect_while<F: Future>(
    future: F,
    results: &mut mpsc::Receiver<Sample>,
    latest: &mut Latest,
) -> Result<F::Output> {
    tokio::pin!(future);
    loop {
        tokio::select! {
            biased;
            output = &mut future => return Ok(output),
            sample = results.recv() => match sample {
                Some(sample) => remember(latest, sample),
                None => bail!("probe result channel closed"),
            }
        }
    }
}

fn remember(latest: &mut Latest, sample: Sample) {
    latest.insert(sample.device, sample.outcome);
}

fn drain_queue(results: &mut mpsc::Receiver<Sample>, latest: &mut Latest) {
    for _ in 0..RESULT_QUEUE {
        let Ok(sample) = results.try_recv() else {
            break;
        };
        remember(latest, sample);
    }
}

async fn connected(
    client: &AsyncClient,
    events: &mut EventLoop,
    base: &str,
    results: &mut mpsc::Receiver<Sample>,
    latest: &mut Latest,
) -> Result<(), &'static str> {
    loop {
        let (sample, first_ack) = if let Some((device, outcome)) = latest.pop_first() {
            let sample = Sample { device, outcome };
            if let Err(reason) = publish_first(client, base, &sample) {
                remember(latest, sample);
                return Err(reason);
            }
            (sample, false)
        } else {
            let event = events.poll();
            tokio::pin!(event);
            tokio::select! {
                biased;
                result = &mut event => {
                    result.map_err(|error| connection_reason(&error))?;
                    continue;
                }
                sample = results.recv() => {
                    let Some(sample) = sample else { return Ok(()) };
                    // Finish the current poll below: it may already be flushing a packet.
                    if let Err(reason) = publish_first(client, base, &sample) {
                        remember(latest, sample);
                        return Err(reason);
                    }
                    match time::timeout(ACK_TIMEOUT, &mut event).await {
                        Ok(Ok(event)) => (sample, is_ack(&event)),
                        failure => {
                            remember(latest, sample);
                            return Err(match failure {
                                Ok(Err(error)) => connection_reason(&error),
                                _ => "PUBACK timeout",
                            });
                        }
                    }
                }
            }
        };
        if let Err(reason) = finish_sample(client, events, base, &sample, first_ack).await {
            remember(latest, sample);
            return Err(reason);
        }
    }
}

fn publish_first(client: &AsyncClient, base: &str, sample: &Sample) -> Result<(), &'static str> {
    let (topic, payload) = alive_message(base, sample);
    queue(client, topic, payload)
}

async fn finish_sample(
    client: &AsyncClient,
    events: &mut EventLoop,
    base: &str,
    sample: &Sample,
    first_ack: bool,
) -> Result<(), &'static str> {
    if !first_ack {
        acknowledge(events).await?;
    }
    if let Some((topic, payload)) = time_message(base, sample) {
        queue(client, topic, payload)?;
        acknowledge(events).await?;
    }
    Ok(())
}

fn queue(
    client: &AsyncClient,
    topic: String,
    payload: impl Into<Vec<u8>>,
) -> Result<(), &'static str> {
    client
        .try_publish(topic, QoS::AtLeastOnce, false, payload)
        .map_err(|_| "MQTT publish could not be queued")
}

async fn acknowledge(events: &mut EventLoop) -> Result<(), &'static str> {
    time::timeout(ACK_TIMEOUT, async {
        loop {
            let event = events
                .poll()
                .await
                .map_err(|error| connection_reason(&error))?;
            if is_ack(&event) {
                return Ok(());
            }
        }
    })
    .await
    .unwrap_or(Err("PUBACK timeout"))
}

fn is_ack(event: &Event) -> bool {
    matches!(event, Event::Incoming(Packet::PubAck(_)))
}

fn alive_message(base: &str, sample: &Sample) -> (String, &'static str) {
    let payload = if matches!(sample.outcome, Outcome::Reply(_)) {
        "true"
    } else {
        "false"
    };
    (format!("{base}/{}/alive", sample.device), payload)
}

fn time_message(base: &str, sample: &Sample) -> Option<(String, String)> {
    match sample.outcome {
        Outcome::Reply(latency) => Some((
            format!("{base}/{}/time", sample.device),
            decimal_ms(latency),
        )),
        _ => None,
    }
}

fn decimal_ms(latency: Duration) -> String {
    let micros = latency.as_micros();
    let value = format!("{}.{:03}", micros / 1000, micros % 1000);
    value.trim_end_matches('0').trim_end_matches('.').to_owned()
}

// Never log a broker-supplied packet or MQTT options (which can carry credentials).
fn connection_reason(error: &ConnectionError) -> &'static str {
    match error {
        ConnectionError::Tls(_) => "TLS negotiation or certificate verification failed",
        ConnectionError::Io(_) => "broker network I/O failed",
        ConnectionError::ConnectionRefused(_) => {
            "broker refused connection; check broker policy and credentials"
        }
        ConnectionError::NetworkTimeout | ConnectionError::FlushTimeout => "broker network timeout",
        _ => "MQTT protocol or client error",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exact_legacy_wire_values() {
        let mut sample = Sample {
            device: "Device 01".into(),
            outcome: Outcome::Reply(Duration::from_micros(1420)),
        };
        assert_eq!(
            alive_message("stats/ping", &sample),
            ("stats/ping/Device 01/alive".into(), "true")
        );
        assert_eq!(
            time_message("stats/ping", &sample),
            Some(("stats/ping/Device 01/time".into(), "1.42".into()))
        );
        for outcome in [Outcome::Timeout, Outcome::Unreachable] {
            sample.outcome = outcome;
            assert_eq!(alive_message("stats/ping", &sample).1.as_bytes(), b"false");
            assert_eq!(time_message("stats/ping", &sample), None);
        }
        assert_eq!(decimal_ms(Duration::ZERO), "0");
        assert_eq!(decimal_ms(Duration::from_micros(5)), "0.005");
        assert_eq!(decimal_ms(Duration::from_millis(10)), "10");
    }

    #[test]
    fn offline_keeps_one_latest_result_per_device() {
        let mut latest = Latest::new();
        for _ in 0..1000 {
            remember(
                &mut latest,
                Sample {
                    device: "one".into(),
                    outcome: Outcome::Timeout,
                },
            );
            remember(
                &mut latest,
                Sample {
                    device: "two".into(),
                    outcome: Outcome::Unreachable,
                },
            );
        }
        remember(
            &mut latest,
            Sample {
                device: "one".into(),
                outcome: Outcome::Reply(Duration::ZERO),
            },
        );
        assert_eq!(latest.len(), 2);
        assert_eq!(latest.remove("one"), Some(Outcome::Reply(Duration::ZERO)));
        assert_eq!(latest.remove("two"), Some(Outcome::Unreachable));
    }
}
