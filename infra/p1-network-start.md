# P1 network work · public summary

This replaces the public presentation of the detailed operating journal. The original journal is retained separately; it contains access data, hardware identifiers, precise observations and full procedural context that are not needed in a portfolio.

## Observed configuration

Five internal zones were assigned. The principal IPv4 rule order and active 24-member resolver table were reviewed. The bastion telemetry exception is before the final deny, and DMZ service exceptions are before its lab-network block. The [policy guide](../docs/firewall-policy.md) contains all 34 manual rows and their rationale.

## Tested and pending

MGMT has scoped DNS and time observations, a valid HTTPS control and three firewall-correlated TCP negatives. The [evidence summary](../docs/evidence-summary.md) states exactly what those samples establish. Other clients, DHCP offers and positive local names, browser behavior, complete DoT failure behavior and full state/NAT/IPv6 review remain pending.

## Deployment update — 28 October 2026

The central Wazuh stack is deployed on an Ubuntu Server VM in SOC, with 4 vCPU, 8 GiB allocated memory and a 300 GB virtual disk as displayed by the hypervisor. The installation image check and package versions are retained in the private deployment record. The first Debian bastion agent is enrolled. A benign source event reached the searchable dashboard; orderly stop/start, scheduled service restart, network-path loss, reconnection and fresh post-restoration delivery were observed. The temporary endpoint filter was removed and its rollback timer is inactive. See the [first-agent validation](../docs/wazuh-first-agent-validation.md) for methods, results and limits.

This is one agent, not general telemetry coverage. Additional sources remain pending. R07 remains prepared and disabled by the last owner report: the agent receiver does not establish that a syslog listener is configured. Activation still waits for a working syslog receiver and subsequent receipt, decoding, indexing and health checks.

The public network addresses are illustrations, not operating instructions or the addresses of the original tests. P1 remains open; see [readiness](p1-preflight.md), [capacity](../docs/decisions/0009-capacity.md) and [retention](../docs/decisions/0010-retention.md).
