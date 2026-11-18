---
'wled-mqtt-bridge': patch
---

Refresh non-retained WLED availability every 30 seconds so late and reconnecting MQTT subscribers recover current status without reconnecting controllers. Do not queue outdated availability during broker outages. Command behavior and retention are unchanged.
