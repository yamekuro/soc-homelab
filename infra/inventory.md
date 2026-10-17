# Inventory · P0

Baseline checked on the machines on 2026-10-01. Dated follow-ups below record the later bastion trial and package maintenance without re-dating the other baseline versions. No secrets are included: the identities table only says where each secret is kept.

## Machines

| Machine | Role | System | Hardware | Network |
|---|---|---|---|---|
| `DESKTOP-GO7E8EO` | Hypervisor host | Windows 11 Pro 26H2, build 26300.9550 | AMD Ryzen 9 5950X (16 cores), 32 GB RAM, 2 TB SSD | Ethernet, `192.168.0.41`, reserved in the home router |
| Mac | Administration workstation | macOS 27.0.1 | — | Wi-Fi, `192.168.0.129`, reserved in the home router |
| `fw-01` | Firewall | OPNsense 26.7.4_1 on FreeBSD 15.1-RELEASE-p3 | 2 vCPU, 4 GB RAM, 40 GB disk | `vmx0` (WAN) on VMnet8, `10.20.254.10/24`; `vmx1` (LAN) on `LS-MGMT`, `10.20.10.1/24` |
| `mgmt-01` | Bastion | Debian 13.7 | 2 vCPU, 2 GB RAM, 40 GB disk | `ens33` on `LS-MGMT`, `10.20.10.10/24` |

The VM settings are in [templates/](templates/README.md#machines). The VM files are in `%USERPROFILE%\Documents\Virtual Machines\<name>\` on the host.

The [network plan](../docs/network-plan.html) budgets 2 vCPU and 2 GB for `fw-01`, and 1 vCPU and 1 GB for `mgmt-01`. With the sizes above, the machines that are always on in P2 need 24 GB instead of 21, and the total comes to 34–36 GB of 32. This has to be resolved before P1.

### Bastion follow-up, 2026-10-16

The table above preserves the original 2 GB bastion allocation. The user subsequently tested the requested 1024 MB allocation, with 929 MiB visible to Debian. SSH, sudo, DNS, time, all six runbook TCP probes, browser access to the firewall login and a package-index update gave the expected recorded results. After the package maintenance below, the user reports 626 MiB available and zero swap used.

The [recheck record](p0-recheck-2026-10-15.md#follow-up-initial-1024-mb-bastion-trial) gives evidence sources and limits. The VMware allocation setting is not directly pictured in the supplied memory screenshot. The overall [capacity decision](../docs/decisions/0009-capacity.md) remains Proposed; the later agent and full-phase workloads retain their own verification. Other CPU, disk and system values above remain the 2026-10-01 baseline.

## Software versions

| Component | Machine | Version | Checked with |
|---|---|---|---|
| VMware Workstation Pro | Host | 26H1u1 (`26.0.1.25688693`) | *Help ‣ About VMware Workstation* |
| Bitdefender Total Security | Host | Updates itself | Its firewall rules are in the [runbook](../docs/runbook.md#host-firewall) |
| OPNsense | `fw-01` | `26.7.4_1` (amd64) | `opnsense-version` |
| FreeBSD | `fw-01` | `15.1-RELEASE-p3`, kernel and userland | `freebsd-version -ku` |
| Unbound | `fw-01` | `1.26.1` | `unbound -V` |
| Debian | `mgmt-01` | `13.7` | `/etc/debian_version` |
| Linux kernel | `mgmt-01` | `6.12.111+deb13-amd64` | `uname -r` |
| OpenSSH server | `mgmt-01` | `1:10.0p1-7+deb13u4` | `dpkg-query -W` |
| sudo | `mgmt-01` | `1.9.16p2-3+deb13u2` | `dpkg-query -W` |
| systemd-timesyncd | `mgmt-01` | `257.13-1~deb13u1` | `dpkg-query -W` |
| OpenSSH client | Mac | `10.3p1`, LibreSSL 3.3.6 | `ssh -V` |

### Package maintenance verified on 2026-10-16

The user supplied the targeted apt-get upgrade transcript and an installed-version readback with `dpkg-query -W liblzma5 libpng16-16t64`. Both packages are amd64.

| Package on mgmt-01 | Previous version | Installed version verified |
|---|---|---|
| liblzma5 | 5.8.1-1+deb13u1 | 5.8.1-1+deb13u2 |
| libpng16-16t64 | 1.6.48-1+deb13u5 | 1.6.48-1+deb13u6 |

The operation reports two upgrades, zero new packages and zero removals. Full evidence and the post-upgrade memory reading are in the [recheck record](p0-recheck-2026-10-15.md#gui-package-index-update-and-subsequent-memory). The libc-bin trigger is not recorded as an upgrade of that package. Other software versions in the baseline table were not rechecked by this follow-up.

## Identities

| Identity | Machine | Used for | Secret kept in |
|---|---|---|---|
| `root` | `fw-01` | Console and web GUI | KeePassXC |
| `root` | `mgmt-01` | Emergencies at the console ([decision 0008](../docs/decisions/0008-sudo.md)) | KeePassXC |
| `yamekuro` | `mgmt-01` | SSH, with a key only; its password is the one `sudo` asks for | KeePassXC |
| SSH key `id_ed25519_soc-homelab` (Ed25519) | Mac | SSH to `mgmt-01` | The key file stays on the Mac; its passphrase is in KeePassXC |
| Backup encryption password | — | Encrypted `fw-01` configuration backups | KeePassXC, group `soc-homelab` |
| Router administrator | Home router | DHCP reservations for the host and the Mac | KeePassXC |
