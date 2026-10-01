# P0 · Foundation

*Phase P0, reproducible base · Exit gate verified on 2026-10-01*

One Windows 11 desktop runs the lab in VMware Workstation. An OPNsense firewall, `fw-01`, connects the MGMT zone to the Internet through VMware's NAT. A Debian bastion, `mgmt-01`, is the only way in: from a Mac, through one forwarded port. Everything else is denied and logged. P0 delivers that base, the rules that make it safe, and the means to recover it: encrypted backups with a tested restore, a runbook and an inventory.

## Decisions

| # | Decision | Why | Trade-off |
|---|---|---|---|
| [0001](../docs/decisions/0001-hypervisor.md) | VMware Workstation Pro on Windows 11 | LAN segments, NAT port forwarding and up to 10 adapters per VM; free | Windows keeps 6–8 GB of the 32 GB of RAM |
| [0002](../docs/decisions/0002-firewall.md) | OPNsense | Per-zone rules, NAT, API and export; no interface limits | Not one of the commercial products in job ads |
| [0003](../docs/decisions/0003-addressing.md) | `10.20.0.0/16`, one `/24` per zone | No overlap with the home networks; the third octet names the zone | — |
| [0004](../docs/decisions/0004-upstream-dns.md) | DNS over TLS to Quad9 and Cloudflare, with DNSSEC validated on `fw-01` | The home router intercepts and alters all DNS on port 53 | Trust moves to two operators; lookups depend on TCP 853 |
| [0005](../docs/decisions/0005-time.md) | `fw-01` serves NTP, with Cloudflare by IP address; UTC everywhere | One clock for every log, even before DNS works | `fw-01` is a single point of failure for time |
| [0006](../docs/decisions/0006-doh-blocking.md) | Block the resolvers' published addresses before the web rule | Stops the easy bypass of `fw-01`'s DNS | Less-known DoH services get through until P1 |
| [0007](../docs/decisions/0007-host-firewall.md) | Restrict VMware's NAT service in Bitdefender | The Windows firewall rule was never applied | The rules live outside any backup |
| [0008](../docs/decisions/0008-sudo.md) | `sudo` on the bastion; root password kept until P1 | Every administrative command is logged with its user | `su` still runs commands without recording them |

## What was built

- **Administrative path (R02):** Mac → host port `2222` → VMware NAT → `fw-01` Destination NAT → `mgmt-01:22`. Two filters accept only the Mac: Bitdefender on the host and R02 on `fw-01`. SSH accepts keys only.
- **Web GUI only from the bastion (R03):** the anti-lockout rule is disabled. The GUI is reached through an SSH tunnel.
- **MGMT rules:**
  - R01 blocks the lab from the home networks.
  - R05 allows DNS and NTP to `fw-01` only.
  - R13a blocks 24 public resolver addresses.
  - R13 allows web traffic out.
  - R15 denies and logs everything else.
- **DNS and time:** Unbound forwards over strict DNS over TLS with DNSSEC; `fw-01` serves NTP; every lab machine uses UTC.
- **Recovery:** encrypted configuration backups, a restore tested from a snapshot taken before the rules, a [runbook](../docs/runbook.md), an [inventory with versions and identities](../infra/inventory.md), [machine templates](../infra/templates/README.md) and a [restore log](../infra/restore-log.md).

## Problems found

The full list, with evidence, is in the [progress log](../docs/progress.md).

- **The home router answers all DNS itself.** Unbound could not prime the root, DNSSEC was silently lost and answers were altered. A probe with IP TTL 1 still got an answer, so the router itself was answering. Fixed with DNS over TLS ([0004](../docs/decisions/0004-upstream-dns.md)).
- **VMware's NAT keeps the client's address on a port forward.** R02 was designed for the NAT network, and the first attempt from the Mac was blocked. R02 now matches the Mac, so `fw-01` enforces "only the Mac" itself.
- **OPNsense 26.7 appends new rules after the factory "Default allow LAN" rules.** The explicit rules did nothing until the defaults were disabled, in one change with an easy way back. Saving a rule does not apply it.
- **The host went to sleep with the VMs running.** `mgmt-01`'s clock fell 233 s behind, and it refused `fw-01`'s time for eight minutes (root distance above 5 s). Sleep is now disabled on mains power.
- **The Windows firewall rule never took effect.** Bitdefender owns the host's firewall and allowed anything to reach VMware's NAT service. A test from a third device found it. Bitdefender also let through inbound connections that matched none of `vmnat.exe`'s rules, so the fix needed an explicit deny rule.
- **Going back to a snapshot rolls back the firewall's logs.** Evidence has to leave the VM. That is planned for P1, with Wazuh.
- **A suspended SSH tunnel looks alive.** After Ctrl+Z, the tunnel kept its port, forwarded nothing and ignored `kill`. `ps` showed state `T`.

## Verification

| Exit gate criterion | Evidence |
|---|---|
| Allowed and forbidden access tested | R01, R03, R05, R13, R13a and R15 were tested from `mgmt-01` before and after each change, with the deciding rule's label in the firewall log. Only the Mac reaches the bastion. `fw-01` blocked a connection from the host itself, and the host's firewall now stops one from another device on the home network before it reaches `fw-01`. Password logins are refused. |
| Configuration persists | After a deliberate restart of `fw-01`, the rules, the anti-lockout setting and NTP by IP address all came back. |
| Access can be recovered | The encrypted backup, restored onto a snapshot from before the rules, brought them back with the same test results ([restore log](../infra/restore-log.md)). The [runbook](../docs/runbook.md) covers regaining the GUI from the console. |
| Administrative sessions are identifiable | The firewall log shows R02 with the Mac's address. `sudo` logs every command on the bastion with its user. |
| No secrets published | On 2026-10-01 the repository and all its commits were searched for private keys, password hashes, written passwords, OPNsense configuration content and personal identifiers. None was found. |

## Open items

- **Planned for P1:**
  - Test R04 once its targets exist.
  - Repeat R05, R13, R13a and R15 for each new zone.
  - Send the firewall log to Wazuh (R07).
  - Add name-based DoH blocking.
  - Lock the root password on the bastion.
- **Before Wazuh arrives:** resolve the RAM budget. `fw-01` runs with 4 GB and `mgmt-01` with 2 GB, so P2 would need 34–36 GB of the host's 32.
- **Not tested yet:**
  - Restoring onto a new installation of `fw-01`.
  - The console's restore option.
  - Rebuilding `mgmt-01` from the templates.

## One line for the résumé

Built and verified the foundation of a segmented SOC lab on VMware and OPNsense: bastion-only administration, default-deny egress with DNS over TLS and DoH blocking, and encrypted backups with a tested restore, with every firewall rule proven by before-and-after tests and logs.
