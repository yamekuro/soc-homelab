# soc-homelab

A segmented security operations lab on a single workstation, built phase by phase and documented with evidence.

An OPNsense firewall separates six zones. Wazuh collects telemetry locally, with Microsoft Sentinel and Splunk for the enterprise phases. The lab covers phishing analysis, vulnerability management, adversarial validation and an AI assistant that has to pass an evaluation before it is allowed to act. A parallel cloud track covers LLMjacking in AWS.

Everything is designed against a catalogue of eight MITRE ATT&CK scenarios, and every phase has an exit gate that must be verified before the next one starts.

## Status

| Phase | Scope | Status |
|---|---|---|
| P0 | Foundation: hypervisor, firewall, zones, bastion | 🔄 In progress |
| P1 | Telemetry: Wazuh, Windows and Linux endpoints | Planned |
| P2 | First SOC case: detection, phishing, vulnerability scan, report | Planned |
| P3 | Identity and platforms: AD, Entra, Sentinel, Splunk | Planned |
| P4 | Network, hunting and automated response | Planned |
| P5 | AI assistant, evaluated before it acts | Planned |
| P6 | Capstone campaign and resilience | Planned |
| L | Parallel cloud track: AWS LLMjacking | Planned |

**Minimum portfolio milestone:** track L complete + P2 (first end-to-end SOC case).

## Design documents

- [Blueprint](docs/blueprint.html): target architecture, threat catalogue, phases, decisions and market fit (English and Spanish).
- [Network plan](docs/network-plan.html): P0–P2 infrastructure, zone policy matrix, OPNsense rules, RAM budget and addressing (English and Spanish).
- [Decision records](docs/decisions/): what was decided, the options considered and why.

## Decisions so far

| # | Decision | Outcome |
|---|---|---|
| [0001](docs/decisions/0001-hypervisor.md) | Hypervisor | VMware Workstation Pro on Windows 11 |
| [0002](docs/decisions/0002-firewall.md) | Firewall | OPNsense |
| [0003](docs/decisions/0003-addressing.md) | Addressing | `10.20.0.0/16`, one `/24` per zone |
| [0004](docs/decisions/0004-upstream-dns.md) | Upstream DNS | DNS over TLS from Unbound to Quad9 and Cloudflare |
| [0005](docs/decisions/0005-time.md) | Time synchronisation and time zone | `fw-01` serves NTP (pool plus Cloudflare by IP); UTC on every lab machine |
| [0006](docs/decisions/0006-doh-blocking.md) | Blocking DNS over HTTPS | Block the published addresses of large public resolvers before R13 |

## Repository layout

```
soc-homelab/
├── docs/          blueprint, network plan and decision records
├── infra/         templates, inventory, Ansible and restore procedures
├── telemetry/     agents, auditing, sensors and data contracts
├── detections/    Wazuh, KQL, SPL and Sigma, with tests per backend
├── scenarios/     scope, legitimate activity, tests and clean-up
├── vulns/         scans, prioritisation and remediation checks
├── compliance/    control maps: ENS, ISO 27001, NIS2, Essential Eight, ISM
├── cases/         timelines, evidence and decisions
├── phishing/      .eml samples, analysis and playbook
├── cloud/         track L: AWS LLMjacking
├── automation/    APIs, enrichment and playbooks
├── ai/            assistant tools, policies and evaluations
├── writeups/      one write-up per phase
└── evidence/      anonymised samples, hashes and manifests
```

## How each phase is published

A phase closes when its exit gate is verified and its write-up is in `writeups/`. Each write-up follows the same format: decision, why, trade-off, problems found, verification, open items and a one-line résumé summary. Nothing is published unverified or with sensitive data.

## Scope and safety

This is a personal lab. All adversarial activity runs inside isolated lab networks against machines I own, and the lab has no route to my home network. Malware samples and phishing attachments are only opened in an isolated sandbox with no network access.

---

*Build. Attack. Detect. Measure what you missed.*
