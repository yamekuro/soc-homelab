# P0 measurements reported on 2026-10-15

- **Status:** Initial user-reported readings; capacity and retention decisions remain open
- **Source:** The user read Windows Task Manager, File Explorer and VMware settings during the lab session. No automated Windows capture or screenshot was supplied.
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

## Storage and access limits

Both configuration-file locations were checked through VM > Settings > Options > Advanced > Configuration. This establishes where the configuration files are stored, not the location of every virtual disk or a custom working directory. VM file sizes, snapshot locations/growth and the separate backup destination remain to be checked.

An SSH attempt from the assistant's Mac to the configured bastion connection timed out. That result does not identify the cause or establish whether a P0 rule is working. The existing P0 verification battery and third-device check remain pending for this session.

## Planning implications

The reported P0 allocations match the published inventory. The full P1 workload adds 14 GB of nominal VM allocations to those two guests. Comparing that with the earlier 16.6 GB available reading leaves 2.6 GB arithmetically; it is not a prediction of memory residency, peak usage or successful operation.

The user has ruled out increasing physical RAM. A feasible allocation and operating-window design must therefore account for Windows, VMware, case-management consumption and headroom within 32 GB. No guest allocation, application state, firewall rule or deployment was changed while collecting these readings.

## Still open

- The usual host applications and an observed baseline/variation for that workload.
- Guest memory usage, paging and competing host/VMware services.
- Virtual-disk/working-directory locations, VM file sizes, snapshots and private backup coverage.
- The P1 allocation/concurrency design and documented resolution of the P0–P2 budget conflict.
- Retention windows, storage allowances, preservation and expiry by data category.
- The P0 checks; later P1 ingestion and performance verification retain their phase.

See the [capacity proposal](../docs/decisions/0009-capacity.md) and [P1 preflight record](p1-preflight.md).
