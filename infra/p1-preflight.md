# P1 preflight · capacity and retention

- **Status:** Initial capacity design selected and retention policy accepted on 2026-10-17; implementation and runtime verification pending
- **Date:** 2026-10-08
- **Updated:** 2026-10-17
- **Phase:** Before P1
- **Source baseline:** 4b97f8f6e28552f0c173c73bdf0841292c7d85e3

This record follows the existing [blueprint](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html), [P0 carry-over](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/progress.md#carried-to-p1), inventory and runbook. It tracks the two decisions, [0009](../docs/decisions/0009-capacity.md) and [0010](../docs/decisions/0010-retention.md). Retention policy 0010 was accepted by the owner on 2026-10-17; capacity 0009 now selects the initial implementation design, including resource limits and later verification. This record does not claim a deployment or a completed phase.

## Published baseline

| Item | Published value | Date and meaning |
|---|---|---|
| Host RAM | 32 GB | Inventory checked 2026-10-01; not a new measurement |
| Host SSD | 2 TB | Nominal capacity; usable/free space not recorded here |
| fw-01 RAM | 4 GB | Inventory checked 2026-10-01 |
| mgmt-01 RAM | 2 GB | Inventory checked 2026-10-01 |
| P1 target VM RAM | 20 GB | Calculation with baseline P0 sizes and Windows, Linux, web and Wazuh |
| Complete target + one demand VM | 28 GB of VM allocations | Calculation; with the plan host reservation, 34–36 GB |

## Readings and remaining checks

Start fw-01 and then mgmt-01 in the order defined by the [runbook](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/runbook.md). Use its existing battery to recheck access, DNS, time and network rules. Save the results outside the VM snapshots.

| Observation | Result | Evidence/date |
|---|---|---|
| Host physical, available and committed memory | 32 GB DDR4; initial available 16.6 GB and committed 14.5 / 33.9 GB; follow-up with Steam closed: 20.05 GiB available and 9.08 / 33.91 GiB committed; later Task Manager: 31.9 GB usable, 11.4 GB in use, 20.5 GB available and 9.1 / 33.9 GB committed | [User reports and screenshots, 2026-10-15/16](p0-measurements-2026-10-15.md); point readings |
| Host applications and VMware services running | Initial three process readings and a later partial Memory-sorted process screenshot recorded; no full inventory, aggregate VMware use or app-closure claim | User report and screenshot, 2026-10-15/16 |
| Host paging and observed peaks during the recorded workload | Pending | Pending |
| fw-01 and mgmt-01 allocations and observed usage | Baseline allocations 4096 / 2048 MB; bastion baseline 1935 MiB total, 259 MiB used, 1676 MiB available, swap used 0. In the later 1024 MB bastion trial, initial SSH memory is 929 MiB total, 252 MiB used, 676 MiB available and swap used 0; after apt update, 281 MiB used, 647 MiB available and swap used 0; after the verified two-package upgrade, 302 MiB used, 626 MiB available and swap used 0 | User report and [SSH recheck and memory trial, 2026-10-15](p0-recheck-2026-10-15.md) |
| Host disk usable/free space and VM file sizes | Initial C: 1.29 TB free / 1.81 TB total; later VMware shows 1.3 TB free. Both displayed disks and VM folders are on C:. Each disk has 40 GB maximum virtual capacity. Folder size on disk: fw-01 14,109,327,360 bytes, mgmt-01 1,835,130,880 bytes; sum approximately 14.85 GiB | [User reports and screenshots, 2026-10-15/17](p0-measurements-2026-10-15.md#complete-folder-properties-2026-10-17) |
| Snapshot locations and storage growth | fw-01 points to fw-01-000002.vmdk; snapshot association inferred from naming. Measured folder totals already include their contents. Chain inventory, external files and future growth remain unverified | User VMware and Explorer screenshots, 2026-10-17 |
| Private backup exists and required external settings are recorded | Pending | Pending |
| P0 verification battery and third-device access check | SSH authenticated; runbook TCP probes, DNS and bastion time matched expectations; GUI HTTP 200. A later user-provided SSH transcript confirms sudo id -u returned 0 on mgmt-01 after account-password recovery; a firewall-console screenshot shows selected NTP peer *195.95.153.43 with offset +0.682 ms. Third-device/log checks remain unrecorded this session | [SSH recheck and follow-ups, 2026-10-15](p0-recheck-2026-10-15.md) |
| Workload and machines active during measurements | Only fw-01 and mgmt-01 powered on; usual host application workload pending | User report, 2026-10-15 |

The baseline sudo, DNS, time, TCP and GUI checks above preceded the memory reduction. At the lower allocation, later user screenshots record SSH, memory, DNS resolution, bastion time from 10.20.10.1 with 4 packets and all six TCP results matching the runbook; the user explicitly confirms sudo id -u returned 0. Later screenshots show the OPNsense login page through the tunnel, a completed sudo apt update and 647 MiB available with no swap used afterwards. A further user transcript verifies the two security-package upgrades with dpkg-query and records 626 MiB available with no swap used. The basic P0 checks at the lower allocation are complete for the observed workload. Peak/sustained and later agent/full-phase workloads remain to be evaluated in their phases. The linked recheck distinguishes the evidence sources and stages.

The later P1 workload measurements must document source coverage, reception/indexing, delays, losses and recovery. These are phase checks, not results assumed before installing Wazuh.

## Resolve the decision fields

| Capacity field | State |
|---|---|
| P1 concurrency and P0–P2 capacity windows preserving all roles | Selected: six P1 VMs active; one demand VM at a time; cases available on Windows host within shared reserve. A dedicated 4 GiB case VM is allowed only in a compatible no-demand window, preserving a usable case workflow. Product/API/export checks stay before P2 |
| Selected allocations and required host reserve | 19 GiB P1 guests plus 8 GiB joint host/apps/VMware/case reserve; 27 GiB initial planning total, 31 GiB with one 4 GiB demand VM; runtime verification pending |
| P0–P2 target deficit resolved by a documented option | Written design selected in 0009: case function in host envelope or compatible no-demand window; excluded 35 GiB concurrency. Actual case implementation must meet capabilities/resources before P2; revisit design if no candidate does |
| Available storage and snapshot/data budget | Estimated 960 GiB additional growth/provision plus 150 GiB host free reserve; 300 GiB Wazuh disk includes 220 GiB of retention data/temporary work; 40 GiB protected host data completes the accepted 260 GiB. No duplicate count. Recheck actual free space at provisioning; snapshot chain and separate recovery destination remain pending |
| Allocations changed, if any, and P0 rechecks | Basic observed P0 use tested at 1024 MB, including SSH/sudo/DNS/time/TCP, GUI login-page access, apt update and verified security-package upgrades; no agent/full-phase capacity acceptance |

| Retention field | State |
|---|---|
| Investigation window by data category | Accepted initial 30-day investigation window; protected datasets retain dependency/lifetime conditions |
| Searchable alert/event windows | Accepted: alerts 30 days; all received events 7 days, from receipt |
| Original-event archive window and capacity | Accepted: all received events archived 30 days; 260 GiB overall initial estimated data/temporary allowance, with provisional category breakdown in 0010 |
| Operational/source-health window and capacity | Planning defaults: 30 days detailed health and 10 GiB; refine and implement in P1 |
| Fixture and evidence preservation conditions | Accepted: protect fixtures, cases/gates and necessary configuration from operational age-based purges; dependency/lifetime conditions in 0010 |
| Private storage, publication boundary and recovery route | Private originals and anonymised published samples; separate recovery destination pending, additional copy estimated at 40 GiB |
| Lifecycle/expiry implementation and isolated verification plan | Plan recorded in 0010; implementation and isolated expiry/preservation/recovery checks remain in P1 |

A field is resolved by a documented choice, its rationale and its supporting measurement or labelled estimate. These preparation records do not close the P1 gate.

## Curriculum carried forward

P1 retains Wazuh, Windows/Linux, legitimate activity, auditing and source health, with source-to-alert and interruption/recovery checks. Preserve the other inherited tasks: R04 when targets exist; R05/R13/R13a/R15 in every new zone; name-based DoH blocking before browsers; firewall syslog R07; and root-password locking after sudo and bastion log ingestion meet decision 0008. Configuration, samples, ingestion trace and the verified write-up remain required for phase closure.

Recovery verification also remains open: restoring OPNsense onto a fresh installation, using console option 13, and rebuilding the bastion from its documented configuration/templates. The runbook only records restoration onto the same installation after a snapshot rollback. Keep these as pending recovery work within A3 (P0–P6); they are not added as new P1 entry gates.

The bastion-agent flow is a documented design gap: R06 lists USERS/SERVERS/DMZ and R04 lists administration ports. Its telemetry permission must be resolved when rules are concretised. No new firewall rule is implemented by this record.

The parallel L block in GitHub specifies week 0: a dedicated isolated AWS account, separate identities, offline secrets and cost controls. [AWS card](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1760), [L phase](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1782). The detailed separate eight-week calendar has not yet been located in the accessible files; it is not recreated here. L remains independent of local P1 and retains its weekly evidence/publication requirements.

## Next implementation step

Follow [P1 network preparation](p1-network-start.md). Create/confirm the four P1 LAN segments first. Adding or assigning firewall adapters follows a recorded mapping and recoverable configuration; no network change is claimed yet.
