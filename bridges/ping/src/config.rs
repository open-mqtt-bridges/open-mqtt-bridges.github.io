//! Read-only configuration and validation before any workers start.

use std::{
    collections::BTreeMap,
    env, fs,
    net::{Ipv4Addr, SocketAddr},
    path::{Path, PathBuf},
};

use anyhow::{Context, Result, anyhow, ensure};
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub broker: Broker,
    #[serde(default = "default_base_topic")]
    pub base_topic: String,
    #[serde(default = "default_interval")]
    pub interval_secs: u64,
    #[serde(default = "default_timeout")]
    pub timeout_ms: u64,
    #[serde(default = "default_parallelism")]
    pub parallelism: usize,
    #[serde(default = "default_health_bind")]
    pub health_bind: SocketAddr,
    pub devices: BTreeMap<String, Ipv4Addr>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Broker {
    pub host: String,
    #[serde(default = "default_port")]
    pub port: u16,
    pub client_id: String,
    #[serde(default)]
    pub tls: bool,
    pub ca_file: Option<PathBuf>,
}

pub struct Credentials {
    pub username: String,
    pub password: Option<String>,
}

impl Config {
    pub fn load(path: &Path) -> Result<Self> {
        let text = fs::read_to_string(path)
            .with_context(|| format!("cannot read config {}", path.display()))?;
        Self::parse(&text)
    }

    fn parse(text: &str) -> Result<Self> {
        // TOML's display formatter includes the input line, which might contain a secret.
        let config: Self = toml::from_str(text).map_err(|error: toml::de::Error| {
            let offset = error.span().map_or(0, |span| span.start);
            let line = text.as_bytes()[..offset.min(text.len())]
                .iter()
                .filter(|&&byte| byte == b'\n')
                .count()
                + 1;
            anyhow!(
                "invalid configuration near line {line}; check field names, types, and duplicates"
            )
        })?;
        config.validate()?;
        Ok(config)
    }

    fn validate(&self) -> Result<()> {
        ensure!(
            !self.broker.host.is_empty() && !self.broker.host.contains(char::is_whitespace),
            "broker.host must be a hostname or IP address without whitespace"
        );
        ensure!(self.broker.port > 0, "broker.port must be positive");
        ensure!(
            !self.broker.client_id.is_empty() && valid_mqtt_text(&self.broker.client_id),
            "broker.client_id must contain 1–65535 bytes of MQTT text"
        );
        ensure!(
            self.broker.tls || self.broker.ca_file.is_none(),
            "broker.ca_file requires broker.tls=true"
        );
        ensure!(
            self.base_topic.split('/').all(valid_topic_segment),
            "base_topic must consist of nonempty segments without MQTT wildcards or control characters"
        );
        ensure!(
            (1..=86_400).contains(&self.interval_secs),
            "interval_secs must be in 1–86400"
        );
        ensure!(
            (1..=60_000).contains(&self.timeout_ms),
            "timeout_ms must be in 1–60000"
        );
        ensure!(
            (1..=256).contains(&self.parallelism),
            "parallelism must be in 1–256"
        );
        ensure!(
            (1..=4096).contains(&self.devices.len()),
            "configure 1–4096 devices"
        );
        for (id, ip) in &self.devices {
            ensure!(
                valid_topic_segment(id)
                    && self.base_topic.len() + id.len() + "/".len() + "/alive".len()
                        <= u16::MAX as usize,
                "device ID or resulting topic is invalid"
            );
            ensure!(
                !ip.is_unspecified() && !ip.is_multicast() && !ip.is_broadcast(),
                "device addresses must be unicast IPv4"
            );
        }
        Ok(())
    }
}

impl Credentials {
    pub fn load() -> Result<Option<Self>> {
        Self::from_sources(|name| match env::var(name) {
            Ok(value) => Ok(Some(value)),
            Err(env::VarError::NotPresent) => Ok(None),
            Err(env::VarError::NotUnicode(_)) => Err(anyhow!("{name} must be UTF-8")),
        })
    }

    fn from_sources(
        mut lookup: impl FnMut(&str) -> Result<Option<String>>,
    ) -> Result<Option<Self>> {
        let username = read_secret(&mut lookup, "MQTT_USERNAME", "MQTT_USERNAME_FILE")?;
        let password = read_secret(&mut lookup, "MQTT_PASSWORD", "MQTT_PASSWORD_FILE")?;
        ensure!(
            username.is_some() || password.is_none(),
            "MQTT password requires a username"
        );
        ensure!(
            username
                .as_ref()
                .is_none_or(|name| !name.is_empty() && valid_mqtt_text(name)),
            "MQTT username must contain 1–65535 bytes of MQTT text"
        );
        ensure!(
            password
                .as_ref()
                .is_none_or(|password| password.len() <= u16::MAX as usize),
            "MQTT password must contain at most 65535 bytes"
        );
        Ok(username.map(|username| Self { username, password }))
    }
}

fn read_secret(
    lookup: &mut impl FnMut(&str) -> Result<Option<String>>,
    direct: &str,
    file: &str,
) -> Result<Option<String>> {
    match (lookup(direct)?, lookup(file)?) {
        (Some(_), Some(_)) => Err(anyhow!("set either {direct} or {file}, not both")),
        (None, Some(path)) => {
            let text = fs::read_to_string(path)
                .map_err(|_| anyhow!("cannot read UTF-8 secret from {file}"))?;
            let value = text
                .strip_suffix("\r\n")
                .or_else(|| text.strip_suffix('\n'))
                .unwrap_or(&text);
            Ok(Some(value.to_owned()))
        }
        (value, None) => Ok(value),
    }
}

fn valid_mqtt_text(value: &str) -> bool {
    value.len() <= u16::MAX as usize
        && !value.chars().any(|c| {
            let code = c as u32;
            c.is_control() || (0xfdd0..=0xfdef).contains(&code) || (code & 0xffff) >= 0xfffe
        })
}

fn valid_topic_segment(value: &str) -> bool {
    !value.trim().is_empty() && !value.contains(['/', '+', '#']) && valid_mqtt_text(value)
}

fn default_base_topic() -> String {
    "stats/ping".into()
}
fn default_interval() -> u64 {
    30
}
fn default_timeout() -> u64 {
    5000
}
fn default_parallelism() -> usize {
    16
}
fn default_port() -> u16 {
    1883
}

fn default_health_bind() -> SocketAddr {
    SocketAddr::from(([127, 0, 0, 1], 8080))
}

#[cfg(test)]
mod tests {
    use super::*;

    const BROKER: &str = "[broker]\nhost = 'mqtt.example.invalid'\nclient_id = 'ping-test'\n";
    const DEVICES: &str = "[devices]\n'Device A' = '192.0.2.1'\n";

    #[test]
    fn defaults_preserve_legacy_topic_and_timeout() {
        let config = Config::parse(&format!("{BROKER}{DEVICES}")).unwrap();
        assert_eq!(config.base_topic, "stats/ping");
        assert_eq!(config.timeout_ms, 5000);
        assert_eq!(config.broker.port, 1883);
        assert!(config.devices.contains_key("Device A"));
    }

    #[test]
    fn rejects_invalid_values_and_duplicate_ids() {
        for invalid in [
            format!("{BROKER}{DEVICES}'Device A' = '192.0.2.2'"),
            format!("{BROKER}[devices]\nfoo = '::1'"),
            format!("{BROKER}[devices]\nfoo = '224.0.0.1'"),
            format!("{BROKER}[devices]\n'foo/bar' = '192.0.2.1'"),
            format!("{BROKER}[devices]\n'foo+' = '192.0.2.1'"),
            format!("base_topic = 'stats//ping'\n{BROKER}{DEVICES}"),
            format!("base_topic = 'stats/#'\n{BROKER}{DEVICES}"),
            format!("interval_secs = 0\n{BROKER}{DEVICES}"),
            format!("timeout_ms = 60001\n{BROKER}{DEVICES}"),
            format!("parallelism = 0\n{BROKER}{DEVICES}"),
            format!("{BROKER}ca_file = '/example.pem'\n{DEVICES}"),
            format!("{BROKER}port = 0\n{DEVICES}"),
        ] {
            assert!(Config::parse(&invalid).is_err(), "{invalid}");
        }
    }

    #[test]
    fn credentials_are_separate_and_conflicting_sources_are_rejected() {
        let credentials = Credentials::from_sources(|key| {
            Ok(match key {
                "MQTT_USERNAME" => Some("bridge".into()),
                "MQTT_PASSWORD" => Some("example".into()),
                _ => None,
            })
        })
        .unwrap()
        .unwrap();
        assert_eq!(credentials.username, "bridge");
        assert_eq!(credentials.password.as_deref(), Some("example"));
        assert!(Credentials::from_sources(|_| Ok(Some("example".into()))).is_err());
        assert!(
            Credentials::from_sources(|key| Ok((key == "MQTT_PASSWORD").then(|| "example".into())))
                .is_err()
        );
        assert!(Credentials::from_sources(|_| Ok(None)).unwrap().is_none());
    }

    #[test]
    fn parse_error_does_not_echo_input() {
        let err = Config::parse(&format!("{BROKER}password = 'private'\n{DEVICES}"))
            .err()
            .unwrap();
        assert!(!err.to_string().contains("private"));
    }
}
