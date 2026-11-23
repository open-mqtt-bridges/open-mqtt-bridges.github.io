//! Broker integration; install `mosquitto` and run with `--ignored`.

use std::{
    net::TcpListener,
    process::{Child, Command, Stdio},
    sync::Arc,
    time::Duration,
};

use ping_mqtt_bridge::{
    config::Broker,
    health::Health,
    icmp::Outcome,
    mqtt::{self, Sample},
};
use rumqttc::{AsyncClient, Event, EventLoop, MqttOptions, Packet, Publish, QoS};
use tokio::{net::TcpStream, sync::mpsc, time};

struct Mosquitto(Child);

impl Mosquitto {
    async fn start(port: u16) -> Self {
        let instance = Self(
            Command::new("mosquitto")
                .args(["-p", &port.to_string()])
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
                .expect("install mosquitto before running this test"),
        );
        time::timeout(Duration::from_secs(3), async {
            while TcpStream::connect(("127.0.0.1", port)).await.is_err() {
                time::sleep(Duration::from_millis(10)).await;
            }
        })
        .await
        .expect("broker did not start");
        instance
    }
}

impl Drop for Mosquitto {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

const BASE: &str = "stats/ping";
const ALIVE: &str = "stats/ping/Device 01/alive";
const TIME: &str = "stats/ping/Device 01/time";

async fn subscribe(port: u16, name: &str) -> (AsyncClient, EventLoop) {
    let (client, mut events) = AsyncClient::new(MqttOptions::new(name, "127.0.0.1", port), 1);
    client
        .try_subscribe("stats/ping/#", QoS::AtLeastOnce)
        .unwrap();
    time::timeout(Duration::from_secs(3), async {
        loop {
            if let Event::Incoming(Packet::SubAck(_)) = events.poll().await.unwrap() {
                break;
            }
        }
    })
    .await
    .expect("missing SUBACK");
    (client, events)
}

async fn next_publish(events: &mut EventLoop) -> Publish {
    loop {
        if let Event::Incoming(Packet::Publish(publish)) = events.poll().await.unwrap() {
            return publish;
        }
    }
}

async fn expect(events: &mut EventLoop, topic: &str, payload: &[u8]) {
    let publish = time::timeout(Duration::from_secs(8), next_publish(events))
        .await
        .expect("missing PUBLISH");
    assert_eq!(publish.topic, topic);
    assert_eq!(&publish.payload[..], payload);
    assert_eq!(publish.qos, QoS::AtLeastOnce);
    assert!(!publish.retain);
}

async fn quiet(events: &mut EventLoop) {
    assert!(
        time::timeout(Duration::from_millis(250), next_publish(events))
            .await
            .is_err()
    );
}

async fn health_is(health: &Health, connected: bool) {
    time::timeout(Duration::from_secs(8), async {
        while health.broker_connected() != connected {
            time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("bridge broker health did not change");
}

async fn send(tx: &mpsc::Sender<Sample>, outcome: Outcome) {
    tx.send(Sample {
        device: "Device 01".into(),
        outcome,
    })
    .await
    .unwrap();
}

#[tokio::test]
#[ignore = "requires a local mosquitto executable"]
async fn qos_no_retained_history_and_latest_only_after_restart() {
    let port = TcpListener::bind(("127.0.0.1", 0))
        .unwrap()
        .local_addr()
        .unwrap()
        .port();
    let broker = Mosquitto::start(port).await;
    let (_subscriber, mut events) = subscribe(port, "subscriber-first").await;
    let (tx, rx) = mpsc::channel(mqtt::RESULT_QUEUE);
    let health = Arc::new(Health::default());
    let worker_health = Arc::clone(&health);
    let options = mqtt::options(
        &Broker {
            host: "127.0.0.1".into(),
            port,
            client_id: "bridge-test".into(),
            tls: false,
            ca_file: None,
        },
        None,
    )
    .unwrap();
    let worker = tokio::spawn(async move { mqtt::run(options, BASE, rx, &worker_health).await });
    health_is(&health, true).await;

    for _ in 0..2 {
        send(&tx, Outcome::Reply(Duration::from_micros(1420))).await;
        expect(&mut events, ALIVE, b"true").await;
        expect(&mut events, TIME, b"1.42").await;
    }
    let (_new_subscriber, mut late_events) = subscribe(port, "subscriber-late").await;
    quiet(&mut late_events).await;

    send(&tx, Outcome::Timeout).await;
    expect(&mut events, ALIVE, b"false").await;
    quiet(&mut events).await;

    drop(broker);
    health_is(&health, false).await;
    for _ in 0..(mqtt::RESULT_QUEUE * 4) {
        send(&tx, Outcome::Reply(Duration::ZERO)).await;
    }
    send(&tx, Outcome::Timeout).await;

    let _restarted = Mosquitto::start(port).await;
    let (_new_subscriber, mut events) = subscribe(port, "subscriber-after-restart").await;
    expect(&mut events, ALIVE, b"false").await;
    quiet(&mut events).await;
    health_is(&health, true).await;

    send(&tx, Outcome::Reply(Duration::from_micros(5420))).await;
    expect(&mut events, ALIVE, b"true").await;
    expect(&mut events, TIME, b"5.42").await;
    quiet(&mut events).await;
    worker.abort();
}
