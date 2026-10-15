# P0 measurements reported on 2026-10-15

- **Status:** Initial user-reported readings; capacity and retention decisions remain open
- **Source:** Initial readings were reported from Windows Task Manager, File Explorer and VMware settings. A later read-only CIM query is shown in user-supplied PowerShell screenshots, with its workload context confirmed by the user.
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

## Storage and access limits

Both configuration-file locations were checked through VM > Settings > Options > Advanced > Configuration. This establishes where the configuration files are stored, not the location of every virtual disk or a custom working directory. VM file sizes, snapshot locations/growth and the separate backup destination remain to be checked.

Initial SSH attempts timed out or stopped at client authentication. After the user completed an interactive login on the Mac, the assistant authenticated successfully and executed the runbook's SSH battery. Connectivity results, DNS and bastion-side time matched the runbook; the GUI HTTPS probe returned HTTP 200. The [recheck record](p0-recheck-2026-10-15.md) distinguishes those results from the remaining sudo, firewall-console and third-device/log checks.

## Planning implications

The reported P0 allocations match the published inventory. The full P1 workload adds 14 GB of nominal VM allocations to those two guests. Comparing that with the earlier 16.6 GB available reading leaves 2.6 GB arithmetically; it is not a prediction of memory residency, peak usage or successful operation.

The follow-up has 20.05 GiB available, with Steam closed. Subtracting the planned additional 14 GB of nominal VM allocations gives roughly 6.05 GB in the plan's rounded arithmetic. Allocated guest memory is not resident usage; this comparison does not validate overhead, peaks, case-management capacity or the full P0–P2 target.

The user has ruled out increasing physical RAM. A feasible allocation and operating-window design must therefore account for Windows, VMware, case-management consumption and headroom within 32 GB. Steam was closed for the follow-up. No guest allocation, firewall rule or deployment was changed.

## Still open

- The usual host applications and an observed baseline/variation for that workload.
- Guest memory variation, paging and competing host/VMware services; an initial bastion reading is recorded in the recheck report.
- Virtual-disk/working-directory locations, VM file sizes, snapshots and private backup coverage.
- The P1 allocation/concurrency design and documented resolution of the P0–P2 budget conflict.
- Retention windows, storage allowances, preservation and expiry by data category.
- The remaining P0 rechecks listed in the recheck report; later P1 ingestion and performance verification retain their phase.

See the [capacity proposal](../docs/decisions/0009-capacity.md) and [P1 preflight record](p1-preflight.md).

