# Topic Contract

For:

- `base_topic=modbus`
- `source_id=example-device`
- `topic=telemetry/example_float`

Topics:

- State topic: `modbus/example-device/telemetry/example_float`
- Set topic: `modbus/example-device/telemetry/example_float/set`

State payload example:

```json
21.5
```

Write payload examples:

```json
true
```

```json
{"value": 18.0}
```

The bridge logs and discards rejected commands without writing to the device.
An invalid command does not stop the bridge from processing later commands.
