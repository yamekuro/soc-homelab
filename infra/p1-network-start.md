# P1 network preparation

- **Date:** 2026-10-17
- **Status:** Four P1 interface addresses/routes confirmed in Overview; encrypted pre-change export reported complete; new-zone services/policy/endpoint tests pending
- **Prerequisites recorded:** Initial capacity design 0009 selected; retention policy 0010 accepted. Their runtime tests remain pending.

This sequence implements [accepted addressing decision 0003](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/decisions/0003-addressing.md). The curriculum specifies the zones and checks; the small execution steps below are a derived implementation order. They do not reduce P1 scope or close a gate.

| P1 zone | VMware LAN segment | Subnet | Firewall address | Planned interface label |
|---|---|---|---|---|
| USERS | LS-USERS | 10.20.20.0/24 | 10.20.20.1 | vmx2 |
| SERVERS | LS-SERVERS | 10.20.30.0/24 | 10.20.30.1 | vmx3 |
| DMZ | LS-DMZ | 10.20.40.0/24 | 10.20.40.1 | vmx4 |
| SOC | LS-SOC | 10.20.50.0/24 | 10.20.50.1 | vmx5 |

These vmx2–vmx5 labels preserve the original plan, not observed device names. The 2026-10-17 guest inspection below identifies the four new cards as em0–em3. Use the MAC-verified device names for implementation; subnets, zone functions and WAN/MGMT remain as designed.

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

The instruction included Connect at power on for new adapters and saving with OK. The owner supplied the six MAC values above in separate text replies after instructions to read each Advanced dialog without generating/replacing values. Their subsequent VMware console screenshot shows fw-01 booted, root selecting 8) Shell and running `ifconfig -a | grep -E '^[a-z]|ether'`. All six guest MACs match the supplied VMware values:

| Zone | Guest device observed | MAC observed |
|---|---|---|
| WAN / NAT | vmx0 | 00:0c:29:41:fb:3c |
| MGMT | vmx1 | 00:0c:29:41:fb:46 |
| USERS | em0 | 00:50:56:38:67:e7 |
| SERVERS | em1 | 00:50:56:36:af:67 |
| DMZ | em2 | 00:50:56:39:d9:f0 |
| SOC | em3 | 00:50:56:3b:3c:f6 |

The screenshot directly verifies detected device/MAC identity; zone names derive from the user-reported VMware segment mapping. The existing vmx0/vmx1 headers show UP/RUNNING, whereas em0–em3 do not show UP. This is not a source-to-destination connectivity test or evidence that the new zones are configured. No guest assignment or policy change is shown. Do not replace em0–em3 with guessed vmx2–vmx5 names. The [OPNsense console documentation](https://docs.opnsense.org/manual/install.html) describes the shell entry used here.

Before modifying guest interface assignments, addresses or policy, preserve the current encrypted OPNsense configuration outside the VM and ensure VMware console access. This guest export remains required; a `.vmx` copy does not replace it. Follow the existing runbook for orderly shutdown/boot if further adapter changes require it. Plan the temporary loss of SSH/GUI when stopping the firewall.

The GUI access instructions were to start mgmt-01 if needed, reopen/use the existing Mac SSH forward to the firewall GUI (`ssh -N -L 8443:10.20.10.1:443 mgmt-01`) and visit `https://127.0.0.1:8443`. An existing tunnel serving that URL is reused instead of creating a competing listener. Export the complete configuration from System > Configuration > Backups with password protection, keep the encryption password in KeePassXC and the file in private storage outside the VM. The completion reports below record the subsequent export. See [OPNsense configuration backups](https://docs.opnsense.org/manual/backups.html). No file contents or passwords should be sent to the chat or committed to the repository.

The subsequent user browser screenshot (2026-10-17, filename time 12:05:06) shows `https://127.0.0.1:8443/` blocked with `ERR_CERT_AUTHORITY_INVALID` and a certificate-verification message. Record a browser trust failure, not a connection-refused diagnosis or validated firewall identity. OPNsense uses a self-signed GUI certificate by default, which is consistent with this error; the actual certificate has not been inspected. The next guidance is to use the Mac's Chrome browser, as in the earlier working GUI flow, and inspect its certificate-warning options for this specific local lab endpoint. No firewall reset, certificate replacement, global browser-security change or completed configuration export is recorded.

After guidance to open the local lab URL in Chrome and log in with the existing firewall root account, the user reported "Estoy dentro". A subsequent browser screenshot (filename time 12:07:44) directly shows the authenticated root GUI at `/diag_backup.php`, the Download and Restore areas, Do not backup RRD data selected and encryption not yet selected at that capture. The download area has no All selector; the visible All selector belongs to Restore. The later instructions correctly use Download, enable Encrypt this configuration file and preserve the existing RRD exclusion (statistics, not configuration). No certificate identity/trust validation is claimed by reaching this page.

The owner requested assistance storing the encryption password in KeePassXC. Instructions created a separate entry under soc-homelab, proposed title `fw-01 — copia antes de P1 — 2026-10-17`, empty username, the same encryption password as the backup, and a purpose note, followed by saving the database. The owner replied "Hecho". After explicit instructions to enable encryption, use that password, download the full configuration and keep the file in a private Mac folder, the owner again replied "Hecho". Record password storage and encrypted configuration export completion by user report. Exact file location/name, vault contents and file encryption/readability have not been independently inspected, and no restore test is implied. No secret or configuration file content was shared. A Mac copy is outside the Windows VM's storage; private-copy integrity/recovery remains progressive A3 work.

The initial Assignments screenshot (filename time 12:17:07) directly shows wan/WAN on vmx0 (00:0c:29:41:fb:3c) and lan/LAN on vmx1 (00:0c:29:41:fb:46). MGMT is the functional zone of the existing LAN interface; the GUI description remains LAN. Preserve its identifier, device and administrative configuration.

The subsequent Add/Edit Assignment modal (12:17:57) shows em0 (00:50:56:38:67:e7) selected, a blank Description and Lock checked. Instructions set Description USERS, retain em0 and Lock, save and apply. The next Assignments screenshot (12:19:16) confirms opt1 / USERS on em0 with the correct MAC and the existing WAN/LAN rows unchanged. The presence of an Apply button alone does not prove whether the configuration was already applied. That screenshot alone did not verify new-zone IP addressing, enablement or packet-flow behaviour. Subsequent configuration and Overview evidence follows below.

### USERS configuration and Overview, 2026-10-17

The USERS settings screenshots show opt1/em0, Description USERS and Prevent interface removal checked. Enable Interface is initially clear (12:20:29), then checked (12:21:12), revealing IPv4/IPv6 settings. The visible initial defaults are private/bogon filtering clear, both IP types None, MAC/MTU/MSS blank, promiscuous mode clear and default speed/duplex. The configured-form screenshot (12:22:41) shows IPv4 Static, IPv6 None, 10.20.20.1/24, IPv4 gateway rules Disabled, Dynamic gateway policy and Overwrite global settings clear. That form was followed by Save/Apply instructions.

The Interfaces > Overview screenshot (12:23:41) confirms the resulting live interface/address/route state:

| Zone / GUI name | Device | IPv4 type and address | Gateway | Connected route / state |
|---|---|---|---|---|
| USERS (opt1) | em0 | static 10.20.20.1/24 | blank | 10.20.20.0/24; green status icon |
| WAN (wan) | vmx0 | static 10.20.254.10/24 | 10.20.254.2 | default and 10.20.254.0/24; green icon |
| MGMT / LAN (lan) | vmx1 | static 10.20.10.1/24 | blank | 10.20.10.0/24; green icon |
| SERVERS, planned | em1 | not assigned | blank | Unassigned Interface, red icon |
| DMZ, planned | em2 | not assigned | blank | Unassigned Interface, red icon |
| SOC, planned | em3 | not assigned | blank | Unassigned Interface, red icon |

Overview shows IPv6 type none on USERS/WAN/LAN; loopback IPv6 entries are separate and do not establish externally routed IPv6. Address/route state is verified for USERS, while endpoint connectivity, DNS/NTP/DHCP, isolation and positive/negative firewall tests remain pending. No new firewall rule or DHCP service has been configured in this step. No further screenshot of the same USERS fields is needed absent a new discrepancy.

The next instructions assigned SERVERS to em1 / 00:50:56:36:af:67, enabled Static IPv4 10.20.30.1/24, IPv6 None and IPv4 gateway rules Disabled, retaining the internal-interface defaults used for USERS. Subsequent evidence follows.

### SERVERS configuration and Overview, 2026-10-17

The 12:29:53 assignment-modal screenshot shows Description SERVERS but em0 selected and the validation error "Can not assign a device to more interfaces." No duplicate assignment is inferred to have succeeded. Guidance selected em1 / 00:50:56:36:af:67 instead. The 12:30:47 settings screenshot confirms SERVERS / opt2 / em1, removal prevention checked and enablement initially clear, followed by instructions to enable and configure the planned static address. The assignment selector includes already-used devices, so each new zone requires explicit selection of its MAC-verified device rather than accepting the initial em0 selection.

The 12:32:00 Overview screenshot confirms SERVERS (opt2) on em1, static IPv4 10.20.30.1/24, IPv6 type none, blank gateway and connected route 10.20.30.0/24, with a green status icon. USERS retains 10.20.20.1/24 and its route; WAN retains 10.20.254.10/24 through 10.20.254.2 and MGMT/LAN retains 10.20.10.1/24. em2 and em3 remain unassigned. This verifies resulting interface/address/route state, not source traffic, service coverage or isolation.

The next instructions assigned/configured DMZ using em2 / 00:50:56:39:d9:f0, Static IPv4 10.20.40.1/24, IPv6 None, IPv4 gateway rules Disabled and the same internal-interface defaults. The 12:34:23 Overview screenshot confirms DMZ (opt3) on em2 with static 10.20.40.1/24, IPv6 none, blank gateway, route 10.20.40.0/24 and a green status icon. USERS, SERVERS, WAN and MGMT/LAN retain their prior addresses/routes. em3 is still unassigned. Interface/address/route state is verified for these three new zones; endpoint service/connectivity and isolation tests remain pending.

The SOC instructions used em3 / 00:50:56:3b:3c:f6, Static IPv4 10.20.50.1/24, IPv6 None, IPv4 gateway rules Disabled and the same internal-interface defaults. The 12:40:43 Assignments screenshot confirms SOC/opt4 on em3 with the expected MAC; WAN/wan, LAN/lan and opt1–opt3 retain their prior devices/MACs.

### All four P1 interface addresses, 2026-10-17

The 12:41:18 Overview screenshot confirms the completed interface-address milestone:

| Zone | Identifier | Device | IPv4 | Route | IPv6 type / upstream gateway |
|---|---|---|---|---|---|
| USERS | opt1 | em0 | 10.20.20.1/24, static | 10.20.20.0/24 | none / blank |
| SERVERS | opt2 | em1 | 10.20.30.1/24, static | 10.20.30.0/24 | none / blank |
| DMZ | opt3 | em2 | 10.20.40.1/24, static | 10.20.40.0/24 | none / blank |
| SOC | opt4 | em3 | 10.20.50.1/24, static | 10.20.50.0/24 | none / blank |
| WAN | wan | vmx0 | 10.20.254.10/24, static | default; 10.20.254.0/24 | none / 10.20.254.2 |
| MGMT (GUI LAN) | lan | vmx1 | 10.20.10.1/24, static | 10.20.10.0/24 | none / blank |

All six rows show green status icons. These are observed device/address/route states, not end-to-end connectivity, DNS/NTP service access, source coverage or firewall-isolation evidence. enc0/pflog0 remain separate unassigned system interfaces. Do not reassign them as lab zones. WAN/MGMT address and route values match the earlier observations. No new source VM or service rule is recorded as deployed by this milestone.

Add the four adapters for USERS, SERVERS, DMZ and SOC, each attached to its corresponding LAN segment. Record adapter number, MAC address, segment, detected OPNsense interface and zone before assigning addresses. vmx2–vmx5 are design labels, not proof of the detected MAC/interface order. Never reassign WAN/MGMT based only on a guessed enumeration. Configure and verify one zone at a time from the console/administrative path. No DHCP is introduced except the USERS service specified by the accepted design; server/SOC addresses follow the static range .10–.99.

## 3. Apply the documented services and policy before onboarding sources

Read the current network plan/rules at implementation; the guide is not an implicit allow-any policy. Carry forward R04 when its targets exist and verify R05/R13/R13a/R15 for every new zone. Establish the required DNS/time and minimum package/admin/telemetry flows; preserve home/host-network isolation. Add name-based DoH blocking, including the Firefox canary, before browsers enter USERS.

The immediate next read-only inspection is Services > Unbound DNS > General, including Enable and Network Interfaces, to determine whether the existing resolver listens on the new zone addresses. Inspect access lists as needed before changing them; do not assume a wildcard selector or automatic ACL coverage. Preserve accepted decision 0004's strict DoT upstreams, DNSSEC, no plaintext fallback and no-ipv6.conf. Decision 0005 retains fw-01 as each zone's sole time source; inspect its service interface/ACL coverage separately. Required R05 permissions and other zone rules still need implementation and endpoint/log verification. Creating interfaces alone does not provide those permissions.

Resolve and document the bastion-to-Wazuh telemetry/enrolment gap: existing R06 names USERS/SERVERS/DMZ, while R04's administrative ports do not cover agent events/enrolment. Resolve the firewall log flow R07 explicitly. Verify rules with positive/negative tests and matching logs rather than relying only on failed TCP probes. Preserve IPv4/IPv6 scope and the existing default-deny design.

## 4. Deploy and verify P1 progressively

Prepare the SOC Wazuh VM using decision 0009's initial 4 vCPU, 8192 MiB and 300 GiB disk design, selecting a supported OS and fixing actual versions before installation. Confirm current free space and the actual created disk capacity/units; no disk is provisioned by this guide. Do not run an installer before its zone and required flows are established.

Then onboard the required Windows/Linux, bastion, firewall and service sources, including legitimate activity and auditing. Preserve configurations, samples, data contract, fixtures and source-to-alert traces. Implement the accepted retention with independent index/file lifecycle handling and protected exports. Test interruption, loss/recovery, source health, disk growth, memory/paging and historical retrieval during P1. Lock the bastion root password only after sudo is proven and its logs reach Wazuh, as required by decision 0008.

Gate evidence, verified write-up and publication remain necessary to close P1. A segment list, resource decision or installer success alone does not meet that gate. Progressive recovery/control work and parallel L retain their original scope.
