# P1 network work · public summary

This replaces the public presentation of the detailed operating journal. The original journal is retained separately; it contains access data, hardware identifiers, precise observations and full procedural context that are not needed in a portfolio.

## Observed configuration

Five internal zones were assigned. The principal IPv4 rule order and active 24-member resolver table were reviewed. The bastion telemetry exception is before the final deny, and DMZ service exceptions are before its lab-network block. The [policy guide](../docs/firewall-policy.md) contains all 34 manual rows and their rationale.

## Tested and pending

MGMT has scoped DNS and time observations, a valid HTTPS control and three firewall-correlated TCP negatives. The [evidence summary](../docs/evidence-summary.md) states exactly what those samples establish. Other clients, DHCP offers and positive local names, browser behavior, complete DoT failure behavior and full state/NAT/IPv6 review remain pending.

## Next deployment

Wazuh and new sources remain planned. The all-in-one design is 4 vCPU, 8 GiB memory and 300 GiB disk on the SOC segment. Its installation image, software version and integrity checks must be recorded at deployment. R07 is prepared but disabled by owner report; activation waits for a working receiver and subsequent receipt, decoding, indexing and health checks.

The public network addresses are illustrations, not operating instructions or the addresses of the original tests. P1 remains open; see [readiness](p1-preflight.md), [capacity](../docs/decisions/0009-capacity.md) and [retention](../docs/decisions/0010-retention.md).
