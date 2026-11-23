use std::{collections::BTreeSet, env, io, path::PathBuf, sync::Arc, time::Duration};

use anyhow::{Context, Result, ensure};
use ping_mqtt_bridge::{
    config::{Config, Credentials},
    health::{self, Health},
    icmp, mqtt, scheduler,
};
use tokio::{
    net::TcpListener,
    signal::unix::{SignalKind, signal},
    sync::mpsc,
};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let mut args = env::args_os().skip(1);
    let path = PathBuf::from(args.next().unwrap_or_else(|| "bridge.toml".into()));
    ensure!(
        args.next().is_none(),
        "usage: ping-mqtt-bridge [CONFIG_PATH]"
    );
    let config = Config::load(&path)?;
    let options = mqtt::options(&config.broker, Credentials::load()?)?;
    icmp::check_access()?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let listener = TcpListener::bind(config.health_bind)
        .await
        .context("cannot bind health listener")?;
    tracing::info!(
        devices = config.devices.len(),
        base_topic = config.base_topic,
        health_bind = %listener.local_addr()?,
        "bridge started"
    );
    let health = Arc::new(Health::default());
    let (tx, rx) = mpsc::channel(mqtt::RESULT_QUEUE);
    let mut failed = BTreeSet::new();
    let devices: Vec<_> = config.devices.iter().collect();
    let timeout = Duration::from_millis(config.timeout_ms);
    tokio::select! {
        _ = terminate.recv() => {},
        _ = interrupt.recv() => {},
        result = axum::serve(listener, health::routes(Arc::clone(&health))) => result?,
        result = mqtt::run(options, &config.base_topic, rx, &health) => result?,
        _ = scheduler::run(
            &devices,
            Duration::from_secs(config.interval_secs),
            config.parallelism,
            |(id, address)| async move { (id, icmp::probe(*address, timeout).await) },
            |(id, result)| {
                let sample = completed(&health, &mut failed, id, result);
                let tx = &tx;
                async move {
                    if let Some(sample) = sample {
                        let _ = tx.send(sample).await;
                    }
                }
            },
        ) => {},
    }
    tracing::info!("bridge stopped");
    Ok(())
}

fn completed<'a>(
    health: &Health,
    failed: &mut BTreeSet<&'a str>,
    id: &'a str,
    result: io::Result<icmp::Outcome>,
) -> Option<mqtt::Sample> {
    match result {
        Ok(outcome) => {
            health.update_probe(failed.remove(id), false);
            tracing::debug!(device = id, ?outcome, "probe completed");
            Some(mqtt::Sample {
                device: id.to_owned(),
                outcome,
            })
        }
        Err(error) => {
            health.update_probe(!failed.insert(id), true);
            tracing::warn!(device = id, %error, "local probe failure");
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_failures_do_not_publish_and_timeout_is_a_remote_result() {
        let health = Health::default();
        let mut failed = BTreeSet::new();
        assert!(
            completed(
                &health,
                &mut failed,
                "test",
                Err(io::ErrorKind::PermissionDenied.into())
            )
            .is_none()
        );
        assert!(failed.contains("test"));
        let sample = completed(&health, &mut failed, "test", Ok(icmp::Outcome::Timeout)).unwrap();
        assert_eq!(sample.outcome, icmp::Outcome::Timeout);
        assert!(failed.is_empty());
    }
}
