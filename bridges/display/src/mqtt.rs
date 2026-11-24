use anyhow::{Context, Result};
use rumqttc::{AsyncClient, QoS};
use serde::Serialize;
use tracing::{debug, trace};

use crate::protocol::{Publication, Status};

#[derive(Clone)]
pub struct Publisher {
    client: AsyncClient,
    topic: String,
}

impl Publisher {
    pub fn new(client: AsyncClient, topic: &str) -> Self {
        Self {
            client,
            topic: topic.trim_matches('/').to_owned(),
        }
    }

    pub fn command_topic(&self) -> String {
        format!("{}/cmd", self.topic)
    }

    pub fn try_subscribe_to_commands(&self, topic: &str) -> Result<()> {
        debug!(%topic, "subscribing to MQTT command topic");
        self.client
            .try_subscribe(topic, QoS::AtLeastOnce)
            .context("could not subscribe to command topic")
    }

    pub fn publish_status(&self, status: &Status) -> Result<()> {
        self.publish("status", status)
    }

    pub fn publish_details(&self, publications: Vec<Publication>) -> Result<()> {
        for publication in publications {
            self.publish(&publication.topic_suffix, &publication.payload)?;
        }
        Ok(())
    }

    fn publish<T: Serialize>(&self, suffix: &str, value: &T) -> Result<()> {
        let topic = format!("{}/{}", self.topic, suffix);
        let payload = serde_json::to_vec(value).context("could not serialize MQTT payload")?;
        trace!(%topic, bytes = payload.len(), "publishing retained MQTT payload");
        // This caller also drives the event loop that drains the request queue.
        self.client
            .try_publish(&topic, QoS::AtLeastOnce, true, payload)
            .with_context(|| format!("could not publish MQTT topic {topic}"))
    }
}
