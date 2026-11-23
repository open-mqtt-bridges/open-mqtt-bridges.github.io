//! Health describes the bridge, not the reachability of monitored devices.

use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering::Relaxed};

use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use serde::Serialize;
use std::sync::Arc;

#[derive(Default)]
pub struct Health {
    broker_connected: AtomicBool,
    local_probe_failures: AtomicUsize,
}

impl Health {
    pub fn set_broker(&self, connected: bool) {
        self.broker_connected.store(connected, Relaxed);
    }

    pub fn broker_connected(&self) -> bool {
        self.broker_connected.load(Relaxed)
    }

    /// Update the count only when a device changes between local fault and non-fault.
    pub fn update_probe(&self, previously_failed: bool, failed: bool) {
        match (previously_failed, failed) {
            (false, true) => {
                self.local_probe_failures.fetch_add(1, Relaxed);
            }
            (true, false) => {
                self.local_probe_failures.fetch_sub(1, Relaxed);
            }
            _ => (),
        }
    }
}

#[derive(Serialize)]
struct Readiness {
    broker_connected: bool,
    probe_engine_healthy: bool,
}

pub fn routes(health: Arc<Health>) -> Router {
    Router::new()
        .route("/livez", get(|| async { StatusCode::OK }))
        .route("/readyz", get(readiness))
        .with_state(health)
}

async fn readiness(State(health): State<Arc<Health>>) -> (StatusCode, Json<Readiness>) {
    let state = Readiness {
        broker_connected: health.broker_connected(),
        probe_engine_healthy: health.local_probe_failures.load(Relaxed) == 0,
    };
    let status = if state.broker_connected && state.probe_engine_healthy {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };
    (status, Json(state))
}
