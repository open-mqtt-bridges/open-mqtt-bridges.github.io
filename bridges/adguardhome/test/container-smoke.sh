#!/usr/bin/env bash
# Verify the packaged runtime with a non-root user and a read-only environment file.
set -euo pipefail
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
image="${1:-adguard-mqtt-bridge:ci}"
test "$(docker image inspect -f '{{.Config.User}}' "$image")" = node
test "$(docker run --rm --network none --entrypoint node "$image" -p 'process.getuid()')" = 1000
bash "$root/scripts/check-native-readiness.sh" adguardhome "$image"
