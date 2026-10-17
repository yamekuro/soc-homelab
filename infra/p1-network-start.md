# P1 network preparation

- **Date:** 2026-10-17
- **Status:** Execution guide; no segment creation, interface change or VM deployment verified yet
- **Prerequisites recorded:** Initial capacity design 0009 selected; retention policy 0010 accepted. Their runtime tests remain pending.

This sequence implements [accepted addressing decision 0003](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/decisions/0003-addressing.md). The curriculum specifies the zones and checks; the small execution steps below are a derived implementation order. They do not reduce P1 scope or close a gate.

| P1 zone | VMware LAN segment | Subnet | Firewall address | Planned interface label |
|---|---|---|---|---|
| USERS | LS-USERS | 10.20.20.0/24 | 10.20.20.1 | vmx2 |
| SERVERS | LS-SERVERS | 10.20.30.0/24 | 10.20.30.1 | vmx3 |
| DMZ | LS-DMZ | 10.20.40.0/24 | 10.20.40.1 | vmx4 |
| SOC | LS-SOC | 10.20.50.0/24 | 10.20.50.1 | vmx5 |

Existing WAN/NAT and LS-MGMT are the administrative baseline. P2 ATTACK and isolated SANDBOX, P5 AI and P6 OT retain their phases; the sandbox has no firewall interface. These are virtual LAN segments, not a claim of 802.1Q VLAN implementation.

## 1. Inspect/create the segment definitions

On the Windows desktop, select fw-01 in VMware, open VM > Settings > Hardware > Network Adapter 2, and open LAN Segments. Inspect the list before adding anything. Create only missing LS-USERS, LS-SERVERS, LS-DMZ and LS-SOC definitions using Add. Preserve existing definitions and leave the existing adapter on its current MGMT segment. Creating named definitions does not establish the interfaces, routing, services or firewall policy.

The [VMware Workstation Pro guide](https://techdocs2-prod.adobecqms.net/content/dam/broadcom/techdocs/us/en/pdf/vmware/desktop-hypervisors/workstation/vmware-workstation-pro-17-0.pdf) describes LAN Segments under virtual-machine network-adapter settings. If the current UI differs, inspect the user's screenshot rather than guessing a different connection type. Do not replace a LAN segment with a bridged/home-network connection.

Evidence: capture the resulting named segment list and record the date; do not mark this step executed until supplied or directly observed.

## 2. Add/map firewall interfaces in a recoverable change

Before an interface change, preserve the current encrypted OPNsense configuration outside the VM and ensure VMware console access. Follow the existing runbook for orderly shutdown/boot if required for the adapter change. Plan the temporary loss of SSH/GUI when stopping the firewall. Retain its current WAN and MGMT adapter settings and MAC addresses.

Add the four adapters for USERS, SERVERS, DMZ and SOC, each attached to its corresponding LAN segment. Record adapter number, MAC address, segment, detected OPNsense interface and zone before assigning addresses. vmx2–vmx5 are design labels, not proof of the detected MAC/interface order. Never reassign WAN/MGMT based only on a guessed enumeration. Configure and verify one zone at a time from the console/administrative path. No DHCP is introduced except the USERS service specified by the accepted design; server/SOC addresses follow the static range .10–.99.

## 3. Apply the documented services and policy before onboarding sources

Read the current network plan/rules at implementation; the guide is not an implicit allow-any policy. Carry forward R04 when its targets exist and verify R05/R13/R13a/R15 for every new zone. Establish the required DNS/time and minimum package/admin/telemetry flows; preserve home/host-network isolation. Add name-based DoH blocking, including the Firefox canary, before browsers enter USERS.

Resolve and document the bastion-to-Wazuh telemetry/enrolment gap: existing R06 names USERS/SERVERS/DMZ, while R04's administrative ports do not cover agent events/enrolment. Resolve the firewall log flow R07 explicitly. Verify rules with positive/negative tests and matching logs rather than relying only on failed TCP probes. Preserve IPv4/IPv6 scope and the existing default-deny design.

## 4. Deploy and verify P1 progressively

Prepare the SOC Wazuh VM using decision 0009's initial 4 vCPU, 8192 MiB and 300 GiB disk design, selecting a supported OS and fixing actual versions before installation. Confirm current free space and the actual created disk capacity/units; no disk is provisioned by this guide. Do not run an installer before its zone and required flows are established.

Then onboard the required Windows/Linux, bastion, firewall and service sources, including legitimate activity and auditing. Preserve configurations, samples, data contract, fixtures and source-to-alert traces. Implement the accepted retention with independent index/file lifecycle handling and protected exports. Test interruption, loss/recovery, source health, disk growth, memory/paging and historical retrieval during P1. Lock the bastion root password only after sudo is proven and its logs reach Wazuh, as required by decision 0008.

Gate evidence, verified write-up and publication remain necessary to close P1. A segment list, resource decision or installer success alone does not meet that gate. Progressive recovery/control work and parallel L retain their original scope.
