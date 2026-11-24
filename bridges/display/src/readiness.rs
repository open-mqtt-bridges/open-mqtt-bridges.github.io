use std::{
    net::{Ipv4Addr, SocketAddrV4},
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering::Relaxed},
    },
    time::Duration,
};

use anyhow::{Context, Result, ensure};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream},
    time::timeout,
};

fn address() -> Result<Option<SocketAddrV4>> {
    std::env::var_os("BRIDGE_READY_PORT")
        .map(|port| {
            let port: u16 = port
                .to_str()
                .context("invalid BRIDGE_READY_PORT")?
                .parse()?;
            ensure!(port != 0, "BRIDGE_READY_PORT must be nonzero");
            Ok(SocketAddrV4::new(Ipv4Addr::LOCALHOST, port))
        })
        .transpose()
}

pub async fn start() -> Result<Arc<AtomicBool>> {
    let ready = Arc::new(AtomicBool::new(false));
    if let Some(address) = address()? {
        let listener = TcpListener::bind(address)
            .await
            .context("could not bind local readiness probe")?;
        let state = Arc::clone(&ready);
        tokio::spawn(async move {
            while let Ok((mut stream, _)) = listener.accept().await {
                let value = if state.load(Relaxed) { b"1" } else { b"0" };
                let _ = timeout(Duration::from_secs(1), stream.write_all(value)).await;
            }
        });
    }
    Ok(ready)
}

pub async fn check() -> Result<()> {
    let address = address()?.context("BRIDGE_READY_PORT is not configured")?;
    let value = timeout(Duration::from_secs(2), async {
        TcpStream::connect(address).await?.read_u8().await
    })
    .await??;
    ensure!(value == b'1', "bridge is not ready");
    Ok(())
}
