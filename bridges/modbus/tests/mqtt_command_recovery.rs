//! Broker integration; install `mosquitto` and run with `--ignored`.

use std::{
    net::TcpListener as StdListener,
    process::{Child, Command, Stdio},
    time::Duration,
};

use modbus_mqtt_bridge::{bridge, config::AppConfig};
use rumqttc::{AsyncClient, MqttOptions, QoS};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream},
    time::timeout,
};

struct Broker(Child);

impl Drop for Broker {
    fn drop(&mut self) {
        let _ = self.0.kill();
        let _ = self.0.wait();
    }
}

#[tokio::test]
#[ignore = "requires a local mosquitto executable"]
async fn rejects_invalid_input_and_handles_the_next_command() {
    let port = StdListener::bind(("127.0.0.1", 0))
        .unwrap()
        .local_addr()
        .unwrap()
        .port();
    let mut broker = Broker(
        Command::new("mosquitto")
            .args(["-v", "-p", &port.to_string()])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .expect("install mosquitto before running this test"),
    );
    let mut logs = broker.0.stderr.take().unwrap();
    let (started, ready) = tokio::sync::oneshot::channel();
    let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
    let target = listener.local_addr().unwrap().port();
    std::thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let mut started = Some(started);
        for line in BufReader::new(&mut logs).lines().map_while(Result::ok) {
            if line.contains("Sending SUBACK to modbus-recovery-bridge")
                && let Some(sender) = started.take()
            {
                let _ = sender.send(());
            }
        }
    });
    timeout(Duration::from_secs(5), async {
        while TcpStream::connect(("127.0.0.1", port)).await.is_err() {
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("broker startup");

    let config: AppConfig = serde_yaml::from_str(&format!(
        r"
mqtt: {{ host: 127.0.0.1, port: {port}, client_id: modbus-recovery-bridge }}
sources:
  - id: fixture
    host: 127.0.0.1
    port: {target}
    unit_id: 1
    points:
      - {{ name: fixture, topic: register, address: 0, kind: holding, data_type: u16, access: write_only }}
"
    ))
    .unwrap();
    config.validate().unwrap();
    let mut bridge = tokio::spawn(bridge::run(config));
    timeout(Duration::from_secs(5), ready)
        .await
        .expect("bridge subscription")
        .unwrap();

    let (publisher, mut events) =
        AsyncClient::new(MqttOptions::new("recovery-fixture", "127.0.0.1", port), 4);
    let outgoing = tokio::spawn(async move { while events.poll().await.is_ok() {} });
    for payload in [b"null?".as_slice(), b"42".as_slice()] {
        publisher
            .publish(
                "modbus/fixture/register/set",
                QoS::AtLeastOnce,
                false,
                payload,
            )
            .await
            .unwrap();
    }

    let (mut socket, _) = tokio::select! {
        result = &mut bridge => panic!("bridge exited before handling the valid command: {result:?}"),
        accepted = timeout(Duration::from_secs(5), listener.accept()) => accepted.expect("no Modbus write").unwrap(),
    };
    let mut request = [0; 12];
    timeout(Duration::from_secs(3), socket.read_exact(&mut request))
        .await
        .expect("complete Modbus request")
        .unwrap();
    // Protocol ID, size, unit, write-single-register function, address, and value.
    assert_eq!(&request[2..], &[0, 0, 0, 6, 1, 6, 0, 0, 0, 42]);
    socket.write_all(&request).await.unwrap();
    assert!(
        timeout(Duration::from_millis(250), listener.accept())
            .await
            .is_err(),
        "only the valid command may write to the device"
    );
    bridge.abort();
    outgoing.abort();
}
