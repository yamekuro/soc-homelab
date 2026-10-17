# P0 measurements reported on 2026-10-15

- **Status:** Initial host readings preserved; later bastion trial linked; capacity remains proposed; retention policy accepted on 2026-10-17
- **Updated:** 2026-10-17
- **Source:** Initial readings were reported from Windows Task Manager, File Explorer and VMware settings. A later read-only CIM query is shown in user-supplied PowerShell screenshots, with its workload context confirmed by the user. Separate Task Manager screenshots on 2026-10-16 provide the subsequent host/process observations below.
- **Constraint:** Keep the host at 32 GB RAM while preserving every curriculum capability, phase and exit gate.

## Reported readings

| Item | Reading |
|---|---|
| Installed host memory | 32 GB DDR4 |
| Available memory | 16.6 GB |
| Committed memory / commit limit | 14.5 / 33.9 GB |
| Cached memory | 16.5 GB |
| Powered-on VMs | Only fw-01 and mgmt-01 |
| fw-01 configured memory | 4096 MB |
| mgmt-01 configured memory | 2048 MB |
| C: free / total capacity | 1.29 / 1.81 TB |
| fw-01 configuration file | Configuration path begins with C:\ |
| mgmt-01 configuration file | Configuration path begins with C:\ |
| bdservicehost process | 607.2 MB |
| ChatGPT process | 587.7 MB |
| Steam Client WebHelper process | 584.5 MB |

The process values were reported after sorting Task Manager's Processes view by memory. They are three process readings, not a complete application inventory or the total consumption of each application. They were collected after the initial memory figures; the table is not a synchronised capture.

The units and displayed precision are preserved as reported. Cached memory must not be added to available memory. Committed memory and its limit are not physical RAM usage. Configured guest RAM is not a measurement of resident guest memory.

## Follow-up CIM reading with Steam closed

The user supplied screenshots of a read-only Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory query and confirmed Steam was closed while fw-01 and mgmt-01 remained powered on with unchanged allocations.

| Query on the captured $m object | Displayed result | Rounded value |
|---|---:|---:|
| $m.AvailableMBytes / 1024 | 20.05078125 | 20.05 GiB available |
| $m.CommittedBytes / 1GB | 9.07919311523438 | 9.08 GiB committed |
| $m.CommitLimit / 1GB | 33.9127769470215 | 33.91 GiB commit limit |

An earlier query misspelled CommittedBytes as CommitedBytes and returned zero. That result is invalid and discarded; the corrected screenshot supplies the value above. These are point readings from the captured object, not a sustained workload or paging measurement. The original figures and this follow-up are separate observations. The increased availability is not an isolated measurement of Steam's contribution.

## Task Manager follow-up, 2026-10-16

The user supplied Performance > Memory and Processes screenshots after the request to keep the P0 guests and usual laboratory applications running. The screenshots show the host metrics and the visible process sample; they do not independently show the guests' power states or a complete application inventory. No exact capture time is assigned.

| Performance > Memory item | Displayed value |
|---|---|
| Installed / usable memory | 32.0 GB DDR4 / 31.9 GB |
| In use (compressed) | 11.4 GB (86.8 MB compressed) |
| Available | 20.5 GB |
| Committed / limit | 9.1 / 33.9 GB |
| Cached | 14.4 GB |
| Paged / non-paged pool | 567 / 756 MB |
| Hardware reserved | 89.3 MB |
| Memory-use indicator | 36% |

The second screenshot shows 35% memory use and a partial process list sorted by Memory. Selected visible rows are bdservicehost 625.6 MB, Search 187.5 MB, Windows Explorer 169.8 MB, NVIDIA Container 156.8 MB, Microsoft Edge 67.6 MB, VMware Workstation 35.7 MB and VMware Workstation VMX 27.8 MB. These are displayed rows, not total application or VMware memory. The screenshots are separate observations. Absence from the visible rows does not establish that Steam or ChatGPT was closed, and the Workstation process-group count does not establish the number of powered-on guests.

The available and committed figures have different meanings, and cache is not added to available RAM. No host-only consumption is calculated by subtracting configured guest allocations from the 11.4 GB in use. This is a useful baseline for a proposed host reserve; it does not measure peak/sustained load or validate the later P1/P2 deployment.

## Storage and access limits

Both configuration-file locations were checked through VM > Settings > Options > Advanced > Configuration. This establishes where the configuration files are stored, not the location of every virtual disk or a custom working directory.

### mgmt-01 virtual disk, 2026-10-17

The user supplied a VMware Hardware > Hard Disk (SCSI) screenshot for mgmt-01. The Windows user-profile prefix is normalised below; the displayed disk is on C:.

| Item | Displayed value |
|---|---|
| Disk file | `%USERPROFILE%\Documents\Virtual Machines\mgmt-01\mgmt-01.vmdk` |
| Current size | 1.7 GB |
| Maximum size | 40 GB |
| System free | 1.3 TB |
| Disk allocation | Not preallocated |
| Disk storage | Single file |
| Configured memory, visible in Hardware | 1 GB |
| Processors, visible in Hardware | 2 |

The current disk size is not the guest filesystem's used/free space or the size of the complete VM folder, snapshots and backups. The maximum is the configured virtual capacity, not preallocated host space. Preserve VMware's displayed units and precision. The screenshot directly confirms the 1 GB memory setting; it does not measure workload performance. No setting change is recorded.

### fw-01 virtual disk, 2026-10-17

A second user screenshot shows fw-01's VMware Hardware > Hard Disk (SCSI) settings. The profile prefix is normalised for the repository.

| Item | Displayed value |
|---|---|
| Disk file | `%USERPROFILE%\Documents\Virtual Machines\fw-01\fw-01-000002.vmdk` |
| Current size | 536.8 MB |
| Maximum size | 40 GB |
| System free | 1.3 TB |
| Disk allocation | Not preallocated |
| Disk storage | Single file |
| Configured memory | 4 GB |
| Processors | 2 |
| Network adapters | NAT; LAN Segment |

The numbered disk filename is consistent with a snapshot disk. This is an inference from the name, not an inspected snapshot chain or a count of two snapshots. See [Broadcom's explanation of snapshot disk relationships](https://knowledge.broadcom.com/external/article/337269/understanding-the-relationship-between-s.html). The displayed 536.8 MB must not be treated as the total footprint of fw-01 or added to mgmt-01's 1.7 GB to claim a complete VM-storage total. Folder measurements follow below. Files outside those folders, snapshot inventory and separate backup coverage remain unverified. No disk or snapshot operation is recorded.

### Complete folder properties, 2026-10-17

Two subsequent Windows Explorer Properties screenshots show the following folders under `%USERPROFILE%\Documents\Virtual Machines`. Units, displayed rounding and byte counts are transcribed as shown.

| Folder | Size | Size on disk | Contains |
|---|---|---|---|
| fw-01 | 16.6 GB (17,832,534,896 bytes) | 13.1 GB (14,109,327,360 bytes) | 24 files, 2 folders |
| mgmt-01 | 1.70 GB (1,835,123,030 bytes) | 1.70 GB (1,835,130,880 bytes) | 14 files, 1 folder |

The summed size on disk is 15,944,458,240 bytes, approximately 14.85 GiB. The summed logical size is 19,667,657,926 bytes. These are directory totals, not guest filesystem usage or a breakdown by base disk, snapshot, memory and other files. Any snapshot files inside the measured folders are already included and must not be added a second time. The difference between size and size on disk is recorded without attributing a cause. External dependencies/backups and future growth are not established by these screenshots. Existing occupied bytes are already reflected in the host free-space reading; do not subtract them again from that reading.

Initial SSH attempts timed out or stopped at client authentication. After the user completed an interactive login on the Mac, the assistant authenticated successfully and executed the runbook's SSH battery. Connectivity results, DNS and bastion-side time matched the runbook; the GUI HTTPS probe returned HTTP 200. The [recheck record](p0-recheck-2026-10-15.md) distinguishes those results from later sudo/firewall-time verification and the reduced-memory bastion trial. Conditional third-device/log work remains separately tracked.

## Planning implications

The reported P0 allocations match the published inventory. The full P1 workload adds 14 GB of nominal VM allocations to those two guests. Comparing that with the earlier 16.6 GB available reading leaves 2.6 GB arithmetically; it is not a prediction of memory residency, peak usage or successful operation.

The follow-up has 20.05 GiB available, with Steam closed. Subtracting the planned additional 14 GB of nominal VM allocations gives roughly 6.05 GB in the plan's rounded arithmetic. Allocated guest memory is not resident usage; this comparison does not validate overhead, peaks, case-management capacity or the full P0–P2 target.

The user has ruled out increasing physical RAM and confirmed on 2026-10-16 that case management must remain on Windows. Its implementation and API/export criteria remain to be decided before P2. A dedicated 4 GB case VM cannot silently be added to a concurrent on-demand window that exceeds 32 GB.

The user has ruled out increasing physical RAM. A feasible allocation and operating-window design must therefore account for Windows, VMware, case-management consumption and headroom within 32 GB. Steam was closed for this host-memory follow-up, which preceded the guest-memory trial. The user later tested the bastion at the requested 1024 MB allocation, including the basic P0 checks and a package-index update. The post-index guest reading shows 647 MiB available and no swap used; a later verified package-upgrade follow-up shows 626 MiB available and no swap used. Those guest readings are distinct from the separate Task Manager host follow-up recorded above. No firewall configuration change or P1 deployment is recorded.

## Still open

- The displayed host/process baseline is recorded; sustained variation and later deployment workloads retain their own checks.
- Guest memory variation, paging and competing host/VMware services; baseline, reduced-memory and post-package-index bastion readings are recorded in the recheck report.
- Files outside the measured VM folders, snapshot inventory/future growth and private backup coverage; both displayed virtual-disk paths and complete folder sizes are recorded above.
- The P1 allocation/concurrency design and documented resolution of the P0–P2 budget conflict.
- Retention implementation and measured growth; the 30/7/30-day policy and protected-data conditions were accepted on 2026-10-17 in decision 0010, with a 260 GiB initial estimated data/temporary allowance.
- The remaining P0 rechecks listed in the recheck report; later P1 ingestion and performance verification retain their phase.

See the [capacity proposal](../docs/decisions/0009-capacity.md) and [P1 preflight record](p1-preflight.md).

