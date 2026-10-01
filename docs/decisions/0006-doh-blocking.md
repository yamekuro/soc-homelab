# 0006 · Blocking DNS over HTTPS

- **Status:** Accepted
- **Date:** 2026-10-01
- **Phase:** P0

## Context

[Decision 0004](0004-upstream-dns.md) makes `fw-01` the only DNS server for the lab and requires that clients cannot bypass it, either directly on port 53 or through known DNS over HTTPS (DoH) services.

With the P0 rules in place, plain DNS (port 53) and DNS over TLS (port 853) to the Internet are already blocked: R13 only allows TCP 80 and 443, so both fall to R15. DoH over HTTP/3 uses UDP 443, which R15 also blocks. DoH over TCP 443 is different, because R13 lets it through. On 2026-10-01, before the rule below existed, `mgmt-01` could open a TCP connection to `1.1.1.1:443`.

## Options considered

| Option | For | Against |
|---|---|---|
| **Block the resolver addresses that the large operators publish, before R13** | No third-party list; the addresses serve DNS, so ordinary websites are not affected; easy to verify | Misses less-known DoH services and DoH served from shared CDN addresses; the list is maintained by hand |
| URL table alias fed by a public DoH address blocklist | Broad coverage, updated daily | A third-party dependency; shared CDN addresses can block unrelated websites; another moving part in P0 |
| Block DoH host names in Unbound, plus Firefox's canary domain | Stops clients that look up their DoH server through `fw-01`; the canary turns off Firefox's default DoH | Does not stop clients with hard-coded addresses; the canary only works with a negative answer (an error code, or no A or AAAA record) and does not apply when the user turned DoH on |
| TLS inspection | Sees the real destination | Out of scope; breaks certificate pinning; heavy and intrusive |

## Decision

- R13a, in every zone that has R13: block any protocol from the zone network to the `PUBLIC_DNS` alias, with logging, evaluated before R13.
- `PUBLIC_DNS` holds the 24 IPv4 addresses that the operators publish:
  - Cloudflare: `1.1.1.1`, `1.0.0.1`, `1.1.1.2`, `1.0.0.2`, `1.1.1.3`, `1.0.0.3`.
  - Google: `8.8.8.8`, `8.8.4.4`.
  - Quad9: `9.9.9.9`, `149.112.112.112`, `9.9.9.10`, `149.112.112.10`, `9.9.9.11`, `149.112.112.11`.
  - AdGuard: `94.140.14.14`, `94.140.15.15`, `94.140.14.15`, `94.140.15.16`, `94.140.14.140`, `94.140.14.141`.
  - OpenDNS: `208.67.222.222`, `208.67.220.220`, `208.67.222.123`, `208.67.220.123`.
- Name-based blocking in Unbound, including the canary domain `use-application-dns.net`, is added in P1, before the USERS zone gets browsers.

Sources: [Cloudflare](https://developers.cloudflare.com/1.1.1.1/ip-addresses/), [Google](https://developers.google.com/speed/public-dns/docs/using), [Quad9](https://www.quad9.net/service/service-addresses-and-features), [AdGuard](https://adguard-dns.io/en/public-dns.html), [OpenDNS](https://support.opendns.com/hc/en-us/articles/360038086532-Using-DNS-over-HTTPS-DoH-with-OpenDNS) and [Mozilla's canary domain](https://support.mozilla.org/en-US/kb/canary-domain-use-application-dnsnet).

## Consequences

- Lab clients cannot reach these addresses on any port, not only 443. That includes the website Cloudflare serves on `1.1.1.1`.
- `fw-01`'s own traffic is not affected: its DNS over TLS to Quad9 and Cloudflare and its NTP to Cloudflare leave from the firewall itself, and zone rules only filter traffic that enters from a zone.
- Hits on R13a in the firewall log show attempts to bypass `fw-01`.
- Review the list when an operator publishes new addresses. Until P1, a client could still reach a less-known DoH service.
- To revert, disable R13a and apply.
