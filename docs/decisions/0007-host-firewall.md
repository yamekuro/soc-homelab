# 0007 · Host firewall for the administrative path

- **Status:** Accepted
- **Date:** 2026-10-01
- **Phase:** P0

## Context

R02 brings SSH from the Mac to the bastion through port `2222` on the Windows host, VMware's NAT service (`vmnat.exe`) and `fw-01`. The [network plan](../network-plan.html) asks for two filters on the way: the host's firewall accepts port `2222` only from the Mac, and `fw-01` passes only the Mac's address. A Windows Defender Firewall rule was created for the first one on 2026-09-30.

On 2026-10-01 another device on the home network, an iPhone at `192.168.0.126`, connected to `192.168.0.41:2222`. The connection reached `fw-01`, which blocked it with the default deny rule. The host had let it through:

- The host's firewall is Bitdefender Total Security. *Windows Defender Firewall with Advanced Security* shows "These settings are being managed by vendor application Bitdefender Firewall". A third-party firewall can take ownership of rule categories from Windows Firewall, and the Windows rule had no effect.
- Bitdefender had created a rule for `vmnat.exe` that allowed any protocol, in both directions, on any network, port and address.

`vmnat.exe` also carries all the outbound traffic of the VMs: `fw-01`'s DNS over TLS, NTP and updates, and everything the zones send to the Internet.

## Options considered

| Option | For | Against |
|---|---|---|
| **Restrict `vmnat.exe` in Bitdefender** | Keeps the host's existing protection; closes the gap at the first filter; easy to revert | The rules are not in any backup and are recreated by hand; an update could add a new automatic rule |
| Turn off Bitdefender's firewall, so Windows Defender Firewall applies the existing rule | The rule already exists and can be scripted with PowerShell | Changes the protection of the whole computer, not only the lab |
| Leave it and rely on `fw-01` | No change | One filter instead of two; any device on the home network reaches `fw-01`'s WAN |

## Decision

Three Bitdefender rules for `C:\Windows\System32\vmnat.exe`, all for any network type:

| Direction | Protocol | Local port | Remote address | Permission |
|---|---|---|---|---|
| Outbound | Any | Any | Any | Allow |
| Inbound | TCP | `2222` | `192.168.0.129` | Allow |
| Inbound | TCP | `2222` | Any | Deny |

The deny rule is needed. With only the first two rules, the iPhone still reached `fw-01`, so Bitdefender lets through inbound connections that match none of an application's rules. The Mac's allow rule takes precedence over the broader deny rule.

The Windows Defender Firewall rule *soc-homelab R02 SSH 2222 from Mac* stays in place, unused, in case Bitdefender's firewall is ever turned off.

Sources: [Microsoft](https://learn.microsoft.com/en-us/windows/win32/api/netfw/nf-netfw-inetfwproduct-put_rulecategories) on third-party firewalls taking ownership of rule categories, and Bitdefender on [network types](https://www.bitdefender.com/consumer/support/answer/2082/) and [rule fields](https://www.bitdefender.com/consumer/support/answer/13425/).

## Consequences

- Verified on 2026-10-01: the iPhone's attempts no longer reach `fw-01`, and the Mac still connects. The verification battery gives the same results, `mgmt-01` resolves names, and `fw-01`'s NTP servers answer (reach 377).
- The rules live only in Bitdefender, not in `fw-01`'s backup. The [runbook](../runbook.md) lists them.
- Repeat the third-device test after updating VMware Workstation or Bitdefender. A new port forward needs the same pair of inbound rules.
- Only `vmnat.exe` was tested. How Bitdefender treats other applications on the host was not checked.
- To revert, delete the two inbound rules and set the outbound rule back to *Both*.
