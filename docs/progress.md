# Lab Progress

Updated: 2026-09-30

## P0 — Reproducible base: in progress

### Completed

- Installed VMware Workstation Pro on the Windows 11 lab host.
- Configured VMnet8 NAT as `10.20.254.0/24`, with gateway `10.20.254.2`.
- Created `fw-01` and installed OPNsense 26.7.
- Configured `fw-01` with 1 virtual processor, 2 cores, 4 GiB RAM, and a 40 GiB thin-provisioned disk. UEFI is enabled and Secure Boot is disabled.
- Created the `LS-MGMT` LAN segment and connected the firewall's second network adapter.
- Assigned WAN to `em0` (now `vmx0`): static IPv4 `10.20.254.10/24`, gateway and DNS `10.20.254.2`.
- Assigned LAN to `em1` (now `vmx1`): static IPv4 `10.20.10.1/24`. The LAN DHCP server is disabled.
- Verified connectivity from OPNsense to the NAT gateway, to `1.1.1.1`, and confirmed DNS resolution for `opnsense.org`.
- Deployed `mgmt-01` (Debian 13, no desktop) on `LS-MGMT`: static IPv4 `10.20.10.10/24`, gateway and DNS `10.20.10.1`.
- Updated OPNsense to 26.7.4_1. It ships Unbound 1.26.1, which fixes nine vulnerabilities, including CVE-2026-81642 (possible remote code execution when processing a DNSKEY).
- Moved Unbound to DNS over TLS upstreams with DNSSEC validation ([decision 0004](decisions/0004-upstream-dns.md)). Verified on 2026-09-28:
  - TLS on port 853 to `9.9.9.10` and `1.1.1.1`, with the certificates verified against `dns10.quad9.net` and `one.one.one.one`.
  - `drill -D isc.org @127.0.0.1` returns `NOERROR` with the `ad` flag, and `drill dnssec-failed.org @127.0.0.1` returns `SERVFAIL`.
  - A capture on the WAN during a fresh lookup showed only TLS to port 853, and a capture of port 53 during another lookup saw no packets.
  - `mgmt-01` resolves `deb.debian.org` and `apt update` succeeds.
- Replaced `fw-01`'s e1000 adapters with VMXNET3, as the network plan specifies. WAN is now `vmx0` (VMnet8 NAT) and LAN is `vmx1` (`LS-MGMT`), with the same MAC addresses as before. Verified on 2026-09-30:
  - Compared with the configuration backup from before the change, `config.xml` differs only in the interface names (`em0` → `vmx0`, `em1` → `vmx1`) and in save timestamps.
  - `fw-01` reaches `1.1.1.1`, and `drill -D isc.org @127.0.0.1` returns `NOERROR` with the `ad` flag.
  - `mgmt-01` resolves `deb.debian.org` and `apt update` succeeds.
- Applied the pending Debian security updates on `mgmt-01` (OpenSSL, PCRE2 and kernel 6.12.111) and installed the OpenSSH server.
- Built the administrative path R02: Mac (`192.168.0.129`) → host port `2222` (`192.168.0.41`) → VMware NAT port forward to `10.20.254.10:2222` → OPNsense Destination NAT to `mgmt-01:22`.
  - Windows Defender Firewall allows inbound TCP `2222` only from the Mac (rule *soc-homelab R02 SSH 2222 from Mac*, group `soc-homelab`, Public profile, which is the home network's profile).
  - On the OPNsense WAN, *Block private networks* is disabled and *Block bogon networks* stays on, because `10.20.254.0/24` is not in the bogons table. The Destination NAT rule uses *Firewall rule: Manual*, and R02 is an explicit WAN rule in *Rules [new]*: pass and log TCP from the Mac to `10.20.10.10:22`.
  - `mgmt-01` accepts SSH keys only (`PasswordAuthentication no`, `KbdInteractiveAuthentication no` and `PermitRootLogin no` in `/etc/ssh/sshd_config.d/10-bastion.conf`). The Mac uses a dedicated Ed25519 key protected by a passphrase. The host key fingerprint was checked against the `mgmt-01` console before the first connection.
- The web GUI is now reached through the bastion, the path R03 describes: `ssh -N -L 8443:10.20.10.1:443 mgmt-01` from the Mac, then `https://127.0.0.1:8443`.
- Verified the administrative path on 2026-09-30:
  - The Mac logs in to `mgmt-01` with its key, and the firewall log shows R02 passing the connection from `192.168.0.129`.
  - A connection from another address (the Windows host itself, `192.168.0.41`) is blocked by the default deny rule and logged.
  - Password logins are refused with `Permission denied (publickey)`.
  - The OPNsense web GUI opens through the SSH tunnel.

### Problems found

- The home router intercepts all DNS on port 53, over UDP and TCP, and answers itself. Unbound could not prime the root, and it also wasted its per-query send limit on IPv6 targets without an IPv6 route. Diagnosis and fix: [decision 0004](decisions/0004-upstream-dns.md).
- The first update attempt could not download the repository catalogue. A direct download of the same file worked and a retry succeeded; the cause was not identified.
- The web GUI is only reachable from the bastion (R03), but the path to the bastion (R02) is itself configured in the web GUI. To make the DNS changes, the packet filter was disabled for a few minutes (`pfctl -d`), the GUI was reached from the host at `10.20.254.10`, and the filter was re-enabled (`pfctl -e`). This was a temporary exception to R03. It was used once more on 2026-09-30 to build R02 and is no longer needed, because the GUI is now reached through the bastion.
- After the adapter change, OPNsense could not find `em0` and `em1` at boot. Nobody pressed a key during the console countdown, so it assigned the interfaces automatically, LAN to the first adapter and WAN to the second, which put them the wrong way round. Assigning the WAN from the console also resets it to DHCP and DHCPv6, so its static address was lost ([`console.inc`](https://github.com/opnsense/core/blob/master/src/etc/inc/console.inc)). Fixed from the console with *Assign interfaces* and *Set interface IP address*. If the adapters change again, watch the console on the first boot, assign the interfaces by hand and then set the WAN address again.
- The network plan assumed that R02 traffic would reach the WAN from the VMware NAT network (`10.20.254.0/24`). The firewall log showed that VMware's NAT keeps the client's original address when it forwards a port: the first attempt arrived from the Mac (`192.168.0.129`) and was blocked by the default deny rule. R02 now matches the Mac's address, so `fw-01` also enforces "only from the Mac", not just Windows. The [network plan](network-plan.html) was corrected (rev B).

### Remaining before the P0 exit gate

- Reserve the Mac's (`192.168.0.129`) and the host's (`192.168.0.41`) addresses in the home router's DHCP, or update R02 and the Windows firewall rule whenever they change.
- Enforce R05, R13 and R15 so no zone can bypass `fw-01` for DNS, either directly on port 53 or through DNS over HTTPS.
- Configure NTP on `fw-01` with at least one server by IP address, and point `mgmt-01` to `fw-01` for time (R05). Align `mgmt-01`'s time zone too: it shows British Summer Time (BST), while `fw-01` uses UTC.
- Complete and verify the firewall access matrix, network isolation, DNS/NTP, and recovery procedure. This includes an explicit R03 rule and a test of the Windows firewall rule from a third device on the home network.

No credentials are included in this log.
