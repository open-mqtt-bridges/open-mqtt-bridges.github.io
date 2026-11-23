FROM rust:1.100.0-bookworm@sha256:ade39a710ef85f3506cffcfec3e8a24ba090badef1dff2fb798f71d878833fea AS build
WORKDIR /build
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
COPY third_party/ third_party/
RUN cargo build --release --locked --bin ping-mqtt-bridge

FROM debian:bookworm-slim@sha256:734a72b3d6142a71993b4bc580ca01d8ca687f77a2c422d96a961d3376b179bc
LABEL org.opencontainers.image.title="Ping MQTT Bridge" \
      org.opencontainers.image.description="Publish Linux ICMP reachability and latency over MQTT" \
      org.opencontainers.image.source="https://github.com/open-mqtt-bridges/ping" \
      org.opencontainers.image.licenses="MIT"
COPY --from=build /build/target/release/ping-mqtt-bridge /usr/local/bin/
COPY LICENSE /usr/share/doc/ping-mqtt-bridge/LICENSE
COPY third_party/rumqttc-0.25.1/LICENSE /usr/share/doc/ping-mqtt-bridge/rumqttc-LICENSE
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/ping-mqtt-bridge"]
CMD ["/etc/ping-mqtt-bridge/bridge.toml"]
