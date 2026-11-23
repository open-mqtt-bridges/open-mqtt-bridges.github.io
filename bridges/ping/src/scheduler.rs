//! One bounded sweep at a time. Elapsed ticks are intentionally dropped.

use std::{future::Future, time::Duration};

use futures_util::{StreamExt, stream};
use tokio::time::{Instant, sleep_until};

/// Start immediately and schedule future sweeps on the original interval grid.
/// Dropping this future cancels all outstanding probes without detached work.
pub async fn run<T: Clone, O, F: Future<Output = O>, C: Future<Output = ()>>(
    devices: &[T],
    interval: Duration,
    parallelism: usize,
    mut probe: impl FnMut(T) -> F,
    mut completed: impl FnMut(O) -> C,
) {
    let mut tick = Instant::now();
    loop {
        sleep_until(tick).await;
        let sweep = stream::iter(devices.iter().cloned())
            .map(&mut probe)
            .buffer_unordered(parallelism);
        futures_util::pin_mut!(sweep);
        while let Some(outcome) = sweep.next().await {
            completed(outcome).await;
        }
        let now = Instant::now();
        let remaining =
            interval.as_nanos() - now.duration_since(tick).as_nanos() % interval.as_nanos();
        tick = now + Duration::from_nanos(remaining.try_into().expect("validated interval"));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        cell::RefCell,
        future::{pending, ready},
        rc::Rc,
    };
    use tokio::time::{sleep, timeout};

    #[tokio::test(start_paused = true)]
    async fn limits_concurrency_and_skips_elapsed_ticks() {
        let start = Instant::now();
        let probes = Rc::new(RefCell::new(Vec::new()));
        let scheduler = run(
            &[1, 2, 3],
            Duration::from_secs(5),
            2,
            |id| {
                let probes = Rc::clone(&probes);
                async move {
                    probes.borrow_mut().push((id, start.elapsed().as_secs()));
                    sleep(Duration::from_secs(6)).await;
                }
            },
            |_| ready(()),
        );
        let _ = timeout(Duration::from_secs(16), scheduler).await;
        assert_eq!(*probes.borrow(), [(1, 0), (2, 0), (3, 6), (1, 15), (2, 15)]);
    }

    #[tokio::test(start_paused = true)]
    async fn dropping_scheduler_cancels_in_flight_probes() {
        struct Active(Rc<RefCell<Vec<&'static str>>>);
        impl Drop for Active {
            fn drop(&mut self) {
                self.0.borrow_mut().push("cancel");
            }
        }
        let events = Rc::new(RefCell::new(Vec::new()));
        let scheduler = run(
            &[1, 2, 3],
            Duration::from_secs(5),
            2,
            |_| {
                let events = Rc::clone(&events);
                async move {
                    events.borrow_mut().push("start");
                    let _active = Active(events);
                    pending::<()>().await;
                }
            },
            |_| async { panic!("cancelled probe must not complete") },
        );
        let _ = timeout(Duration::from_secs(1), scheduler).await;
        assert_eq!(*events.borrow(), ["start", "start", "cancel", "cancel"]);
    }
}
