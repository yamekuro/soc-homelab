# soc-homelab

A segmented security operations lab, built phase by phase and documented with scoped evidence. The design covers local Wazuh telemetry, later enterprise platforms, detection engineering, phishing, vulnerability management, adversarial validation and evaluated AI assistance. A parallel cloud track covers AWS LLMjacking.

**Public portfolio edition.** Internal addresses, machine labels and diagrams are illustrative. Operational access details and full records are kept outside this edition. Historical results describe roles in the original lab, not tests run against the published example addresses. See the [publication policy](docs/publication-policy.md) for scope and history limitations.

## Status

| Phase | Scope | Recorded state |
|---|---|---|
| P0 | Foundation: hypervisor, firewall, bastion and recovery | Historical foundation checks recorded; later controls retain their own gates |
| P1 | Segmentation and telemetry | In validation; Wazuh and new sources remain planned |
| P2 | First end-to-end SOC case | Planned |
| P3–P6 | Enterprise identity, hunting, response, evaluated AI and resilience | Planned |
| L | Parallel cloud track | Planned |

The minimum portfolio milestone remains track L plus P2. Designed capabilities are not presented as deployed services.

## Read the project

[Open the published documentation](https://yamekuro.github.io/soc-homelab/) to browse the interactive pages.

- [Firewall policies](docs/firewall-policy.md): 34 manual rows, order, exceptions and reasons.
- [Interactive firewall map](https://yamekuro.github.io/soc-homelab/firewall-policy-map.html): 18 explanatory cases; no live traffic.
- [Evidence summary](docs/evidence-summary.md): observed results and pending checks.
- [Blueprint](https://yamekuro.github.io/soc-homelab/blueprint.html): curriculum, scenarios, dependencies and exit gates.
- [Illustrative network plan](https://yamekuro.github.io/soc-homelab/network-plan.html): architecture and future phases, not an operational inventory.
- [Decision records](docs/decisions/README.md): choices, trade-offs and planning assumptions.
- [Public operating method](docs/runbook.md), [milestones](docs/progress.md) and [inventory by role](infra/inventory.md).
- [P0 write-up](writeups/p0-foundation.md) and [P1 readiness](infra/p1-preflight.md).

## Publication and verification

A phase closes when its specific exit gate is demonstrated. A permit rule is not proof of a running service; a timeout alone is not proof of a firewall decision. Positive and negative tests are recorded with scope and limitations.

The firewall policy seeks to prevent new lab connections to declared outside networks. It does not prove that every route, existing state, IPv6 path or same-segment flow is isolated. Future adversarial exercises stay within owned lab systems; the malware sandbox is designed without a network link.

The repository organizes infrastructure, telemetry, detections, scenarios, cases, phishing, cloud, automation, AI and evidence by phase. Public examples exclude secrets and original operational records. Ordinary documentation updates do not erase earlier public history or third-party copies.
