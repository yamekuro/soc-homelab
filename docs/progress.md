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
- Deployed `mgmt-01` (Debian 13, no desktop) on `LS-MGMT`: static IPv4 `10.20.10.10/24`, gateway and DNS `10.20.10.1`.
- Updated OPNsense to 26.7.4_1. It ships Unbound 1.26.1, which fixes nine vulnerabilities, including CVE-2026-81642 (possible remote code execution when processing a DNSKEY).
- Moved Unbound to DNS over TLS upstreams with DNSSEC validation ([decision 0004](decisions/0004-upstream-dns.md)). Verified on 2026-09-28:
  - TLS on port 853 to `9.9.9.10` and `1.1.1.1`, with the certificates verified against `dns10.quad9.net` and `one.one.one.one`.
  - `drill -D isc.org @127.0.0.1` returns `NOERROR` with the `ad` flag, and `drill dnssec-failed.org @127.0.0.1` returns `SERVFAIL`.
  - A capture on the WAN during a fresh lookup showed only TLS to port 853, and a capture of port 53 during another lookup saw no packets.
  - `mgmt-01` resolves `deb.debian.org` and `apt update` succeeds.

### Problems found

- The home router intercepts all DNS on port 53, over UDP and TCP, and answers itself. Unbound could not prime the root, and it also wasted its per-query send limit on IPv6 targets without an IPv6 route. Diagnosis and fix: [decision 0004](decisions/0004-upstream-dns.md).
- The first update attempt could not download the repository catalogue. A direct download of the same file worked and a retry succeeded; the cause was not identified.
- The web GUI is only reachable from the bastion (R03), but the path to the bastion (R02) is itself configured in the web GUI. To make the DNS changes, the packet filter was disabled for a few minutes (`pfctl -d`), the GUI was reached from the host at `10.20.254.10`, and the filter was re-enabled (`pfctl -e`). This was a temporary exception to R03.

### Remaining before the P0 exit gate

- Review the virtual NIC model. OPNsense currently detects `em0`/`em1`; the network plan specifies VMware VMXNET3 (`vmx0`/`vmx1`). Recheck interface assignments and repeat connectivity tests if the model changes.
- Build the administrative path R02 (host port `2222` → `fw-01` → `mgmt-01:22`), so the web GUI is reached through the bastion as R03 intends, without disabling the filter.
- Enforce R05, R13 and R15 so no zone can bypass `fw-01` for DNS, either directly on port 53 or through DNS over HTTPS.
- Configure NTP on `fw-01` with at least one server by IP address, and point `mgmt-01` to `fw-01` for time (R05).
- Complete and verify the firewall access matrix, network isolation, DNS/NTP, and recovery procedure.

No credentials are included in this log.
