# Firewall tests: results and scope

This document summarises the checks available through **20 October 2026**. Original logs and screenshots are kept outside this edition. Names and addresses in the [guide](firewall-policy.md) and [map](https://yamekuro.github.io/soc-homelab/firewall-policy-map.html) are illustrative; **they are not the original values used in these tests**.

## What was checked

| Area | Observed result | Limit of the conclusion |
|---|---|---|
| Main IPv4 policy | Loaded rules retain the documented order: R01 before interface rules, R13a before R13, DMZ exceptions before R09 and R15 last. | The reading is not a complete audit of states, NAT, anchors or IPv6. The 34 manual rows can expand into more PF lines. |
| Resolver alias | The active `PUBLIC_DNS` table contained the design's 24 unique IPv4 addresses. | Other aliases need their own checks; membership in this table alone does not establish a block. |
| DNS from MGMT | Six A queries: an ordinary name returned a positive answer; the Firefox canary domain and `dns.google` returned NXDOMAIN. Each case was tested over UDP and TCP. | Real test from the bastion to the firewall's DNS service. Does not establish behaviour for other clients, every blocked name or a decisive PF rule through a log. |
| DNSSEC | A valid name returned AD and RRSIG; a test domain with invalid DNSSEC returned SERVFAIL. | Expected behaviour on the queried path; validation is not attributed exclusively to the local resolver. |
| Outbound DNS transport | Bidirectional TCP/853 traffic was observed between the firewall and two public resolvers. | The reviewed capture tail does not prove TLS authentication of all sessions, general absence of cleartext DNS or behaviour under failure. |
| MGMT time | The client was initially observed unsynchronised; the firewall later returned an NTP response and the client indicated synchronisation. | One post-boot sample. Does not prove sustained accuracy, NTS, other zones or a decisive PF rule. The clock was not adjusted manually for the test. |
| Ordinary HTTPS from MGMT | Connection to a public service, TLS 1.3 with certificate validation and an HTTP 200 OK response. | Positive application control. No exclusive attribution to R13 through a log. |
| Public resolver from MGMT | A new TCP/443 connection to a listed resolver was blocked and correlated with R13a. | One IPv4/TCP sample, not all resolvers, ports or clients. |
| External SSH from MGMT | A new TCP/22 connection to an external destination ended in a block correlated with R15. | Does not generalise to other protocols, rules, zones or established connections. |
| Network outside the lab from MGMT | A new TCP/80 connection to a network protected by `HOME_NETS` ended in a block correlated with R01. | Tests that source and destination; other zones and the remaining declared networks are still pending. |
| Local names | A nonexistent name returned NXDOMAIN and Unbound's syntax check found no errors. | No positive A/PTR test of a DHCP lease or identification of the exact forwarding hop to the local name service. |

## How the three blocks were attributed

A timeout alone does not demonstrate that the firewall blocked a connection: a service may be absent or a routing failure may exist. Client attempts were therefore checked against the capture and the firewall's local log.

In all three negative samples, the connection, time and rule identifier matched the previously observed listing. The log indicated a match, a block and ingress through the MGMT interface. This allows those samples to be attributed to **R13a, R15 and R01**, respectively.

This edition publishes the method and conclusion. It omits original identifiers, full tuples, exact times, source ports and complete logs. It does not reconstruct fictional logs with illustrative addresses. Positive DNS, NTP and HTTPS results explicitly retain their attribution limits.

## What remains to be checked

- A real USERS client: DHCP lease and options received and used; A/PTR resolution; Firefox and DoH behaviour.
- Allowed and blocked flows from SERVERS, DMZ and SOC, with their logs and destination services.
- Wazuh reception and enrolment; activation of R07 only once its receiver exists; decoding, indexing and ingestion health.
- Individual coverage of the other blocked names; controlled upstream failure, DoT authentication and absence of unwanted fallback.
- States, NAT, automatic rules, anchors and IPv6; manual-rule filtering does not cover all those layers.
- Sustained time and resource stability, backup restoration and recovery of external configuration.
- Browser review of the map and actual printing remained pending at the evidence cutoff. Controller tests do not replace that review.

**P1 remains under validation.** Observed configuration does not imply that all its services are deployed or all its paths have been tested.
