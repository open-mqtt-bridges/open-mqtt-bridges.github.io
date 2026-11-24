#!/usr/bin/env bash
# Check one built bridge against a disposable local broker. No device credentials or ports are required.
set -euo pipefail
slug=${1:?bridge slug is required}
image=${2:?local bridge image is required}
tmp=$(mktemp -d)
prefix="omb-ready-${tmp##*.}"
bridge="$prefix-bridge"
broker="$prefix-broker"

cleanup() {
  local status=$?
  if (( status != 0 )); then
    docker logs "$bridge" >&2 || true
    docker logs "$broker" >&2 || true
  fi
  docker rm -f "$bridge" "$broker" >/dev/null 2>&1 || true
  docker network rm "$prefix" >/dev/null 2>&1 || true
  rm -f "$tmp/bridge.yml" "$tmp/mosquitto.conf"
  rmdir "$tmp"
}
trap cleanup EXIT

printf 'listener 1883\nallow_anonymous true\npersistence false\n' > "$tmp/mosquitto.conf"
runtime=()
case "$slug" in
  display)
    printf 'mqtt: {host: broker}\ntopic: readiness/display\n' > "$tmp/bridge.yml"
    runtime=(-v "$tmp/bridge.yml:/app/config/config.yml:ro")
    probe=(displays-mqtt-bridge --readycheck)
    ;;
  modbus)
    cat > "$tmp/bridge.yml" <<'EOF'
mqtt: {host: broker}
sources:
  - id: fixture
    host: 127.0.0.1
    unit_id: 1
    points:
      - {name: fixture, topic: register, address: 0, kind: holding, data_type: u16, access: write_only}
EOF
    runtime=(-v "$tmp/bridge.yml:/app/config/config.yml:ro")
    probe=(/modbus-mqtt-bridge --readycheck)
    ;;
  adguardhome)
    cat > "$tmp/bridge.yml" <<'EOF'
MQTT_HOST=broker
MQTT_USERNAME=fixture
MQTT_PASSWORD=fixture
ADGUARD_HOST=http://127.0.0.1:9
ADGUARD_USERNAME=fixture
ADGUARD_PASSWORD=fixture
ADGUARD_POLL_INTERVAL=0
EOF
    runtime=(--read-only -v "$tmp/bridge.yml:/app/.env:ro")
    probe=(node readycheck.cjs)
    ;;
  *) echo "No native readiness fixture for $slug" >&2; exit 2 ;;
esac
chmod 644 "$tmp/"*
docker network create --internal "$prefix" >/dev/null
docker create --name "$broker" --network "$prefix" --network-alias broker \
  -v "$tmp/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro" eclipse-mosquitto:2.0.22 >/dev/null
docker run -d --name "$bridge" --network "$prefix" "${runtime[@]}" "$image" >/dev/null

check() { docker exec "$bridge" "${probe[@]}" >/dev/null 2>&1; }
expect() {
  local expected=$1
  for _ in {1..40}; do
    test "$(docker inspect -f '{{.State.Running}}' "$bridge")" = true || return 1
    if check; then
      if [[ "$expected" = ready ]]; then return 0; fi
    else
      if [[ "$expected" = unready ]]; then return 0; fi
    fi
    sleep 0.5
  done
  echo "$slug did not become $expected" >&2
  return 1
}

expect unready
docker start "$broker" >/dev/null
expect ready
docker stop --time 1 "$broker" >/dev/null
expect unready
docker start "$broker" >/dev/null
expect ready
echo "$slug readiness passed: startup, broker connection, loss, recovery"
