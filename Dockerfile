FROM rust:1.91.1-bookworm@sha256:c1e5f19e773b7878c3f7a805dd00a495e747acbdc76fb2337a4ebf0418896b33 AS build
WORKDIR /build
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo build --release --locked --bin ping-mqtt-bridge

FROM debian:bookworm-slim@sha256:734a72b3d6142a71993b4bc580ca01d8ca687f77a2c422d96a961d3376b179bc
LABEL org.opencontainers.image.title="Ping MQTT Bridge" \
      org.opencontainers.image.description="Publish Linux ICMP reachability and latency over MQTT" \
      org.opencontainers.image.source="https://github.com/open-mqtt-bridges/ping" \
      org.opencontainers.image.licenses="MIT"
COPY --from=build /build/target/release/ping-mqtt-bridge /usr/local/bin/
COPY LICENSE /usr/share/doc/ping-mqtt-bridge/LICENSE
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/ping-mqtt-bridge"]
CMD ["/etc/ping-mqtt-bridge/bridge.toml"]
