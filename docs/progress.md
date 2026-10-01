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
  - A Windows Defender Firewall rule allows inbound TCP `2222` only from the Mac (rule *soc-homelab R02 SSH 2222 from Mac*, group `soc-homelab`, Public profile, which is the home network's profile). On 2026-10-01 it turned out not to be applied, because Bitdefender manages the host's firewall. See the third-device test below and [decision 0007](decisions/0007-host-firewall.md).
  - On the OPNsense WAN, *Block private networks* is disabled and *Block bogon networks* stays on, because `10.20.254.0/24` is not in the bogons table. The Destination NAT rule uses *Firewall rule: Manual*, and R02 is an explicit WAN rule in *Firewall ‣ Rules*: pass and log TCP from the Mac to `10.20.10.10:22`.
  - `mgmt-01` accepts SSH keys only (`PasswordAuthentication no`, `KbdInteractiveAuthentication no` and `PermitRootLogin no` in `/etc/ssh/sshd_config.d/10-bastion.conf`). The Mac uses a dedicated Ed25519 key protected by a passphrase. The host key fingerprint was checked against the `mgmt-01` console before the first connection.
- The web GUI is now reached through the bastion, the path R03 describes: `ssh -N -L 8443:10.20.10.1:443 mgmt-01` from the Mac, then `https://127.0.0.1:8443`.
- Verified the administrative path on 2026-09-30:
  - The Mac logs in to `mgmt-01` with its key, and the firewall log shows R02 passing the connection from `192.168.0.129`.
  - A connection from another address (the Windows host itself, `192.168.0.41`) is blocked by the default deny rule and logged.
  - Password logins are refused with `Permission denied (publickey)`.
  - The OPNsense web GUI opens through the SSH tunnel.
- Reserved the addresses R02 depends on in the home router's DHCP (*Configuración › LAN › DHCP estático*): the Mac (`3e:c2:48:9d:b0:84`, macOS private Wi-Fi address set to *Fixed*) gets `192.168.0.129`, and the Windows host (`DESKTOP-GO7E8EO`, `04:42:1a:ed:ea:c6`) gets `192.168.0.41`. Verified on 2026-10-01:
  - Both entries are still there after reloading the page.
  - After applying them, `ssh mgmt-01 hostname` from the Mac still works. That needs both addresses: R02 accepts only `.129`, and the SSH configuration connects to `.41`.
- Recorded the home network for R01: the home LAN is `192.168.0.0/24` (router `.1`, dynamic pool `.10`–`.250`, 24-hour leases) and the guest network is `192.168.5.0/24` (router `192.168.5.1`). The [network plan](network-plan.html) (rev C) adds the guest network to HOME_NETS and the reservations and sleep setting to the host notes. Both reservations are inside the dynamic pool. The router accepted them, but no Vodafone documentation confirms that it keeps reserved addresses out of dynamic assignment.
- Configured NTP on `fw-01` ([decision 0005](decisions/0005-time.md)): the four default pool names stay, and Cloudflare's `162.159.200.1` and `162.159.200.123` are added by IP address with *Iburst*, so the clock can be corrected without DNS. Verified on 2026-10-01:
  - Before the change, `fw-01` already reached public NTP servers, and the home router does not intercept NTP: each server reported its own reference and stratum.
  - About 20 seconds after the service restarted, `162.159.200.123` was the system peer and `162.159.200.1` a candidate. Every offset was below 8 ms.
- Pointed `mgmt-01` to `fw-01` for time and set its time zone to UTC. `/etc/systemd/timesyncd.conf.d/10-fw-01.conf` sets `NTP=10.20.10.1` and an empty `FallbackNTP=`. Before the change, `mgmt-01` took its time directly from `2.debian.pool.ntp.org`, bypassing `fw-01`'s NTP service. Verified on 2026-10-01, after a host restart: `timedatectl timesync-status` shows server `10.20.10.1`, stratum 3, an offset of +0.669 ms, and the time zone is `Etc/UTC`.
- Disabled sleep on the Windows host while it is plugged in (`powercfg /change standby-timeout-ac 0`; it was 15 minutes). Hibernation was already off. On battery the host still sleeps after 10 minutes.
- Built the P0 firewall rules for MGMT on `fw-01`, as in the [network plan](network-plan.html) (rev D). The aliases are `LAB_NETS`, `HOME_NETS`, `RFC1918`, `BASTION`, `WEB_PORTS`, `ADMIN_PORTS` and `PUBLIC_DNS`. Each flow was tested from `mgmt-01` before and after the change on 2026-10-01, and the firewall log shows the rule that decided:
  - R01 (floating): `mgmt-01` reached the home router's web interface (`192.168.0.1:80`) before the rule and not after. The log shows `R01 lab to home: block`.
  - R05: DNS to `fw-01` works over UDP and TCP, and `timesyncd` gets answers from `10.20.10.1` with R15 in place.
  - R13: TCP 80 and 443 to the Internet still pass (`deb.debian.org`).
  - R13a ([decision 0006](decisions/0006-doh-blocking.md)): `1.1.1.1:443` was open before the rule and is closed after, and `8.8.8.8:443` is closed too. The log shows `R13a MGMT to public DNS resolvers: block`.
  - R15: SSH to GitHub, DNS over TLS to `1.1.1.1:853` and plain DNS to `8.8.8.8:53` were open before and are blocked and logged after. The last two are now caught by R13a, which comes first.
  - R03: with the automatic anti-lockout rule disabled (*Firewall ‣ Settings ‣ Advanced*), the web GUI still opens through the bastion, and the log shows `R03 bastion to fw-01 GUI` for every new connection.
  - R04 is in place, but its targets arrive in P1, so it will be tested then.
  - The factory rules *Default allow LAN to any rule* (IPv4 and IPv6) were disabled when the explicit rules took over, and deleted after the restart test.
- Restarted `fw-01` on purpose on 2026-10-01, with the new rules in place:
  - A few minutes after boot, `ntpq -pn` showed `162.159.200.123`, configured by IP address, as the system peer. This time the pool servers also appeared within about a minute.
  - The tests from `mgmt-01` gave the same results as before the restart, and new GUI connections were still logged by R03, so the anti-lockout setting survived too.
- Tested recovery on 2026-10-01:
  - Exported `fw-01`'s configuration from *System ‣ Configuration ‣ Backups*, encrypted. The file header shows AES-256-CBC, PBKDF2 with 100000 iterations and SHA-512. The file is kept on the Mac, outside this repository, and its password is in the password manager.
  - Took `fw-01` back to the snapshot *antes de reglas MGMT 2026-10-01* with *Go To* in the Snapshot Manager. Every connection in the test battery was open again, as before the rules.
  - Restored the encrypted backup, all areas, with a reboot. The battery gave the same results as before going back, and the GUI opened through the bastion, with the log showing `R03 bastion to fw-01 GUI` at 14:09 UTC. The restore brought back the rules, the aliases and the disabled anti-lockout rule.
  - `fw-01` now runs on top of that snapshot with the restored configuration. *Revert to Snapshot* goes to the parent of the current state, not to the most recent snapshot ([VMware](https://techdocs.broadcom.com/us/en/vmware-cis/desktop-hypervisors/workstation-pro/17-0/using-vmware-workstation-pro/using-virtual-machines-in-workstation-pro-user-guide/taking-snapshots-of-virtual-machines/revert-to-a-snapshot.html)), so a new snapshot, *reglas MGMT restauradas 2026-10-01*, was taken of the restored state. The Snapshot Manager shows it as the parent of the current state.
- Wrote the [runbook](runbook.md): start and stop order, administrative access, recovering access from the console, backup, restore, what the backup leaves out, snapshots and the verification battery.
- Set `ServerAliveInterval 30` and `ExitOnForwardFailure yes` for `mgmt-01` in the Mac's `~/.ssh/config`. `ssh -G mgmt-01` shows both, with `ServerAliveCountMax` at its default of 3. A tunnel whose connection dies now exits after about 90 seconds, and a tunnel that cannot open its local port exits instead of running without it ([ssh_config(5)](https://man.openbsd.org/ssh_config)).
- Tested the host's filtering of port `2222` from a third device on 2026-10-01, and fixed it ([decision 0007](decisions/0007-host-firewall.md)):
  - An iPhone on the home network (`192.168.0.126`) opened `http://192.168.0.41:2222` in Safari. The connection reached `fw-01`, which blocked it with the default deny rule at 14:33 UTC, so the host had let it through.
  - The host's firewall is Bitdefender Total Security, which manages Windows Defender Firewall's settings. Its automatic rule for `vmnat.exe`, VMware's NAT service, allowed everything. The Windows rule for R02 was not applied.
  - The `vmnat.exe` rule was set to outbound only, and an inbound rule was added that allows TCP `2222` from the Mac. The iPhone still reached `fw-01` (15:06–15:08 UTC). After a third rule that denies inbound TCP `2222` from any address, the iPhone's attempts no longer reached `fw-01` (checked from 15:22 to 15:31 UTC), and the Mac still connected.
  - After the change, the verification battery gave the same results, `mgmt-01` resolved `deb.debian.org`, and `fw-01`'s NTP servers kept answering (reach 377), so the VMs' traffic through `vmnat.exe` still works.
  - The [network plan](network-plan.html) (rev E) now says to restrict port `2222` in the firewall that actually filters.

### Problems found

- The home router intercepts all DNS on port 53, over UDP and TCP, and answers itself. Unbound could not prime the root, and it also wasted its per-query send limit on IPv6 targets without an IPv6 route. Diagnosis and fix: [decision 0004](decisions/0004-upstream-dns.md).
- The first update attempt could not download the repository catalogue. A direct download of the same file worked and a retry succeeded; the cause was not identified.
- The web GUI is only reachable from the bastion (R03), but the path to the bastion (R02) is itself configured in the web GUI. To make the DNS changes, the packet filter was disabled for a few minutes (`pfctl -d`), the GUI was reached from the host at `10.20.254.10`, and the filter was re-enabled (`pfctl -e`). This was a temporary exception to R03. It was used once more on 2026-09-30 to build R02 and is no longer needed, because the GUI is now reached through the bastion.
- After the adapter change, OPNsense could not find `em0` and `em1` at boot. Nobody pressed a key during the console countdown, so it assigned the interfaces automatically, LAN to the first adapter and WAN to the second, which put them the wrong way round. Assigning the WAN from the console also resets it to DHCP and DHCPv6, so its static address was lost ([`console.inc`](https://github.com/opnsense/core/blob/master/src/etc/inc/console.inc)). Fixed from the console with *Assign interfaces* and *Set interface IP address*. If the adapters change again, watch the console on the first boot, assign the interfaces by hand and then set the WAN address again.
- The network plan assumed that R02 traffic would reach the WAN from the VMware NAT network (`10.20.254.0/24`). The firewall log showed that VMware's NAT keeps the client's original address when it forwards a port: the first attempt arrived from the Mac (`192.168.0.129`) and was blocked by the default deny rule. R02 now matches the Mac's address, so `fw-01` also enforces "only from the Mac". The [network plan](network-plan.html) was corrected (rev B).
- After `fw-01` booted at 09:07 UTC on 2026-10-01, its NTP service had no time sources until about 09:11, when the pool servers appeared. Not confirmed: the pool names could not be resolved yet. The servers added by IP address do not need DNS.
- The Windows host went to sleep twice with the VMs running, from 11:35 to 11:39 and from 11:54 to 11:58 CEST on 2026-10-01 (Kernel-Power 42 and Power-Troubleshooter 1 in the System log). The VMs stopped during each sleep. After the first one, `mgmt-01`'s clock was 233 s behind, and `fw-01` advertised a root distance above 5 s, so its own clock was off too: ntpd adds its own offset to the root dispersion it advertises, and waits 300 s before stepping the clock. `mgmt-01` refused `fw-01`'s time (`Server has too large root distance`, limit 5 s) from 09:44 UTC until it accepted it at 09:52 UTC (the journal shows the first refusal at 09:40, because `mgmt-01`'s clock was still behind). Fixed by disabling sleep on AC power ([decision 0005](decisions/0005-time.md)).
- The host restart at 12:11 CEST on 2026-10-01 was logged as unclean (Kernel-Power 41), and the VMs were cut off without an orderly shutdown: `mgmt-01`'s journal has no shutdown entries. Before restarting the host, shut down `mgmt-01` and then `fw-01`. At start-up, start `fw-01` first, because `mgmt-01` depends on it for DNS, time and Internet access.
- `sudo` is not installed on `mgmt-01`, because a root password was set during installation. Administrative commands used `su -l -c`.
- In OPNsense 26.7 the factory LAN rules (*Default allow LAN to any rule*, IPv4 and IPv6) are new-style rules with sequence numbers 1 and 11, and every new rule is appended at the end, with the highest sequence number plus 100 ([`config.xml.sample`](https://github.com/opnsense/core/blob/26.7.4/src/etc/config.xml.sample), [`FilterSequenceField.php`](https://github.com/opnsense/core/blob/26.7.4/src/opnsense/mvc/app/models/OPNsense/Firewall/FieldTypes/FilterSequenceField.php)). New LAN rules therefore sat below *Default allow* and did nothing. All the explicit rules were created first, and *Default allow* was then disabled in one change, with re-enabling it as the way back.
- Saving a rule does not load it. The first R01 test still passed until *Apply* was pressed on the rules page.
- After the `fw-01` restart, the open SSH sessions and the GUI tunnel stopped working, because the firewall forgets its connection states when it restarts. A late packet from the old tunnel session (`10.20.10.10:22` → `192.168.0.129:51130`) looked like a new connection from the lab to the home network, and R01 blocked it. Reopen SSH sessions and the tunnel after restarting `fw-01`.
- At the start of the recovery test, a new tunnel could not open port 8443 on the Mac (`Address already in use`). `lsof` showed an earlier `ssh` process still holding it. `pkill` and `kill` did not free the port, and `kill -9` did. It happened again later that afternoon: the tunnel answered `curl` with `HTTP 000`, `kill` did not stop it, and `ps` showed it in state `T` (stopped). It was a job suspended with Ctrl+Z in the Terminal. A stopped process receives no signal except SIGKILL until it continues ([POSIX](https://pubs.opengroup.org/onlinepubs/9799919799/functions/V2_chap02.html), section 2.4.3), and it forwards nothing while its port stays open. The first case was not checked, but it behaved the same way. Open the tunnel in its own Terminal tab and close it with Ctrl+C.
- The Windows Defender Firewall rule for R02 never took effect. Bitdefender manages the host's firewall, and its automatic rule for `vmnat.exe` let any device reach port `2222`. Until the third-device test, only `fw-01` (R02) enforced "only from the Mac". The test of 2026-09-30, from the host itself, could not show it. Bitdefender also lets through inbound connections that match none of an application's rules, so restricting an application needs an explicit deny rule ([decision 0007](decisions/0007-host-firewall.md)).
- Going back to the snapshot also rolled back `fw-01`'s logs: the firewall log entries from the rule tests earlier that day are no longer on the running firewall. They remain in the screenshots taken during the tests and in the snapshot *despues de reglas MGMT 2026-10-01*.

### Remaining before the P0 exit gate

- Decide whether to install `sudo` on `mgmt-01`, so every administrative command is logged with the user who ran it.
- Inventory and templates in `infra/`, and the P0 write-up.

### Carried to P1

- Test R04 once its targets exist.
- Repeat R05, R13, R13a and R15 for every new zone.
- Add name-based DoH blocking in Unbound, including Firefox's canary domain, before the USERS zone gets browsers ([decision 0006](decisions/0006-doh-blocking.md)).
- Send `fw-01`'s firewall log to Wazuh (R07), so the evidence survives going back to a snapshot.

No credentials are included in this log.
