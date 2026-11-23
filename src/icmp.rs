//! Linux ping sockets; the kernel assigns each socket's echo identifier.

use std::{
    io,
    mem::{self, size_of},
    net::{Ipv4Addr, SocketAddrV4},
    os::fd::AsRawFd,
    sync::atomic::{AtomicU64, Ordering},
    time::{Duration, Instant},
};

use anyhow::{Context, Result};
use socket2::{Domain, Protocol, Socket, Type};
use tokio::{net::UdpSocket, time};

static NEXT_TOKEN: AtomicU64 = AtomicU64::new(0);
const PACKET_SIZE: usize = 16;

/// A remote outcome is publishable; a local failure is not.
#[derive(Debug, PartialEq, Eq)]
pub enum Outcome {
    Reply(Duration),
    Unreachable,
    Timeout,
}

/// Fail startup if the runtime user cannot open a Linux ping socket.
pub fn check_access() -> Result<()> {
    open().map(drop).context(
        "cannot open an IPv4 ICMP datagram socket; allow the service GID in this network namespace's net.ipv4.ping_group_range",
    )
}

fn open() -> io::Result<Socket> {
    let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::ICMPV4))?;
    socket.set_nonblocking(true)?;
    let enabled: libc::c_int = 1;
    // SAFETY: enabled points to a valid IP_RECVERR integer option for this call.
    let result = unsafe {
        libc::setsockopt(
            socket.as_raw_fd(),
            libc::IPPROTO_IP,
            libc::IP_RECVERR,
            (&enabled as *const libc::c_int).cast(),
            size_of::<libc::c_int>() as libc::socklen_t,
        )
    };
    if result == -1 {
        return Err(io::Error::last_os_error());
    }
    Ok(socket)
}

/// Probe a single address, using a fresh kernel identifier and a per-probe token.
pub async fn probe(address: Ipv4Addr, timeout: Duration) -> io::Result<Outcome> {
    let socket = open()?;
    socket.connect(&SocketAddrV4::new(address, 0).into())?;
    let socket = UdpSocket::from_std(socket.into())?;
    let token = NEXT_TOKEN.fetch_add(1, Ordering::Relaxed).to_be_bytes();
    let mut request = [0; PACKET_SIZE];
    request[0] = 8; // Echo request
    request[6..8].copy_from_slice(&token[6..]);
    request[8..].copy_from_slice(&token);

    let started = Instant::now();
    let result = time::timeout(timeout, async {
        if socket.send(&request).await? != request.len() {
            return Err(io::Error::other("truncated ICMP echo send"));
        }
        let mut reply = [0; PACKET_SIZE + 1];
        loop {
            match socket.recv(&mut reply).await {
                Ok(n) if is_echo_reply(&reply[..n], &request) => {
                    return Ok(Outcome::Reply(started.elapsed()));
                }
                Ok(_) => {}
                Err(error) => {
                    if remote_unreachable(&socket)? {
                        return Ok(Outcome::Unreachable);
                    }
                    return Err(error);
                }
            }
        }
    })
    .await;
    result.unwrap_or(Ok(Outcome::Timeout))
}

fn is_echo_reply(reply: &[u8], request: &[u8; PACKET_SIZE]) -> bool {
    reply.len() == PACKET_SIZE && reply[0..2] == [0, 0] && reply[6..] == request[6..]
}

fn remote_unreachable(socket: &UdpSocket) -> io::Result<bool> {
    // Aligned control storage for cmsghdr and the extended error plus offender.
    let mut control = [0usize; 16];
    // SAFETY: a zeroed msghdr has only zero counts and null pointers.
    let mut message: libc::msghdr = unsafe { mem::zeroed() };
    message.msg_control = control.as_mut_ptr().cast();
    message.msg_controllen = size_of::<[usize; 16]>();
    // SAFETY: msg_control points to writable storage of msg_controllen bytes.
    let result = unsafe {
        libc::recvmsg(
            socket.as_raw_fd(),
            &mut message,
            libc::MSG_ERRQUEUE | libc::MSG_DONTWAIT,
        )
    };
    if result == -1 {
        let error = io::Error::last_os_error();
        return if error.kind() == io::ErrorKind::WouldBlock {
            Ok(false)
        } else {
            Err(error)
        };
    }
    // SAFETY: recvmsg filled the ancillary buffer; the CMSG helpers traverse its bounds.
    unsafe {
        let mut header = libc::CMSG_FIRSTHDR(&message);
        while !header.is_null() {
            if (*header).cmsg_level == libc::IPPROTO_IP
                && (*header).cmsg_type == libc::IP_RECVERR
                && (*header).cmsg_len
                    >= libc::CMSG_LEN(size_of::<libc::sock_extended_err>() as u32) as usize
            {
                let error = libc::CMSG_DATA(header)
                    .cast::<libc::sock_extended_err>()
                    .read_unaligned();
                return Ok(error.ee_origin == libc::SO_EE_ORIGIN_ICMP && error.ee_type == 3);
            }
            header = libc::CMSG_NXTHDR(&message, header);
        }
    }
    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn correlates_reply_type_sequence_and_token() {
        let request = [8, 0, 0, 0, 0, 0, 12, 34, 1, 2, 3, 4, 5, 6, 7, 8];
        let mut reply = request;
        reply[..6].copy_from_slice(&[0, 0, 200, 10, 33, 44]);
        assert!(is_echo_reply(&reply, &request));
        assert!(!is_echo_reply(&reply[..15], &request));
        for index in [0, 1, 6, 15] {
            let mut invalid = reply;
            invalid[index] ^= 1;
            assert!(!is_echo_reply(&invalid, &request));
        }
    }
}
