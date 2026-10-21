# Historical capacity observations · public summary

The original measurements used the real host and guests. This summary does not represent measurements made against the illustrative machines in the public diagrams. Process lists, personal applications, paths and raw screenshots are omitted.

The host has a 32 GiB memory constraint. Initial observations covered only the firewall and bastion workload; configured guest allocations and host memory readings were not a synchronized measurement of the eventual full phase. A later bastion trial reduced its allocation and passed the recorded basic checks.

The selected initial plan budgets six P1 guests at 19 GiB, a host/application/hypervisor/case allowance of 8 GiB, and at most one provisional 4 GiB demand guest: 31 GiB in total. Those are planning allocations, not a measured sustained peak. See the [capacity decision](../docs/decisions/0009-capacity.md).

Storage allowances and the [retention targets](../docs/decisions/0010-retention.md) remain estimates until ingestion, index growth, host headroom and recovery are measured. Capacity, CPU overcommit and memory availability must be checked with the actual deployed workload.
