# 0003 · Addressing

- **Status:** Accepted
- **Date:** 2026-09-24
- **Phase:** Before P0

## Context

The desktop already has two networks that the lab must not overlap or reach:

- Home network: `192.168.0.0/24`
- VirtualBox host-only adapter: `192.168.56.0/24`

The lab needs one subnet per zone, a transit network for egress, and room for the zones reserved for later phases.

## Decision

`10.20.0.0/16`, one `/24` per zone. The third octet identifies the zone.

| Zone | Segment | Subnet | Gateway | Interface | Phase |
|---|---|---|---|---|---|
| MGMT | LS-MGMT | `10.20.10.0/24` | `10.20.10.1` | vmx1 | P0 |
| USERS | LS-USERS | `10.20.20.0/24` | `10.20.20.1` | vmx2 | P1 |
| SERVERS | LS-SERVERS | `10.20.30.0/24` | `10.20.30.1` | vmx3 | P1 |
| DMZ | LS-DMZ | `10.20.40.0/24` | `10.20.40.1` | vmx4 | P1 |
| SOC | LS-SOC | `10.20.50.0/24` | `10.20.50.1` | vmx5 | P1 |
| ATTACK | LS-ATTACK | `10.20.60.0/24` | `10.20.60.1` | vmx6 | P2 |
| AI | LS-AI | `10.20.70.0/24` | reserved | vmx7 | P5 |
| OT | LS-OT | `10.20.80.0/24` | reserved | vmx8 | P6 |
| WAN | VMnet8 (NAT) | `10.20.254.0/24` | `10.20.254.2` (VMware NAT) | vmx0 | P0 |
| SANDBOX | LS-SANDBOX | isolated, not routed | none | none | P2 |

Within every zone: `.1` is the firewall, `.10`–`.99` are static addresses, `.100`–`.199` are DHCP (USERS only).

## Consequences

- The lab reaches the Internet through VMware NAT, never through the home network directly.
- A floating rule (R01) blocks every zone from `192.168.0.0/24` and `192.168.56.0/24`.
- The phishing sandbox has no link to the firewall at all.
- Administrative access from the admin laptop enters on host port `2222`, which VMware forwards to the firewall's WAN and OPNsense translates to `mgmt-01:22` (R02). Nothing else is reachable from outside.
