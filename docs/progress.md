# Lab Progress

Updated: 2026-10-01

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
- Reserved the addresses R02 depends on in the home router's DHCP (*Configuración › LAN › DHCP estático*): the Mac (`3e:c2:48:9d:b0:84`, macOS private Wi-Fi address set to *Fixed*) gets `192.168.0.129`, and the Windows host (`DESKTOP-GO7E8EO`, `04:42:1a:ed:ea:c6`) gets `192.168.0.41`. Verified on 2026-10-01:
  - Both entries are still there after reloading the page.
  - After applying them, `ssh mgmt-01 hostname` from the Mac still works. That needs both addresses: R02 and the Windows firewall rule accept only `.129`, and the SSH configuration connects to `.41`.
- Recorded the home network for R01: the home LAN is `192.168.0.0/24` (router `.1`, dynamic pool `.10`–`.250`, 24-hour leases) and the guest network is `192.168.5.0/24` (router `192.168.5.1`). The [network plan](network-plan.html) (rev C) adds the guest network to HOME_NETS and the reservations and sleep setting to the host notes. Both reservations are inside the dynamic pool. The router accepted them, but no Vodafone documentation confirms that it keeps reserved addresses out of dynamic assignment.
- Configured NTP on `fw-01` ([decision 0005](decisions/0005-time.md)): the four default pool names stay, and Cloudflare's `162.159.200.1` and `162.159.200.123` are added by IP address with *Iburst*, so the clock can be corrected without DNS. Verified on 2026-10-01:
  - Before the change, `fw-01` already reached public NTP servers, and the home router does not intercept NTP: each server reported its own reference and stratum.
  - About 20 seconds after the service restarted, `162.159.200.123` was the system peer and `162.159.200.1` a candidate. Every offset was below 8 ms.
- Pointed `mgmt-01` to `fw-01` for time and set its time zone to UTC. `/etc/systemd/timesyncd.conf.d/10-fw-01.conf` sets `NTP=10.20.10.1` and an empty `FallbackNTP=`. Before the change, `mgmt-01` took its time directly from `2.debian.pool.ntp.org`, bypassing `fw-01`'s NTP service. Verified on 2026-10-01, after a host restart: `timedatectl timesync-status` shows server `10.20.10.1`, stratum 3, an offset of +0.669 ms, and the time zone is `Etc/UTC`.
- Disabled sleep on the Windows host while it is plugged in (`powercfg /change standby-timeout-ac 0`; it was 15 minutes). Hibernation was already off. On battery the host still sleeps after 10 minutes.

### Problems found

- The home router intercepts all DNS on port 53, over UDP and TCP, and answers itself. Unbound could not prime the root, and it also wasted its per-query send limit on IPv6 targets without an IPv6 route. Diagnosis and fix: [decision 0004](decisions/0004-upstream-dns.md).
- The first update attempt could not download the repository catalogue. A direct download of the same file worked and a retry succeeded; the cause was not identified.
- The web GUI is only reachable from the bastion (R03), but the path to the bastion (R02) is itself configured in the web GUI. To make the DNS changes, the packet filter was disabled for a few minutes (`pfctl -d`), the GUI was reached from the host at `10.20.254.10`, and the filter was re-enabled (`pfctl -e`). This was a temporary exception to R03. It was used once more on 2026-09-30 to build R02 and is no longer needed, because the GUI is now reached through the bastion.
- After the adapter change, OPNsense could not find `em0` and `em1` at boot. Nobody pressed a key during the console countdown, so it assigned the interfaces automatically, LAN to the first adapter and WAN to the second, which put them the wrong way round. Assigning the WAN from the console also resets it to DHCP and DHCPv6, so its static address was lost ([`console.inc`](https://github.com/opnsense/core/blob/master/src/etc/inc/console.inc)). Fixed from the console with *Assign interfaces* and *Set interface IP address*. If the adapters change again, watch the console on the first boot, assign the interfaces by hand and then set the WAN address again.
- The network plan assumed that R02 traffic would reach the WAN from the VMware NAT network (`10.20.254.0/24`). The firewall log showed that VMware's NAT keeps the client's original address when it forwards a port: the first attempt arrived from the Mac (`192.168.0.129`) and was blocked by the default deny rule. R02 now matches the Mac's address, so `fw-01` also enforces "only from the Mac", not just Windows. The [network plan](network-plan.html) was corrected (rev B).
- After `fw-01` booted at 09:07 UTC on 2026-10-01, its NTP service had no time sources until about 09:11, when the pool servers appeared. Not confirmed: the pool names could not be resolved yet. The servers added by IP address do not need DNS.
- The Windows host went to sleep twice with the VMs running, from 11:35 to 11:39 and from 11:54 to 11:58 CEST on 2026-10-01 (Kernel-Power 42 and Power-Troubleshooter 1 in the System log). The VMs stopped during each sleep. After the first one, `mgmt-01`'s clock was 233 s behind, and `fw-01` advertised a root distance above 5 s, so its own clock was off too: ntpd adds its own offset to the root dispersion it advertises, and waits 300 s before stepping the clock. `mgmt-01` refused `fw-01`'s time (`Server has too large root distance`, limit 5 s) from 09:44 UTC until it accepted it at 09:52 UTC (the journal shows the first refusal at 09:40, because `mgmt-01`'s clock was still behind). Fixed by disabling sleep on AC power ([decision 0005](decisions/0005-time.md)).
- The host restart at 12:11 CEST on 2026-10-01 was logged as unclean (Kernel-Power 41), and the VMs were cut off without an orderly shutdown: `mgmt-01`'s journal has no shutdown entries. Before restarting the host, shut down `mgmt-01` and then `fw-01`. At start-up, start `fw-01` first, because `mgmt-01` depends on it for DNS, time and Internet access.
- `sudo` is not installed on `mgmt-01`, because a root password was set during installation. Administrative commands used `su -l -c`.

### Remaining before the P0 exit gate

- Enforce R05, R13 and R15 so no zone can bypass `fw-01` for DNS, either directly on port 53 or through DNS over HTTPS, or for time (UDP 123 to the Internet).
- When building R01, include the guest network `192.168.5.0/24` in HOME_NETS, as the [network plan](network-plan.html) does since rev C.
- Restart `fw-01` on purpose and run `ntpq -pn` within a minute of boot, to confirm that the servers configured by IP address answer before the pool does.
- Decide whether to install `sudo` on `mgmt-01`, so every administrative command is logged with the user who ran it.
- Complete and verify the firewall access matrix, network isolation, DNS/NTP, and recovery procedure. This includes an explicit R03 rule and a test of the Windows firewall rule from a third device on the home network.

No credentials are included in this log.
