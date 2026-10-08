# 0009 · Capacity for P1 and the P0–P2 target

- **Status:** Proposed
- **Date:** 2026-10-08
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

With current P0 sizes, the nominal P1 workload leaves 4–6 GB before unmeasured overhead. Restoring the plan's smaller P0 sizes recovers 3 GB, but the complete target plus one on-demand VM still leaves between a 1 GB deficit and 1 GB spare. That change alone does not resolve the target budget.

The source does not size the P4 sensors, P5 AI or P6 OT workloads. The figures above do not demonstrate capacity for the entire curriculum.

## Options considered

| Option | Effect | Conditions and trade-offs |
|---|---|---|
| Keep the current P0 allocations | Preserves the deployed baseline; P1 arithmetic is 26–28 GB including the host reservation | P0–P2 capacity must still be resolved; host overhead and real workload behaviour remain unmeasured |
| Validate the smaller P0 allocations in the plan | Recovers 3 GB | Must satisfy the installed systems' requirements and preserve the P0 checks; still insufficient to declare the complete P2 target feasible |
| Schedule machine operation by exercise | Uses the plan's on-demand model while retaining every capability | Requires a dependency and simultaneity map for all exercises; cannot switch off a required target, telemetry source or case function to make the sum fit |
| Increase compatible host memory | Can preserve the target allocations and more concurrency | Hardware compatibility, cost and configuration remain unknown; no purchase or new physical capacity is assumed |

The plan mentions Markdown case templates as a possible saving. Selecting that implementation is not part of this proposal: the case-management decision and its criteria remain in P2. Changing hypervisors would reopen an accepted decision and is not selected here.

## Decision

No capacity option is accepted yet.

The proposal is to resolve a complete phase-by-phase allocation and simultaneity plan before Wazuh is deployed, using current host measurements and the existing curriculum. The initial design decision must include the P0–P2 target conflict, rather than only the first P1 machines.

Before accepting the design, record:

- Actual host RAM, available and committed memory, paging behaviour and competing applications.
- Whether the host reservation includes VMware services; documented overhead and headroom.
- Usable storage, existing VM files and snapshot growth.
- Planned concurrency for each P1 workload and P2 exercise, including the case manager and all on-demand roles.
- The selected option, its allocations, its consequences and any limits.

Implementation and performance verification then belong to P1: check event ingestion, indexing, source health, auditing, access, DNS and time under the documented workload. They are not claimed as completed here. If P0 allocations change, repeat its verification battery and record the results.

No percentage headroom, test duration or numeric paging threshold is prescribed by the blueprint. Any such acceptance parameter must be identified as a design choice and supported by measurements.

## Consequences

The capacity prerequisite remains open until the design is resolved. Preparation can continue without access to the host, but no VM resizing or deployment has been performed.

The [P1 preflight record](../../infra/p1-preflight.md) provides the measurement fields. Later workloads remain in their original phases and require their own sizing when specified. This proposal does not change the blueprint or close a phase.
