//! Broker integration; install `mosquitto` and run with `--ignored`.

use std::{
    fs,
    net::{TcpListener, TcpStream},
    path::PathBuf,
    process::{Child, Command, Stdio},
    time::Duration,
};

use rumqttc::{AsyncClient, Event, EventLoop, MqttOptions, Packet, QoS};
use tokio::time::{sleep, timeout};

const STATUS: &str = "display-fixture/status";
const COMMAND: &str = "display-fixture/cmd";

struct Process(Child);

impl Drop for Process {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

struct ConfigFile(PathBuf);

impl Drop for ConfigFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

async fn start_broker(port: u16) -> Process {
    let broker = Process(
        Command::new("mosquitto")
            .args(["-p", &port.to_string()])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .expect("install mosquitto before running this test"),
    );
    timeout(Duration::from_secs(5), async {
        while TcpStream::connect(("127.0.0.1", port)).is_err() {
            sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("broker startup");
    broker
}

async fn status_client(port: u16) -> (AsyncClient, EventLoop) {
    let (client, mut events) = AsyncClient::new(
        MqttOptions::new("display-test-observer", "127.0.0.1", port),
        4,
    );
    client.try_subscribe(STATUS, QoS::AtLeastOnce).unwrap();
    timeout(Duration::from_secs(8), async {
        loop {
            if let Event::Incoming(Packet::SubAck(_)) = events.poll().await.unwrap() {
                break;
            }
        }
    })
    .await
    .expect("observer subscription");
    (client, events)
}

async fn expect_status(events: &mut EventLoop, command_response: bool) {
    timeout(Duration::from_secs(8), async {
        loop {
            if let Event::Incoming(Packet::Publish(publish)) = events.poll().await.unwrap() {
                let status: serde_json::Value = serde_json::from_slice(&publish.payload).unwrap();
                if publish.topic == STATUS
                    && status["displays"].is_array()
                    && status["command"]["ok"].is_boolean() == command_response
                {
                    break;
                }
            }
        }
    })
    .await
    .unwrap_or_else(|_| panic!("missing display status (command response: {command_response})"));
}

async fn verify_command(port: u16) {
    let (client, mut events) = status_client(port).await;
    expect_status(&mut events, false).await;
    client
        .try_publish(
            COMMAND,
            QoS::AtLeastOnce,
            false,
            br#"{"command":"list_displays"}"#.as_slice(),
        )
        .unwrap();
    expect_status(&mut events, true).await;
}

#[tokio::test]
#[ignore = "requires a local mosquitto executable"]
async fn restores_command_handling_after_broker_restart() {
    let port = TcpListener::bind(("127.0.0.1", 0))
        .unwrap()
        .local_addr()
        .unwrap()
        .port();
    let broker = start_broker(port).await;
    let config = ConfigFile(
        std::env::temp_dir().join(format!("display-mqtt-fixture-{}.yml", uuid::Uuid::new_v4())),
    );
    fs::write(
        &config.0,
        format!("mqtt: {{ host: 127.0.0.1, port: {port} }}\ntopic: display-fixture\n"),
    )
    .unwrap();
    let _bridge = Process(
        Command::new(env!("CARGO_BIN_EXE_displays-mqtt-bridge"))
            .arg("--config")
            .arg(&config.0)
            .spawn()
            .unwrap(),
    );

    verify_command(port).await;
    drop(broker);
    let _restarted = start_broker(port).await;
    verify_command(port).await;
}
