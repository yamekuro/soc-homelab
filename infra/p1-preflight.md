# P1 readiness · public edition

This checklist summarizes the original lab through 20 October 2026. Addresses elsewhere in the public edition are illustrative. Full operating records and access details are kept separately.

| Area | State | Remaining gate |
|---|---|---|
| Principal IPv4 policy | Observed and compared with the manual matrices | Full states, NAT, anchors, automatic rules and IPv6 review |
| MGMT DNS and time | Scoped real samples passed | Other clients and sustained time accuracy |
| MGMT negative TCP samples | Three locally correlated blocks | Other zones, destinations, protocols and established states |
| USERS DHCP and local names | Configured | Actual lease/options, positive A/PTR, browser behavior |
| Capacity and retention | Initial design selected | Representative workload and implementation measurements |
| Wazuh and agents | Planned | Installation, enrolment, events and health |
| R07 syslog | Prepared, disabled by report | Receiver ready, activation, receipt/decode/index/health |
| Recovery | Historical same-install restore recorded | Clean-install and complete external dependency recovery |

The [firewall guide](../docs/firewall-policy.md), [evidence summary](../docs/evidence-summary.md) and [network work summary](p1-network-start.md) preserve the distinctions between design, observed configuration, owner report and tested application behavior. This is not a completed P1 gate.
