# 0009 · Capacity for P1 and the P0–P2 target

- **Status:** Proposed
- **Date:** 2026-10-08
- **Updated:** 2026-10-15
- **Phase:** Before P1
- **Source baseline:** 4b97f8f6e28552f0c173c73bdf0841292c7d85e3

## Context

[Decision 0001](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/decisions/0001-hypervisor.md) selects VMware Workstation on the Windows host. The [inventory](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/infra/inventory.md) records 32 GB of host RAM, a 2 TB SSD, `fw-01` at 4 GB and `mgmt-01` at 2 GB, checked on 2026-10-01. These are published observations from that date, not fresh measurements.

The [network plan](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/network-plan.html) allocates 2 GB to the firewall and 1 GB to the bastion, 4 GB to Windows, 1 GB each to the Linux server and web server, 8 GB to Wazuh, and 4 GB to the case manager. The scanner, attack machine and isolated sandbox each use 4 GB on demand. The [P0 carry-over](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/progress.md#carried-to-p1) requires resolving the RAM budget before Wazuh arrives.

All capabilities, phases and exit gates remain in scope. Case management is a P2 capability, and its product is an open decision before P2. The zone label SOC does not assign an installation phase to every machine in it. The table below distinguishes a P1 workload from the complete P0–P2 target; it does not remove any machine or exercise.

| Workload | VM RAM with plan sizes | VM RAM with current P0 sizes | Total with plan sizes + host | Total with current P0 sizes + host |
|---|---:|---:|---:|---:|
| P0: firewall and bastion | 3 GB | 6 GB | 9–11 GB | 12–14 GB |
| P1 telemetry and services: P0 + Windows + Linux + web + Wazuh | 17 GB | 20 GB | 23–25 GB | 26–28 GB |
| Complete always-on target, including case manager | 21 GB | 24 GB | 27–29 GB | 30–32 GB |
| Complete target + one on-demand VM | 25 GB | 28 GB | 31–33 GB | 34–36 GB |
| Complete target + two on-demand VM | 29 GB | 32 GB | 35–37 GB | 38–40 GB |
| Complete target + scanner, attack VM and sandbox | 33 GB | 36 GB | 39–41 GB | 42–44 GB |

The totals use the plan's 6–8 GB host reservation and rounded RAM units. They exclude any VMware overhead not already included in that reservation, peaks and additional host applications. Thin disk allocations do not establish available physical storage. Simultaneously running all on-demand machines is a capacity scenario, not a requirement found in the curriculum.

With current P0 sizes, the nominal P1 workload leaves 4–6 GB before unmeasured overhead, using the historical host reservation. The plan-size columns reproduce the original allocations for arithmetic comparison: they save 3 GB but still leave between a 1 GB deficit and 1 GB spare for the complete target plus one on-demand VM. They are not endorsed allocations; the 2 GB firewall size is below the current published minimum, as reviewed below.

The source does not size the P4 sensors, P5 AI or P6 OT workloads. The figures above do not demonstrate capacity for the entire curriculum.

## Review within the 32 GB constraint

The [2026-10-15 readings](../../infra/p0-measurements-2026-10-15.md) confirm the current P0 allocations and only those two guests powered on. Initial readings were 16.6 GB available and 14.5 / 33.9 GB committed. A later CIM query shown in screenshots, with Steam closed and both guests still running, reports 20.05 GiB available and 9.08 / 33.91 GiB committed. These are point readings, not runtime acceptance evidence for P1/P2. The user has fixed 32 GB as a hard design limit; increasing host memory is outside the selected scope.

The original smaller firewall allocation cannot be assumed valid. Current [OPNsense guidance](https://docs.opnsense.org/manual/hardware.html#hardware-requirements) lists 3 GB as a limited minimum, 4 GB as a reasonable configuration and 8 GB as recommended. Keep 4 GB in the candidate budget. The [Wazuh quickstart](https://documentation.wazuh.com/current/quickstart.html#hardware) recommends 8 GiB for an all-in-one deployment with 1–25 agents; keep that planning reference. The [Debian 13 guide](https://www.debian.org/releases/trixie/amd64/ch03s04.en.html) recommends 1 GB without a desktop. Reducing the bastion from 2 GB to 1 GB is therefore a candidate for verification with its administrative and agent workload, not a change already made.

The blueprint [defines components as functions rather than one VM per block](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1503). The [network plan](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/network-plan.html#L307) permits one on-demand machine at a time and explicitly offers Markdown case templates as an alternative to a dedicated case application. That is an option to evaluate, not a selected implementation or proof that its consumption is zero.

| Candidate VM budget | P1 VMs | P1 + one on-demand role, before a dedicated case VM | Remaining for host, VMware, case function and headroom |
|---|---:|---:|---:|
| Keep current P0 allocations | 20 GB | 24 GB | 8 GB |
| Validate bastion at 1 GB; keep firewall at 4 GB | 19 GB | 23 GB | 9 GB |

Keeping the original additional 4 GB case VM would instead produce 28 GB or 27 GB of VM allocations respectively, before host overhead. Neither row demonstrates that this full configuration fits the current host.

A case-function resource allowance may be designed now, but product selection remains before P2. Its templates, orchestration/API and export criteria, ticket, executive report, handover and evidence remain in scope. Required targets, services and telemetry must remain active in each exercise window; any change to the plan's always-on model requires an explicit operating-window decision. No case implementation, reduced bastion allocation or capacity option is accepted here.

## Options considered

| Option | Effect | Conditions and trade-offs |
|---|---|---|
| Keep the current P0 allocations | Preserves the deployed baseline; P1 arithmetic is 26–28 GB including the host reservation | P0–P2 capacity must still be resolved; host overhead and real workload behaviour remain unmeasured |
| Validate the bastion at 1 GB while keeping the firewall at 4 GB | Recovers 1 GB; P1 VM allocations become 19 GB | Must preserve administrative access, sudo, updates, agent workload and the P0 checks; the complete target plus one demand VM still totals 33–35 GB with the historical host reservation |
| Schedule machine operation by exercise | Uses the plan's on-demand model while retaining every capability | Requires a dependency and simultaneity map for all exercises; cannot switch off a required target, telemetry source or case function to make the sum fit |
| Increase compatible host memory | Would increase physical capacity | Outside the user's confirmed 32 GB limit |

The plan mentions Markdown case templates as a possible saving. Selecting that implementation is not part of this proposal: the case-management decision and its criteria remain in P2. Changing hypervisors would reopen an accepted decision and is not selected here.

## Decision

No capacity option is accepted yet.

Before deploying Wazuh, define the P1 allocations and concurrency and resolve the P0–P2 target conflict using the planned reservations for future functions. Product choices assigned to P2, detailed exercise implementation and runtime verification retain their original phases. The initial design decision must cover the target conflict while preserving every capability.

Before accepting the design, record:

- Actual host RAM, available and committed memory, paging behaviour and competing applications.
- Whether the host reservation includes VMware services; documented overhead and headroom.
- Usable storage, existing VM files and snapshot growth.
- P1 concurrency and budgeted P0–P2 operating windows, preserving the case function and every on-demand role without requiring all future exercise designs before P1.
- The selected option, its allocations, its consequences and any limits.

Implementation and performance verification then belong to P1: check event ingestion, indexing, source health, auditing, access, DNS and time under the documented workload. They are not claimed as completed here. If P0 allocations change, repeat its verification battery and record the results.

No percentage headroom, test duration or numeric paging threshold is prescribed by the blueprint. Any such acceptance parameter must be identified as a design choice and supported by measurements.

## Consequences

The capacity prerequisite remains open until the design is resolved within 32 GB. Initial user-reported host readings are recorded; no VM resizing or deployment has been performed.

The [P1 preflight record](../../infra/p1-preflight.md) provides the measurement fields. Later workloads remain in their original phases and require their own sizing when specified. This proposal does not change the blueprint or close a phase.

