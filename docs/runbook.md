# Runbook · P0

Updated: 2026-10-01

How to run, access, back up and recover the lab as it stands in P0. Steps marked as not tested have not been run yet; the results of the others are in [progress](progress.md). No credentials are included here.

## Machines

| Machine | Role | Address | Access |
|---|---|---|---|
| Windows 11 host (`DESKTOP-GO7E8EO`) | Runs VMware Workstation; Bitdefender is its firewall | `192.168.0.41`, reserved in the home router | Local console |
| Mac | Administration workstation | `192.168.0.129`, reserved in the home router | — |
| `fw-01` | OPNsense 26.7 firewall | WAN `10.20.254.10`, LAN `10.20.10.1` | VMware console; web GUI through the bastion |
| `mgmt-01` | Debian 13 bastion | `10.20.10.10` | `ssh mgmt-01` from the Mac |

## Start and stop

- **Start** `fw-01` first and wait for its console menu, then start `mgmt-01`, which depends on `fw-01` for DNS, time and Internet access.
- **Stop** `mgmt-01` first, then `fw-01` (console option 5), then the host. On 2026-10-01 a host restart with the VMs running cut them off without an orderly shutdown.
- The host must not sleep while plugged in (`powercfg /change standby-timeout-ac 0`). If it sleeps, the VMs stop and their clocks fall behind ([decision 0005](decisions/0005-time.md)).

## Administrative access

- **SSH to the bastion:** `ssh mgmt-01`. The path is Mac → `192.168.0.41:2222` → VMware NAT → `fw-01` Destination NAT → `mgmt-01:22` (R02). Only keys are accepted.
- **Web GUI:** `ssh -N -L 8443:10.20.10.1:443 mgmt-01`, then `https://127.0.0.1:8443`. The anti-lockout rule is disabled, so the GUI only opens from `mgmt-01` (R03). Open the tunnel in its own Terminal tab and close it with Ctrl+C. Ctrl+Z only suspends it: the port stays busy and nothing is forwarded.
- **After restarting `fw-01`,** reopen SSH sessions and the tunnel: the firewall forgets its connection states.
- **SSH client settings:** the Mac's `~/.ssh/config` sets `ServerAliveInterval 30` and `ExitOnForwardFailure yes` for `mgmt-01`. A tunnel whose connection dies exits after about 90 seconds, and a tunnel that cannot open its port exits instead of running without it ([ssh_config(5)](https://man.openbsd.org/ssh_config)).
- **If port 8443 is busy, or the GUI does not load:** `lsof -nP -iTCP:8443 -sTCP:LISTEN` shows the tunnel process, and `curl -sk -m 5 -o /dev/null -w 'HTTP %{http_code}\n' https://127.0.0.1:8443` gives `HTTP 000` if it forwards nothing. Run `kill <PID>`. If the port is still busy, `ps -o pid,stat,command -p <PID>` shows `T` for a suspended process: run `kill -9 <PID>`.
- **Root on `mgmt-01`:** `sudo` is not installed, so use `ssh -t mgmt-01 "su -l -c '<command>'"`.

## Host firewall

Bitdefender filters the host's traffic, so Windows Defender Firewall rules are not applied while it does ([decision 0007](decisions/0007-host-firewall.md)). In Bitdefender's *Firewall ‣ Rules*, `C:\Windows\System32\vmnat.exe` has three rules, all for *Any Network*:

| Direction | Protocol | Local port | Remote address | Permission |
|---|---|---|---|---|
| Outbound | Any | Any | Any | Allow |
| Inbound | TCP | `2222` | `192.168.0.129` | Allow |
| Inbound | TCP | `2222` | Any | Deny |

Run the third-device check in the verification battery after updating VMware Workstation or Bitdefender. A new port forward needs the same pair of inbound rules.

## Lost access to the web GUI

1. Open the `fw-01` console in VMware and choose option 8 (Shell).
2. Run `pfctl -d`. This disables the whole packet filter, including NAT, so the R02 port forward and the tunnel stop working too.
3. From a browser on the Windows host, open `https://10.20.254.10`. The host reaches the WAN address directly through its VMnet8 adapter.
4. Fix the configuration. Any change that reloads the filter turns it back on (`filter_configure_sync()` in [`filter.inc`](https://github.com/opnsense/core/blob/26.7.4/src/etc/inc/filter.inc)), and the GUI stops answering on the WAN address. If more changes are needed, run `pfctl -d` again.
5. When finished, run `pfctl -e`. If the filter is already on, it says so. Then check that `ssh mgmt-01` and the tunnel work again: they need the NAT that `pfctl -d` turned off.

The console also offers option 13, *Restore a backup*, from the local configuration history. Not tested.

## Configuration backup

- **When:** after every block of configuration changes, and before risky ones.
- **How:** *System ‣ Configuration ‣ Backups*, section *Download*. Keep *Do not backup RRD data* ticked, tick *Encrypt this configuration file*, and use the password from KeePassXC (group `soc-homelab`, entry *soc-homelab fw-01 copia de configuración*).
- **Where:** `~/Documents/soc-homelab-backups/` on the Mac. Never in this repository, because the file holds secrets.
- **Check:** `head -5` on the file must show `---- BEGIN config.xml ----`, `Cipher: AES-256-CBC`, `PBKDF2: 100000` and `Hash: SHA512`. A file that starts with `<?xml` is not encrypted: delete it and download it again.

## Restore

Tested on 2026-10-01 by taking `fw-01` back to a snapshot from before the MGMT rules and restoring the encrypted backup onto the same installation. A restore onto a new installation has not been tested.

1. Open *System ‣ Configuration ‣ Backups*, section *Restore*.
2. Leave *Restore areas* empty (all areas) and choose the file.
3. Tick *Reboot after a successful restore* and *Configuration file is encrypted*, then enter the password.
4. Click *Restore configuration*.
5. After the reboot, reopen the tunnel and run the verification battery below.

## Not in the backup

The backup holds `fw-01`'s `config.xml` only.

- `/usr/local/etc/unbound.opnsense.d/no-ipv6.conf` ([decision 0004](decisions/0004-upstream-dns.md)). After a reinstall, recreate it from the `fw-01` shell:

  ```sh
  printf 'server:\n  do-ip6: no\n' > /usr/local/etc/unbound.opnsense.d/no-ipv6.conf
  configctl unbound restart
  ```

- Everything outside `fw-01`, recreated by hand from [progress](progress.md):
  - the three Bitdefender rules for `vmnat.exe` (see *Host firewall*), and the unused Windows Defender Firewall rule *soc-homelab R02 SSH 2222 from Mac*;
  - the VMware NAT port forward from `2222` to `10.20.254.10:2222`;
  - the DHCP reservations in the home router;
  - the host's power settings;
  - on `mgmt-01`, `/etc/ssh/sshd_config.d/10-bastion.conf` and `/etc/systemd/timesyncd.conf.d/10-fw-01.conf`;
  - the Mac's `~/.ssh/config`.

## Snapshots

- *Revert to Snapshot* goes to the parent snapshot, the one the current state is based on, which is not always the most recent. To go to any other snapshot, use the *Snapshot Manager* and *Go To* ([VMware](https://techdocs.broadcom.com/us/en/vmware-cis/desktop-hypervisors/workstation-pro/17-0/using-vmware-workstation-pro/using-virtual-machines-in-workstation-pro-user-guide/taking-snapshots-of-virtual-machines/revert-to-a-snapshot.html)).
- After going back to a snapshot and fixing the state, take a new snapshot, so that *Revert to Snapshot* does not return to the old state.
- Going back to a snapshot also rolls back the VM's logs. Keep evidence outside the VM until P1 sends `fw-01`'s firewall log to Wazuh (R07).
- Snapshots are not backups: they are stored with the VM's files on the host.

## Verification battery

From the Mac:

```sh
ssh mgmt-01 'for t in "deb.debian.org 443" "github.com 22" "1.1.1.1 853" "8.8.8.8 53" "1.1.1.1 443" "192.168.0.1 80"; do set -- $t; timeout 3 bash -c "</dev/tcp/$1/$2" 2>/dev/null && r=OPEN || r=CLOSED; echo "$1:$2 $r"; done; getent hosts deb.debian.org | head -1'
```

| Line | Expected | Rule |
|---|---|---|
| `deb.debian.org:443` | OPEN | R13 |
| `github.com:22` | CLOSED | R15 |
| `1.1.1.1:853`, `8.8.8.8:53`, `1.1.1.1:443` | CLOSED | R13a |
| `192.168.0.1:80` | CLOSED | R01 |
| `getent` | An address | R05 |

Time: `ssh mgmt-01 timedatectl timesync-status` must show server `10.20.10.1` and a packet count above 0. On the `fw-01` console, `ntpq -pn` must show a line starting with `*`.

Third device: from a phone on the home Wi-Fi, open `http://192.168.0.41:2222` and let it try for a minute. In *Firewall ‣ Log Files ‣ Live View*, filter `src` · `contains` · the phone's address: no new line may appear. Then remove the filter and check that the newest line has the current time. A line from the phone means the host let it through, and only R02 stopped it.
