# 0001 · Hypervisor

- **Status:** Accepted
- **Date:** 2026-09-24
- **Phase:** Before P0

## Context

The whole lab runs on one desktop: Windows 11, AMD Ryzen with 16 cores, 32 GB of RAM and a 2 TB SSD. The P0–P2 inventory needs about 21 GB of RAM for the machines that are always on, plus one on-demand machine of 4 GB at a time. RAM is the constraint, not CPU or disk.

The firewall needs one interface per zone: WAN plus six zones in P0–P2, and two more reserved for AI and OT.

## Options considered

| Option | For | Against |
|---|---|---|
| VirtualBox | Free and familiar | Falls back to a slower mode when Hyper-V or Memory Integrity is active on Windows 11 |
| **VMware Workstation Pro 26H1** | Free for all use since May 2026; stronger virtual networking (Virtual Network Editor, LAN segments, NAT port forwarding); up to 10 NICs per VM | Needs a Broadcom portal account; also slows down if Hyper-V is active |
| Proxmox VE on bare metal | Frees the 6–8 GB that Windows uses; real 802.1Q VLANs; API for infrastructure as code | The desktop stops being a normal Windows machine |

## Decision

VMware Workstation Pro 26H1 on Windows 11.

## Consequences

- Windows keeps 6–8 GB of RAM, so the budget is tight: only one on-demand machine can run at a time (see the RAM budget in the [network plan](../network-plan.html)).
- Before building, check that Hyper-V and Memory Integrity are not forcing VMware into its slower mode.
- Zones are VMware LAN segments; lab egress uses `VMnet8` (NAT).
- The Windows 11 guest needs a virtual TPM, which Workstation only provides on an encrypted VM.
- Proxmox stays an option if the desktop is ever dedicated to the lab.
