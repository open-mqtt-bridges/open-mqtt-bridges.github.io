# Boundaries

The loader takes a bridge-owned schema and returns the inferred validated value. The MQTT factory takes validated broker settings, resolves the effective ID and returns a client. The caller owns subscriptions, errors and teardown. Neither library owns global config, persistent data or a singleton connection.
