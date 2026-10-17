# P1 network preparation

- **Date:** 2026-10-17
- **Status:** Segment list, VMX copy and six-adapter segment/MAC inventory reported by the user; guest interface mapping/configuration pending
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

Evidence: record the resulting named segment list and its provenance. A user confirmation can advance this execution step; do not label it as an independently inspected screenshot or as verification of routing/firewall policy.

### User follow-up, 2026-10-17

The user initially reported only LS-MGMT. After instructions to add LS-USERS, LS-SERVERS, LS-DMZ and LS-SOC, the user confirmed that the list matches the instructed five-segment list and could not supply a screenshot. Record segment definitions as completed by user report. The earlier adapter-settings screenshot directly shows Network Adapter 2 assigned to LS-MGMT with Connect at power on checked; it does not show the new segment list. The user subsequently confirmed fw-01 was powered off ("Apagada") before the hardware steps recorded below. No new guest address or firewall policy is recorded as implemented yet.

## 2. Add/map firewall interfaces in a recoverable change

Preserve recovery material in two stages. While fw-01 is confirmed powered off, close/save its settings and copy the existing `.vmx` file to a separate private folder before adding hardware. This preserves VMware's adapter configuration; it is not a backup of the guest disk, snapshot chain or OPNsense settings and no restore test is claimed. Retain WAN/MGMT settings and MACs. The first hardware instruction adds the USERS adapter, configures LAN segment LS-USERS and Connect at power on, and leaves the VM powered off for the remaining hardware mapping.

The user replied "Hecho" to the VMX-copy and USERS-adapter instructions. Record completion of those instructed steps by user report, without independent inspection of the copy or adapter settings. The subsequent instructions added SERVERS, DMZ and SOC and requested confirmation of all six mappings while leaving fw-01 powered off. The user answered "Si". Thus the following mapping is confirmed by user report, not an independently inspected screenshot:

| VMware adapter | Connection reported | MAC |
|---|---|---|
| Network Adapter | NAT (existing WAN) | 00:0C:29:41:FB:3C |
| Network Adapter 2 | LS-MGMT | 00:0C:29:41:FB:46 |
| Network Adapter 3 | LS-USERS | 00:50:56:38:67:E7 |
| Network Adapter 4 | LS-SERVERS | 00:50:56:36:AF:67 |
| Network Adapter 5 | LS-DMZ | 00:50:56:39:D9:F0 |
| Network Adapter 6 | LS-SOC | 00:50:56:3B:3C:F6 |

The instruction included Connect at power on for new adapters and saving with OK; their connection state has not been independently inspected. The owner supplied the six MAC values above in separate text replies after instructions to read each Advanced dialog without generating/replacing values. These are distinct and syntactically valid; they are user-transcribed VMware values, not an observed guest mapping. Guest interface assignments, encrypted OPNsense export and new-zone addressing/policy remain pending.

The next read-only guest step is to save/close VMware settings, boot fw-01, enter its local console as root and select 8) Shell, as described in the [OPNsense console documentation](https://docs.opnsense.org/manual/install.html). Run `ifconfig -a | grep -E '^[a-z]|ether'` to display interface headings and Ethernet MACs, then compare against this inventory. This command has been instructed, not executed or observed by the assistant. Record actual detected names without inferring vmx2–vmx5 from VMware adapter numbering. Do not change guest interface assignments in this inspection step.

Before modifying guest interface assignments, addresses or policy, preserve the current encrypted OPNsense configuration outside the VM and ensure VMware console access. This guest export remains required; a `.vmx` copy does not replace it. Follow the existing runbook for orderly shutdown/boot if further adapter changes require it. Plan the temporary loss of SSH/GUI when stopping the firewall.

Add the four adapters for USERS, SERVERS, DMZ and SOC, each attached to its corresponding LAN segment. Record adapter number, MAC address, segment, detected OPNsense interface and zone before assigning addresses. vmx2–vmx5 are design labels, not proof of the detected MAC/interface order. Never reassign WAN/MGMT based only on a guessed enumeration. Configure and verify one zone at a time from the console/administrative path. No DHCP is introduced except the USERS service specified by the accepted design; server/SOC addresses follow the static range .10–.99.

## 3. Apply the documented services and policy before onboarding sources

Read the current network plan/rules at implementation; the guide is not an implicit allow-any policy. Carry forward R04 when its targets exist and verify R05/R13/R13a/R15 for every new zone. Establish the required DNS/time and minimum package/admin/telemetry flows; preserve home/host-network isolation. Add name-based DoH blocking, including the Firefox canary, before browsers enter USERS.

Resolve and document the bastion-to-Wazuh telemetry/enrolment gap: existing R06 names USERS/SERVERS/DMZ, while R04's administrative ports do not cover agent events/enrolment. Resolve the firewall log flow R07 explicitly. Verify rules with positive/negative tests and matching logs rather than relying only on failed TCP probes. Preserve IPv4/IPv6 scope and the existing default-deny design.

## 4. Deploy and verify P1 progressively

Prepare the SOC Wazuh VM using decision 0009's initial 4 vCPU, 8192 MiB and 300 GiB disk design, selecting a supported OS and fixing actual versions before installation. Confirm current free space and the actual created disk capacity/units; no disk is provisioned by this guide. Do not run an installer before its zone and required flows are established.

Then onboard the required Windows/Linux, bastion, firewall and service sources, including legitimate activity and auditing. Preserve configurations, samples, data contract, fixtures and source-to-alert traces. Implement the accepted retention with independent index/file lifecycle handling and protected exports. Test interruption, loss/recovery, source health, disk growth, memory/paging and historical retrieval during P1. Lock the bastion root password only after sudo is proven and its logs reach Wazuh, as required by decision 0008.

Gate evidence, verified write-up and publication remain necessary to close P1. A segment list, resource decision or installer success alone does not meet that gate. Progressive recovery/control work and parallel L retain their original scope.
