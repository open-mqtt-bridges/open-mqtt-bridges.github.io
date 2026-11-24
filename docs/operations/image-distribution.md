# Bridge image distribution

The installation reference in a guide or Compose file is not necessarily the namespace authorized to publish releases. The publisher allowlist remains [`.github/bridge-publishers.json`](../../.github/bridge-publishers.json). Ping is build-only; use its [getting-started guide](../bridges/ping/getting-started.md), not a registry reference.

## Verified public references

On 2026-11-24 at 13:05 UTC, an anonymous GHCR bearer-token request followed by a manifest request resolved all nine documented legacy `latest` refs with HTTP `200`. No registry account or saved Docker credential was used. The organizational publisher refs all returned HTTP `401` at anonymous token issuance; no public digest was observable for those refs. This is an access blocker for a public cutover, not proof that a package or its tags do not exist.

```text
Bridge       Documented install :latest                        Configured publisher
adguardhome  ghcr.io/tobiaswaelde/adguard-mqtt-bridge             ghcr.io/open-mqtt-bridges/adguardhome
display      ghcr.io/tobiaswaelde/displays-mqtt-bridge            ghcr.io/open-mqtt-bridges/display
homeconnect  ghcr.io/tobiaswaelde/homeconnect-mqtt-bridge         ghcr.io/open-mqtt-bridges/homeconnect
landroid     ghcr.io/tobiaswaelde/landroid-mqtt-bridge            ghcr.io/open-mqtt-bridges/landroid
modbus       ghcr.io/tobiaswaelde/modbus-mqtt-bridge              ghcr.io/open-mqtt-bridges/modbus
philips-hue  ghcr.io/tobiaswaelde/hue-mqtt-bridge                 ghcr.io/open-mqtt-bridges/philips-hue
pocketbase   ghcr.io/tobiaswaelde/pocketbase-mqtt-bridge          ghcr.io/open-mqtt-bridges/pocketbase
roborock     ghcr.io/tobiaswaelde/roborock-mqtt-bridge            ghcr.io/open-mqtt-bridges/roborock
wled         ghcr.io/tobiaswaelde/wled-mqtt-bridge                ghcr.io/open-mqtt-bridges/wled
```

Observed legacy manifest digests:

```text
adguardhome sha256:bb4d16fa1f6f7a04fb10a5433122b689eff2049c28cb110488455d631a26abaf
display     sha256:3322dcec48f8cb6e0b7f16a953dd205234282fb9c74772ccd575004021971c25
homeconnect sha256:40dbb3838e8f9bae9c56005dca3c12cecb1aeb7fb9dad3da1e4926bad2f1545a
landroid    sha256:0cf7d19868fa6dac94a230ae835fc4ef6a3097875c32a357ee941bb62f74ea12
modbus      sha256:ecf513ee967794397d3c1695dc72508b288ee160d086db73a31e9940edf97d3d
philips-hue sha256:42ed8d10664f5ecf62d7e915fd793e271527c3067ea48c6bb9ccbcd4b5f295ad
pocketbase  sha256:b84c84297c7daa4f07720f183de93ea12f20d17a0a9e9dd12e12ad5730068cfb
roborock    sha256:99604b34246c3e254f79a3f923873fd7dd2b68c4b84fc88761b88b2adf92a4db
wled        sha256:d00b80a1d2d020749b1ec71ccf91e2b7baa43cf601a4c52400ef05967fa57926
```

## Before changing an installation reference

1. The package administrator must verify owning namespace, package visibility, publishing access, intended architectures, and the confirmed candidate digest. Decide separately whether to keep the legacy install refs, provide a verified public mirror, or make the organizational ref public. Do not change visibility or grants based on this runbook alone.
2. With explicit approval, verify both the immutable tag and the required alias from a clean anonymous client. Pull and smoke the intended architecture and compare the digest with the verified build. Only after that may docs and Compose change together for the affected bridge.
3. Preserve prior known-good refs. To roll back, pin the last verified digest on the prior repository with `ghcr.io/<repository>@sha256:<digest>` and recheck the running bridge. Record the rollback and do not overwrite an immutable tag.
