# 0004 · Upstream DNS

- **Status:** Accepted
- **Date:** 2026-09-28
- **Phase:** P0

## Context

Every zone uses `fw-01` as its only DNS server (R05). `fw-01` runs Unbound, originally as a full recursive resolver that starts from the root servers. The lab reaches the Internet through VMware NAT and then the home router (Vodafone/Lowi).

Tests on 2026-09-28 showed that the home router intercepts all outbound DNS on port 53, over UDP and TCP, and answers itself as a recursive resolver, whatever the destination address:

- A query to `a.root-servers.net` (`198.41.0.4`) without recursion (RD=0) came back with `ra` and without `aa`, and with IPv4 glue only.
- A probe sent with IP TTL 1 still got an answer, so the first hop, the router, generates it.
- The result was the same from `fw-01`, from the Windows host and from a laptop on the home Wi-Fi.

Unbound could not prime the root (`failed to get a delegation (eg. prime failure)`). It treated the router's answers as recursive rather than authoritative, and before reaching its fallback (asking again with RD=1) it spent its per-query send limit on the root servers' IPv6 addresses, which fail instantly because `fw-01` has no IPv6 route. `mgmt-01` could not resolve names, which explains the "Bad archive mirror" error in the Debian installer.

Setting `do-ip6: no` restored resolution, but only through that fallback: every lab query was answered by an undeclared resolver in the home network. DNSSEC validation was disabled, and the answers were altered: IPv6 glue and AAAA records were missing.

Community reports point to the router's "DNS seguro" feature. Vodafone does not document it.

## Options considered

| Option | For | Against |
|---|---|---|
| Disable the interception on the router and keep full recursion | No third-party resolver; real iterative resolution | The setting is not documented for Vodafone/Lowi routers in Spain and may come back after a reset or firmware update; recursion stays in clear text to the router and the ISP; changes the home network |
| **DNS over TLS from Unbound to public resolvers, strict** | The router cannot read or alter an authenticated TLS session; failures show as SERVFAIL instead of silent changes; affects only the lab; DNSSEC is still validated on `fw-01` | Trust moves to the resolver operators; depends on TCP 853; no real iterative resolution for exercises that need it |
| Leave it as it is | No work | A home-network resolver nobody chose sees and answers every lab query, filters without saying what, and alters answers |
| Plain forwarding to the router or to the VMware NAT DNS | Simple and explicit | Makes the previous option official without improving it |
| WireGuard tunnel to a VPS that does the recursion | Real iterative resolution | A new component and single point of failure; out of scope for P0 |

## Decision

Unbound forwards every query over DNS over TLS, in the strict profile of RFC 8310:

- Upstreams: Quad9 without blocking (`9.9.9.10`, `149.112.112.10`, name `dns10.quad9.net`) and Cloudflare (`1.1.1.1`, `1.0.0.1`, name `one.one.one.one`), on port 853 with the certificate name verified. They are two independent operators; neither filters answers and neither sends EDNS Client Subnet. When an exercise needs filtering, it stays local, under the lab's control.
- *Forward first* and *Use System Nameservers* are off, so a failure never falls back to plain DNS through the router.
- DNSSEC validation is on, with *Harden DNSSEC Data* (`harden-dnssec-stripped: yes`).
- `do-ip6: no` is set in `/usr/local/etc/unbound.opnsense.d/no-ipv6.conf`, because `fw-01` has no IPv6 route.
- Requires OPNsense 26.7.4 or later, which ships Unbound 1.26.1.

## Consequences

- The lab depends on two external operators. If both fail, or TCP 853 is blocked, lookups fail with SERVFAIL by design. Watch for SERVFAIL spikes and for the Unbound log messages `ssl handshake failed` and `failed to authenticate`.
- `no-ipv6.conf` does not appear in the web GUI or in configuration backups. Recreate it after a reinstall, and remove it if the lab gains IPv6.
- TLS depends on `fw-01`'s clock. At least one NTP server must be configured by IP address, so a wrong clock can be corrected without DNS.
- Lab clients must not bypass `fw-01`: R05, R13 and R15 have to stop direct queries to port 53 and to known DNS over HTTPS services.
- Exercises that need real iterative resolution, such as DNS tunnelling, need their own path (a per-exercise forward zone or a tunnel). Decide before P2.
- The router still intercepts DNS for the rest of the home network. Disabling "DNS seguro" there is optional home maintenance, outside the lab.
- To revert, disable the four DNS over TLS entries and apply.
