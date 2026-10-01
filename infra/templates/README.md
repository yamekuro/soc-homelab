# templates/

How to build each machine again: its VM settings, and the configuration files created by hand, at the same path they have on the machine. None holds a secret.

## Machines

| Setting | `fw-01` | `mgmt-01` |
|---|---|---|
| System | OPNsense 26.7 (FreeBSD 15.1) | Debian 13, no desktop |
| Processors | 1 processor, 2 cores | 2 vCPU |
| Memory | 4 GB | 2 GB |
| Disk | 40 GB, thin provisioned | 40 GB |
| Firmware | UEFI, Secure Boot off | Not recorded |
| Network | Adapter 1: VMXNET3 on VMnet8 (WAN, `vmx0`). Adapter 2: VMXNET3 on `LS-MGMT` (LAN, `vmx1`) | E1000 on `LS-MGMT` (`ens33`) |
| Addresses | WAN `10.20.254.10/24`, gateway `10.20.254.2`; LAN `10.20.10.1/24` | `10.20.10.10/24`, gateway and DNS `10.20.10.1` |

The sizes are the ones built in P0. [inventory.md](../inventory.md) compares them with the network plan's RAM budget. Restoring the configuration backup onto a new installation of `fw-01` has not been tested yet ([restore log](../restore-log.md)).

## Files

Each file was compared with the one on the machine on 2026-10-01.

| File | Machine | Purpose |
|---|---|---|
| [`10-bastion.conf`](mgmt-01/etc/ssh/sshd_config.d/10-bastion.conf) | `mgmt-01` | SSH with keys only, and no root login |
| [`10-fw-01.conf`](mgmt-01/etc/systemd/timesyncd.conf.d/10-fw-01.conf) | `mgmt-01` | Time only from `fw-01` ([decision 0005](../../docs/decisions/0005-time.md)) |
| [`no-ipv6.conf`](fw-01/usr/local/etc/unbound.opnsense.d/no-ipv6.conf) | `fw-01` | Unbound without IPv6 transport ([decision 0004](../../docs/decisions/0004-upstream-dns.md)). It is not in the configuration backup |
| [`ssh_config-mgmt-01`](mac/ssh_config-mgmt-01) | Mac | The `Host mgmt-01` block for `~/.ssh/config`, from the effective settings that `ssh -G mgmt-01` shows |

The configuration of `fw-01` itself comes from its encrypted backup, which is never stored in this repository.
