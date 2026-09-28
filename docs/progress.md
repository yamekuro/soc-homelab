# Lab Progress

Updated: 2026-09-28

## P0 — Reproducible base: in progress

### Completed

- Installed VMware Workstation Pro on the Windows 11 lab host.
- Configured VMnet8 NAT as `10.20.254.0/24`, with gateway `10.20.254.2`.
- Created `fw-01` and installed OPNsense 26.7.
- Configured `fw-01` with 1 virtual processor, 2 cores, 4 GiB RAM, and a 40 GiB thin-provisioned disk. UEFI is enabled and Secure Boot is disabled.
- Created the `LS-MGMT` LAN segment and connected the firewall's second network adapter.
- Assigned WAN to `em0`: static IPv4 `10.20.254.10/24`, gateway and DNS `10.20.254.2`.
- Assigned LAN to `em1`: static IPv4 `10.20.10.1/24`. The LAN DHCP server is disabled.
- Verified connectivity from OPNsense to the NAT gateway, to `1.1.1.1`, and confirmed DNS resolution for `opnsense.org`.

### Remaining before the P0 exit gate

- Review the virtual NIC model. OPNsense currently detects `em0`/`em1`; the network plan specifies VMware VMXNET3 (`vmx0`/`vmx1`). Recheck interface assignments and repeat connectivity tests if the model changes.
- Deploy `mgmt-01` on `LS-MGMT` with static IPv4 `10.20.10.10`.
- Complete and verify the firewall access matrix, network isolation, DNS/NTP, and recovery procedure.

No credentials are included in this log.
