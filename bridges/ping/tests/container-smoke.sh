#!/usr/bin/env bash
# Run against a locally built image on a Linux Docker engine.
set -euo pipefail

image="${1:-ping-mqtt-bridge:ci}"
fixture_image=eclipse-mosquitto:2.0.22
tmp=$(mktemp -d)
prefix="ping-smoke-${tmp##*.}"
network="$prefix"
broker="$prefix-broker"
target="$prefix-target"
bridge="$prefix-bridge"
denied="$prefix-denied"

cleanup() {
    local status=$?
    if (( status != 0 )); then
        docker logs "$bridge" >&2 || true
        docker logs "$broker" >&2 || true
    fi
    docker rm -f "$denied" "$bridge" "$target" "$broker" >/dev/null 2>&1 || true
    docker network rm "$network" >/dev/null 2>&1 || true
    rm -f "$tmp/bridge.toml" "$tmp/mosquitto.conf"
    rmdir "$tmp"
}
trap cleanup EXIT

# Docker releases before 29 require an explicit subnet to assign a static IP.
docker network create --internal --subnet 192.0.2.0/24 "$network" >/dev/null
printf 'listener 1883\nallow_anonymous true\npersistence false\n' >"$tmp/mosquitto.conf"
chmod 644 "$tmp/mosquitto.conf"
docker run -d --name "$broker" --network "$network" --network-alias broker \
    -v "$tmp/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro,z" "$fixture_image" >/dev/null
for _ in {1..20}; do
    if docker exec "$broker" mosquitto_pub -h 127.0.0.1 -t smoke/ready -n; then
        break
    fi
    sleep 0.25
done
docker exec "$broker" mosquitto_pub -h 127.0.0.1 -t smoke/ready -n

start_target() {
    docker run -d --name "$target" --network "$network" "$@" \
        --entrypoint sleep "$fixture_image" 120 >/dev/null
}
target_ip=192.0.2.100
start_target --ip "$target_ip" --sysctl net.ipv4.icmp_echo_ignore_all=0
cat >"$tmp/bridge.toml" <<EOF
interval_secs = 1
timeout_ms = 350
parallelism = 1
health_bind = "0.0.0.0:8080"
[broker]
host = "broker"
client_id = "ping-smoke"
[devices]
"Test Device" = "$target_ip"
EOF
chmod 644 "$tmp/bridge.toml"
mount="$tmp/bridge.toml:/etc/ping-mqtt-bridge/bridge.toml:ro,z"
runtime=(--network "$network" --read-only --cap-drop ALL --security-opt no-new-privileges:true -v "$mount")

test "$(docker image inspect -f '{{.Config.User}}' "$image")" = 65532:65532
if denied_output=$(docker run --name "$denied" "${runtime[@]}" \
    --sysctl 'net.ipv4.ping_group_range=1 0' "$image" 2>&1); then
    echo "Bridge unexpectedly started without socket access" >&2
    exit 1
else
    test "$?" -eq 1
fi
grep -Fq 'cannot open an IPv4 ICMP datagram socket' <<<"$denied_output"
if grep -Fq 'bridge started' <<<"$denied_output"; then
    echo "Bridge started before checking socket access" >&2
    exit 1
fi

docker run -d --name "$bridge" --network-alias bridge "${runtime[@]}" \
    --sysctl 'net.ipv4.ping_group_range=65532 65532' "$image" >/dev/null

sample() {
    docker exec "$broker" mosquitto_sub -h 127.0.0.1 -q 1 -t 'stats/ping/Test Device/#' \
        -W 10 -C "$1" -F '%t|%q|%r|%p'
}
positive() {
    local output
    output=$(sample 4)
    grep -Fxq 'stats/ping/Test Device/alive|1|0|true' <<<"$output"
    grep -Eq '^stats/ping/Test Device/time\|1\|0\|[0-9]+(\.[0-9]+)?$' <<<"$output"
}
positive
docker exec "$broker" wget -qO- http://bridge:8080/livez >/dev/null

docker rm -f "$target" >/dev/null
start_target --ip "$target_ip" --sysctl net.ipv4.icmp_echo_ignore_all=1
sleep 2
output=$(sample 3)
test "$(grep -Fxc 'stats/ping/Test Device/alive|1|0|false' <<<"$output")" = 3
docker exec "$broker" wget -qO- http://bridge:8080/readyz | \
    grep -Fq '"broker_connected":true,"probe_engine_healthy":true'

docker rm -f "$target" >/dev/null
start_target --ip "$target_ip" --sysctl net.ipv4.icmp_echo_ignore_all=0
sleep 2
positive
docker stop --time 5 "$bridge" >/dev/null
test "$(docker inspect -f '{{.State.ExitCode}}' "$bridge")" = 0
echo 'Container smoke test passed: non-root, denied socket, reachable, timeout, recovery, health, SIGTERM.'
