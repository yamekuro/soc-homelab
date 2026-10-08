# P1 preflight · capacity and retention

- **Status:** Preparation in progress; measurements pending
- **Date:** 2026-10-08
- **Phase:** Before P1
- **Source baseline:** 4b97f8f6e28552f0c173c73bdf0841292c7d85e3

This record follows the existing [blueprint](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html), [P0 carry-over](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/progress.md#carried-to-p1), inventory and runbook. It prepares the two open decisions, [0009](../docs/decisions/0009-capacity.md) and [0010](../docs/decisions/0010-retention.md). It does not claim a deployment, an accepted decision or a completed phase.

## Published baseline

| Item | Published value | Date and meaning |
|---|---|---|
| Host RAM | 32 GB | Inventory checked 2026-10-01; not a new measurement |
| Host SSD | 2 TB | Nominal capacity; usable/free space not recorded here |
| fw-01 RAM | 4 GB | Inventory checked 2026-10-01 |
| mgmt-01 RAM | 2 GB | Inventory checked 2026-10-01 |
| P1 target VM RAM | 20 GB | Calculation with current P0 sizes and Windows, Linux, web and Wazuh |
| Complete target + one demand VM | 28 GB of VM allocations | Calculation; with the plan host reservation, 34–36 GB |

## Record when the host is available

Start fw-01 and then mgmt-01 in the order defined by the [runbook](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/runbook.md). Use its existing battery to recheck access, DNS, time and network rules. Save the results outside the VM snapshots.

| Observation | Result | Evidence/date |
|---|---|---|
| Host physical, available and committed memory | Pending | Pending |
| Host applications and VMware services running | Pending | Pending |
| Host paging and observed peaks during the recorded workload | Pending | Pending |
| fw-01 and mgmt-01 allocations and observed usage | Pending | Pending |
| Host disk usable/free space and VM file sizes | Pending | Pending |
| Snapshot locations and storage growth | Pending | Pending |
| Private backup exists and required external settings are recorded | Pending | Pending |
| P0 verification battery and third-device access check | Pending | Pending |
| Workload and machines active during measurements | Pending | Pending |

The later P1 workload measurements must document source coverage, reception/indexing, delays, losses and recovery. These are phase checks, not results assumed before installing Wazuh.

## Resolve the decision fields

| Capacity field | State |
|---|---|
| P1 and P2 simultaneity map covering every programmed role | Pending |
| Selected allocations and required host reserve | Pending |
| P0–P2 target deficit resolved by a documented option | Pending |
| Available storage and snapshot/data budget | Pending |
| Allocations changed, if any, and P0 rechecks | Pending; no change performed |

| Retention field | State |
|---|---|
| Investigation window by data category | Pending |
| Searchable alert/event windows | Pending |
| Original-event archive window and capacity | Pending |
| Operational/source-health window and capacity | Pending |
| Fixture and evidence preservation conditions | Pending |
| Private storage, publication boundary and recovery route | Pending |
| Lifecycle/expiry implementation and isolated verification plan | Pending |

A field is resolved by a documented choice, its rationale and its supporting measurement or labelled estimate. These preparation records do not close the P1 gate.

## Curriculum carried forward

P1 retains Wazuh, Windows/Linux, legitimate activity, auditing and source health, with source-to-alert and interruption/recovery checks. Preserve the other inherited tasks: R04 when targets exist; R05/R13/R13a/R15 in every new zone; name-based DoH blocking before browsers; firewall syslog R07; and root-password locking after sudo and bastion log ingestion meet decision 0008. Configuration, samples, ingestion trace and the verified write-up remain required for phase closure.

Recovery verification also remains open: restoring OPNsense onto a fresh installation, using console option 13, and rebuilding the bastion from its documented configuration/templates. The runbook only records restoration onto the same installation after a snapshot rollback. Keep these as pending recovery work within A3 (P0–P6); they are not added as new P1 entry gates.

The bastion-agent flow is a documented design gap: R06 lists USERS/SERVERS/DMZ and R04 lists administration ports. Its telemetry permission must be resolved when rules are concretised. No new firewall rule is implemented by this record.

The parallel L block in GitHub specifies week 0: a dedicated isolated AWS account, separate identities, offline secrets and cost controls. [AWS card](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1760), [L phase](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1782). The detailed separate eight-week calendar has not yet been located in the accessible files; it is not recreated here. L remains independent of local P1 and retains its weekly evidence/publication requirements.
