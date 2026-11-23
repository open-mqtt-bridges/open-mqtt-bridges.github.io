# Local dependency patch

Source: crates.io `mccs-db 0.1.3`, SHA-256 `3cdaa8fe19a1a1918becc1b8cbbbdc1058bc71411dff4de0a6ec6b5269f49d38`, upstream commit `ea4c48f4badd13e747c3ad5a05e23e500fcd62d0` (`db/`). `COPYING` is the MIT license from that commit.

The normalized `Cargo.toml` uses `serde_yaml 0.9.34`, already used by the bridge, instead of the vulnerable 0.7 line. The bundled monitor data and upstream source are unchanged. `Cargo.toml.orig` remains the upstream manifest. Remove this patch once a compatible released `ddc-hi` dependency chain no longer requires it.
