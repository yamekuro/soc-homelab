# 0002 · Firewall

- **Status:** Accepted
- **Date:** 2026-09-24
- **Phase:** Before P0

## Context

One firewall connects every zone and enforces default deny between them. Criteria from the blueprint's decision register: per-zone rules, NAT, a path to VLANs, configuration export, and similarity to the commercial firewalls that appear in job ads (Fortinet, Palo Alto). It also has to fit the 2 GB of RAM allocated to it.

## Options considered

| Option | For | Against |
|---|---|---|
| **OPNsense** | Free, no interface limits; per-zone rules, NAT, VLANs, config export and API; Suricata built in (useful in P4); syslog to Wazuh; frequent releases | Not a commercial product, although zones, aliases, policies and NAT carry over |
| pfSense CE | Well known, lots of documentation | Slow release cadence; pfSense Plus no longer has a free home-lab licence |
| Sophos Firewall Home | Commercial product, free for home use, full feature set | 4-core limit, 120 GB disk and more RAM than the budget allows |
| FortiGate VM (permanent trial) | The Fortinet product employers ask for | Too limited in interfaces and policies for seven zones |

## Decision

OPNsense, with `vmxnet3` adapters (`vmx0`–`vmx6` in P0–P2; `vmx7` and `vmx8` reserved for AI and OT).

## Consequences

- The rule set R01–R15 is documented in the [network plan](../network-plan.html), in evaluation order.
- On the WAN interface, "Block private networks" must be disabled because the WAN uses `10.20.254.0/24`.
- Familiarity with a commercial firewall can come later from a small, separate FortiGate VM exercise; it does not need to be the lab's firewall.
