# MQTT Contract: Controller Availability

| Operation | Topic | Payload | Publish behavior |
| --- | --- | --- | --- |
| Controller availability | `<topic>/connected` | UTF-8 `true` or `false` | QoS 0, non-retained; existing startup and connection transitions plus current-state refresh while MQTT is connected |
| Device command | `<topic>/cmd` | Existing WLED JSON command | Unchanged; commands must be non-retained |
| Command clear | `<topic>/cmd` | Zero bytes | Unchanged; non-retained |

`<topic>` is the existing configured device topic prefix. Authentication and topic permissions are unchanged; consumers still need subscription access. Duplicate availability values are valid. Neither commands nor other state are part of availability replay.

A consumer with an active subscription can recover on the next refresh, nominally within 30 seconds plus bridge tick and delivery latency once both MQTT clients are ready. QoS 0 has no delivery guarantee. After an abrupt bridge exit, this bridge has left no retained availability for a new subscriber. Existing consumer caches are not invalidated by bridge silence.
