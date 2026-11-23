# Local dependency patch

Source: crates.io `rumqttc 0.25.1`, SHA-256 `0feff8d882bff0b2fddaf99355a10336d43dd3ed44204f85ece28cf9626ab519`, upstream commit `f1e9e8d558783f942993046679cdf3c8c3a3d36b` (`rumqttc/`). The Apache-2.0 license is from the same upstream commit. The crate's standalone lockfile is omitted; the bridge owns the resolution.

The normalized `Cargo.toml` requires `rustls-webpki 0.103.13` or later in the 0.103 line rather than `0.102.8`. No source code, transport feature, or trust policy changes. `Cargo.toml.orig` remains the original upstream manifest. Remove this patch once a compatible released `rumqttc` no longer resolves the vulnerable `rustls-webpki` branch.
