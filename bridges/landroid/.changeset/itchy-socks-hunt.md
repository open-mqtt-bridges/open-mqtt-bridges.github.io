---
'landroid-mqtt-bridge': minor
---

Add an MQTT readiness endpoint at `/readyz` without changing `/health`. Readiness tracks the active broker session and its required subscription acknowledgements.
