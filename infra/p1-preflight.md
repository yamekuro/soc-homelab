# P1 readiness · public edition

This checklist summarizes the original lab through 28 October 2026; the firewall test cutoff remains 20 October. Addresses elsewhere in the public edition are illustrative. Full operating records and access details are kept separately.

| Area | State | Remaining gate |
|---|---|---|
| Principal IPv4 policy | Observed and compared with the manual matrices | Full states, NAT, anchors, automatic rules and IPv6 review |
| MGMT DNS and time | Scoped real samples passed | Other clients and sustained time accuracy |
| MGMT negative TCP samples | Three locally correlated blocks | Other zones, destinations, protocols and established states |
| USERS DHCP and local names | Configured | Actual lease/options, positive A/PTR, browser behavior |
| Capacity and retention | Initial design selected | Representative workload and implementation measurements |
| Central Wazuh and first Debian agent | Deployed; source event indexed; orderly stop/start and network interruption/recovery observed | Additional sources, auditing, data contract and sustained source health |
| R07 syslog | Prepared, disabled by report | Receiver ready, activation, receipt/decode/index/health |
| Agent recovery | Scheduled service restart executed; network restored manually; fresh event indexed; test filter removed and rollback timer inactive | Network rollback timer firing, complete outage-buffer behavior and manager outage monitoring not tested |
| VM and configuration recovery | Historical same-install restore; pre-Wazuh baseline snapshot reported | Post-deployment recovery point, clean-install and complete external dependency recovery |

The [firewall guide](../docs/firewall-policy.md), [evidence summary](../docs/evidence-summary.md) and [network work summary](p1-network-start.md) preserve the distinctions between design, observed configuration, owner report and tested application behavior. See the [28 October first-agent validation](../docs/wazuh-first-agent-validation.md) for its exact scope. This is not a completed P1 gate.
