# MQTT contract

### Commands

Commands are sent via the MQTT topic:

```bash
${TOPIC}/cmd
```

After a command is executed, the value is reset to `null`.

Available commands:
- []

#### Push Status
Fetch status information and publish to `${TOPIC}/status`.

##### Command
```jsonc
// ${TOPIC}/cmd
{ "cmd": "push-status" }
```

##### Response
```jsonc
// ${TOPIC}/status
{
  "version": "v0.107.44",
  "language": "en",
  "dns_addresses": ["10.8.12.61"],
  "dns_port": 53,
  "http_port": 80,
  "protection_disabled_duration": 0,
  "protection_enabled": true,
  "dhcp_available": true,
  "running": true
}
```

#### Push Stats
Fetch stats and publish to `${TOPIC}/stats`.

##### Command
```jsonc
// ${TOPIC}/cmd
{ "cmd": "push-stats" }
```

##### Response
```jsonc
// ${TOPIC}/stats
{
	"time_units": "days",
	"top_queried_domains": [
		{ "sync-v2.brave.com": 428658 }
		// ...
	],
	"top_clients": [
		{ "10.8.30.1": 3204062 }
		// ...
	],
	"top_blocked_domains": [
		{ "mobile.events.data.microsoft.com": 258262 }
		// ...
	],
	"top_upstreams_responses": [
		{ "1.0.0.1:53": 1885549 }
		// ...
	],
	"top_upstreams_avg_time": [
		{ "[2a0f:fc81::]:53": 1.7113734150943394 }
		// ...
	],
	"dns_queries": [ 80787, 81381, 88380, /* ... */ ],
	"blocked_filtering": [0, 2,	0, /* ... */ ],
	"replaced_safebrowsing": [0, 0, 0,	/* ... */	],
	"replaced_parental": [ 0, 0, 0, /* ... */	],
	"num_dns_queries": 7801700,
	"num_blocked_filtering": 1926932,
	"num_replaced_safebrowsing": 1832,
	"num_replaced_safesearch": 0,
	"num_replaced_parental": 0,
	"avg_processing_time": 0.025186
}
```

#### Set Protection
Enable or disable protection, then fetch status & publish to `${TOPIC}/status`.

##### Command
###### Enable
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "set-protection",
  "value":{
    "enabled": true
  }
}
```

###### Disable
```jsonc
// ${TOPIC}/cmd
{
  "cmd": "set-protection",
  "value":{
    "enabled": false,
    "duration": 10000, // optionally provide duration in ms, after that time has passed protection will be automatically enabled again
  }
}
```


