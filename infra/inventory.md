# Infrastructure by role · public edition

Internal names and addresses are illustrative. Personal host identity, access accounts, key filenames, secret locations and exact software fingerprints are omitted. The complete operating inventory is kept separately.

| Role | Platform family | Resource context | Evidence state |
|---|---|---|---|
| Workstation host | Desktop hypervisor on Windows | 32 GiB memory constraint | Capacity budget must be verified under representative load |
| Firewall | OPNsense | Historical baseline: 2 vCPU, 4 GiB memory, 40 GiB disk | Existing role; baseline and future budget are distinct |
| Bastion | Debian without desktop | Historical 2 GiB baseline; later 1 GiB trial | Basic trial passed; first Wazuh agent and scoped delivery/recovery tests observed; sustained workload pending |
| Wazuh all-in-one | Ubuntu Server | 4 vCPU, 8 GiB allocated memory, 300 GB virtual disk shown by hypervisor | Deployed; four central services active and first-agent indexed events observed; sustained capacity untested |
| USERS, SERVERS and DMZ sources | Windows/Linux roles | See accepted capacity plan | New sources and services pending |

The [28 October validation](../docs/wazuh-first-agent-validation.md) records the central deployment and first-agent checks. The [illustrative network plan](https://yamekuro.github.io/soc-homelab/network-plan.html) describes intended topology, not a live inventory. The [capacity decision](../docs/decisions/0009-capacity.md) records the selected allocation and its limits. Installation versions are evaluated and pinned during deployment; this table is not a current fingerprint of a reachable system.
