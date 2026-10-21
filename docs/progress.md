# Public milestones and lessons

This is a summary of historical work through 20 October 2026. Original console transcripts, individual connections, machine identifiers and recovery details remain in the private working record. The published addressing is illustrative.

## P0 foundation

- Selected a workstation hypervisor and an OPNsense firewall, with separate LAN segments and a bastion role.
- Verified a restricted administrative route in the original environment. The public edition omits the entry point, forwarding chain and client identity.
- Found that the active host firewall provider, not merely a rule visible in another management console, determines filtering. A permitted administrator and a separate denied device were checked in that historical sample.
- Reopened administrative sessions after firewall restart and distinguished saved rules, applied configuration and established states.
- Recorded a restore onto the same installation. This was not a clean installation or a proof that every external dependency was recovered.

## DNS and time

Configured local DNS, DoT upstreams, DNSSEC, a finite set of known-resolver controls and a shared time source. Local DNS checks and the later MGMT client checks have different scope. A host sleep incident showed why power state and time must be considered when interpreting logs.

## P1 segmentation and capacity

The principal IPv4 rules and active resolver table were reviewed. The bastion-only telemetry exception is before the final deny. DHCP and local-name forwarding are configured, while real USERS leases, positive A/PTR and browser behavior remain pending.

A smaller bastion memory trial passed the recorded basic workload; it does not establish capacity for all future agents. The [capacity decision](decisions/0009-capacity.md) and [retention decision](decisions/0010-retention.md) remain subject to deployment and workload checks.

## Scoped MGMT verification

DNS passed ordinary and selected blocked-name tests over UDP/TCP. A time-synchronization sample and a certificate-validated HTTPS control succeeded. Three new IPv4/TCP negative samples were correlated locally to R13a, R15 and R01. See the [evidence summary](evidence-summary.md); the original tuples and logs are omitted here.

## Still open

Wazuh and new sources, R07 receive/decode/index/health, tests from the other zones, controlled DoT failures, complete state/NAT/IPv6 review, sustained resources, retention implementation and recovery testing. P1 is not closed.
