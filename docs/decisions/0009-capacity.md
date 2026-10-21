# 0009 · Capacity for P1 and the P0–P2 target

> Public edition: internal addresses and roles are illustrative; historical observations refer to the original environment. Full operating records are kept separately. Values are not a current access inventory.


- **Status:** Accepted (initial implementation design; runtime verification pending)
- **Date:** 2026-10-08
- **Updated:** 2026-10-17
- **Phase:** Before P1
- **Source baseline:** 4b97f8f6e28552f0c173c73bdf0841292c7d85e3

## Context

[Decision 0001](0001-hypervisor.md) selects VMware Workstation on the Windows host. The [inventory](../../infra/inventory.md) records 32 GB of host RAM, a 2 TB SSD, `fw-01` at 4 GB and `mgmt-01` at 2 GB, checked on 2026-10-01. These are published observations from that date, not fresh measurements.

The [network plan](https://yamekuro.github.io/soc-homelab/network-plan.html) allocates 2 GB to the firewall and 1 GB to the bastion, 4 GB to Windows, 1 GB each to the Linux server and web server, 8 GB to Wazuh, and 4 GB to the case manager. The scanner, attack machine and isolated sandbox each use 4 GB on demand. The [P0 carry-over](../progress.md) requires resolving the RAM budget before Wazuh arrives.

All capabilities, phases and exit gates remain in scope. Case management is a P2 capability, and its product is an open decision before P2. The zone label SOC does not assign an installation phase to every machine in it. The table below preserves the original workload comparison, including the recorded 4 GB firewall / 2 GB bastion baseline. The selected initial design, including the tested 1 GB bastion, is recorded under Decision below; the historical comparison is not the selected allocation.

| Workload | VM RAM with plan sizes | VM RAM with baseline P0 sizes | Total with plan sizes + host | Total with baseline P0 sizes + host |
|---|---:|---:|---:|---:|
| P0: firewall and bastion | 3 GB | 6 GB | 9–11 GB | 12–14 GB |
| P1 telemetry and services: P0 + Windows + Linux + web + Wazuh | 17 GB | 20 GB | 23–25 GB | 26–28 GB |
| Complete always-on target, including case manager | 21 GB | 24 GB | 27–29 GB | 30–32 GB |
| Complete target + one on-demand VM | 25 GB | 28 GB | 31–33 GB | 34–36 GB |
| Complete target + two on-demand VM | 29 GB | 32 GB | 35–37 GB | 38–40 GB |
| Complete target + scanner, attack VM and sandbox | 33 GB | 36 GB | 39–41 GB | 42–44 GB |

The totals use the plan's 6–8 GB host reservation and rounded RAM units. They exclude any VMware overhead not already included in that reservation, peaks and additional host applications. Thin disk allocations do not establish available physical storage. Simultaneously running all on-demand machines is a capacity scenario, not a requirement found in the curriculum.

With baseline P0 sizes, the nominal P1 workload leaves 4–6 GB before unmeasured overhead, using the historical host reservation. The plan-size columns reproduce the original allocations for arithmetic comparison: they save 3 GB but still leave between a 1 GB deficit and 1 GB spare for the complete target plus one on-demand VM. They are not endorsed allocations; the 2 GB firewall size is below the current published minimum, as reviewed below.

The source does not size the P4 sensors, P5 AI or P6 OT workloads. The figures above do not demonstrate capacity for the entire curriculum.

## Review within the 32 GB constraint

The [2026-10-15 readings](../../infra/p0-measurements-2026-10-15.md) record the baseline P0 allocations and only those two guests powered on. Initial readings were 16.6 GB available and 14.5 / 33.9 GB committed. A later CIM query shown in screenshots, with Steam closed and both guests still running, reports 20.05 GiB available and 9.08 / 33.91 GiB committed. These are point readings, not runtime acceptance evidence for P1/P2. The user has fixed 32 GB as a hard design limit; increasing host memory is outside the selected scope. Separate Task Manager screenshots on 2026-10-16 show 31.9 GB usable, 11.4 GB in use, 20.5 GB available and 9.1 / 33.9 GB committed, plus a partial process sample. These are a baseline for a proposed reserve, not a host-only calculation or a peak/full-deployment test.

The original smaller firewall allocation cannot be assumed valid. Current [OPNsense guidance](https://docs.opnsense.org/manual/hardware.html#hardware-requirements) lists 3 GB as a limited minimum, 4 GB as a reasonable configuration and 8 GB as recommended. Keep 4 GB in the candidate budget. The [Wazuh quickstart](https://documentation.wazuh.com/current/quickstart.html#hardware) recommends 8 GiB for an all-in-one deployment with 1–25 agents; keep that planning reference. The [Debian 13 guide](https://www.debian.org/releases/trixie/amd64/ch03s04.en.html) recommends 1 GB without a desktop. The user has completed the observed basic P0 checks at the requested 1024 MB bastion allocation: SSH, sudo, DNS, time, the six TCP probes, browser access to the firewall login and a sudo apt update. The subsequent screenshot shows 929 MiB guest-visible total, 281 MiB used, 647 MiB available and zero swap used. After a targeted two-package security upgrade, the user's installed-version and memory readback records 302 MiB used, 626 MiB available and zero swap used. These point readings support the tested basic workload; the later agent and full-phase behaviour must be evaluated during P1, without making agent verification a prerequisite to installing Wazuh. See the [trial record](../../infra/p0-recheck-2026-10-15.md).

The blueprint [defines components as functions rather than one VM per block](https://yamekuro.github.io/soc-homelab/blueprint.html). The [network plan](https://yamekuro.github.io/soc-homelab/network-plan.html) permits one on-demand machine at a time and explicitly offers Markdown case templates as an alternative to a dedicated case application. That is an option to evaluate, not a selected implementation or proof that its consumption is zero.

| Candidate VM budget | P1 VMs | P1 + one on-demand role, before a dedicated case VM | Remaining for host, VMware, case function and headroom |
|---|---:|---:|---:|
| Keep baseline P0 allocations | 20 GB | 24 GB | 8 GB |
| Validate bastion at 1 GB; keep firewall at 4 GB | 19 GB | 23 GB | 9 GB |

Keeping the original additional 4 GB case VM would instead produce 28 GB or 27 GB of VM allocations respectively, before host overhead. Neither row demonstrates that this full configuration fits the current host.

A case-function resource allowance may be designed now, but product selection remains before P2. Its templates, orchestration/API and export criteria, ticket, executive report, handover and evidence remain in scope. Required targets, services and telemetry must remain active in each exercise window. The selected resource architecture is recorded below; no case product or implemented integration is implied.

## Windows case-management constraint, 2026-10-16

The user requires case management to remain on Windows. Moving that function to the Mac is outside the selected design. This location choice does not itself require a separate 4 GB VM or select a product. A Windows-host implementation within a measured shared resource envelope, or a Windows-only operating-window design that preserves a usable case workflow, must satisfy the original templates, API/orchestration and export criteria before P2.

The complete P1 VM budget is 19 GB. An 8 GB reserve for Windows, applications and VMware gives 27 GB in the plan's rounded units; adding one 4 GB on-demand role gives 31 GB. The host screenshot shows 31.9 GB usable. The selected design includes the case function in the shared host reserve. No case-product compatibility, zero consumption or completed API capability is inferred from using templates. A dedicated case VM of 4 GB plus the on-demand role is excluded from concurrency by the decision below.

## Options considered

| Option | Effect | Conditions and trade-offs |
|---|---|---|
| Keep the baseline P0 allocations | Preserves the original deployment sizes; P1 arithmetic is 26–28 GB including the host reservation | P0–P2 capacity must still be resolved; host overhead and real workload behaviour remain unmeasured |
| Validate the bastion at 1 GB while keeping the firewall at 4 GB | Recovers 1 GB; P1 VM allocations become 19 GB | Must preserve administrative access, sudo, updates, agent workload and the P0 checks; the complete target plus one demand VM still totals 33–35 GB with the historical host reservation |
| Schedule machine operation by exercise | Uses the plan's on-demand model while retaining every capability | Requires a dependency and simultaneity map for all exercises; cannot switch off a required target, telemetry source or case function to make the sum fit |
| Increase compatible host memory | Would increase physical capacity | Outside the user's confirmed 32 GB limit |

The plan mentions Markdown case templates as a possible saving. Selecting that implementation is not part of this proposal: the case-management decision and its criteria remain in P2. Changing hypervisors would reopen an accepted decision and is not selected here.

## Decision

Select the following initial resource architecture for implementation on 2026-10-17, under the owner's instruction to continue within 32 GB, keep cases on Windows and preserve the curriculum. This is the implementation design selected in the working session, not a claim that the owner separately approved every numeric estimate or that full-phase performance has been measured.

### RAM and operating windows

| Function | Guest RAM | Operation |
|---|---:|---|
| fw-01 | 4 GiB / 4096 MiB | Active throughout laboratory windows |
| mgmt-01 | 1 GiB / 1024 MiB | Active; observed administrative checks completed |
| Windows / Sysmon | 4 GiB / 4096 MiB | Active P1 source |
| Internal Linux | 1 GiB / 1024 MiB | Active P1 service/source |
| Web / DMZ | 1 GiB / 1024 MiB | Active P1 service/source |
| Wazuh all-in-one | 8 GiB / 8192 MiB | Active manager, indexer and dashboard; 4 vCPU initial allocation |
| P1 guest total | 19 GiB | All six functions remain active |
| One demand role | 4 GiB / 4096 MiB | Scanner OR attack OR isolated sandbox |

Reserve 8 GiB jointly for Windows, normal host applications, VMware overhead outside guest allocations and the Windows case function. The resulting planning totals are 27 GiB for P1 and 31 GiB with one demand VM. These are allocations plus a design reserve, not measured resident totals. The remaining margin is less than 1 GiB against the usable capacity displayed by Windows; it is not an allowance for another server or a proven performance buffer. The host baseline supports a trial, not sustained acceptance.

Select the case function on the Windows host within that shared envelope. Before P2, choose and verify an implementation meeting templates, timeline, evidence, ticket, executive report, handover, Spanish case, API/orchestration and export criteria. A plain Markdown folder alone does not prove API capability. Count editor, browser and background-service consumption. Do not expose the host directly to adversarial lab traffic or open untrusted attachments there; use the isolated sandbox.

A dedicated 4 GiB case VM is an alternative only in windows without the 4 GiB demand VM: 19 + 4 + 8 = 31 GiB. During demand, the host case workflow must remain available and preserve IDs, chronology, decisions and evidence references; any transfer to a dedicated product must be verified without traceability loss. If an exercise requires the dedicated application's live API during demand, that alternative does not fit and cannot be used as a substitute for a verified host implementation. Do not silently omit the API, switch off a required target/source or add the excluded 35 GiB concurrency. Revisit this design before P2 if no candidate meets both capabilities and resources. No future product compatibility is asserted.

Use separate demand windows for detection tests, vulnerability scanning/fix/rescan and isolated phishing detonation. Keep the required targets, services, ingestion and case workflow running. Confirm receipt and preservation before changing windows. Detailed P2 exercises retain their phase; sensors, AI, OT and other P3–P6 workloads require later sizing and are not declared covered by these figures.

### Storage planning within the measured C: volume

The [2026-10-17 disk/folder record](../../infra/p0-measurements-2026-10-15.md) records both displayed virtual disks on C:, 40 GB maximum each, the complete folder totals and approximately 1.3 TB free. Snapshot chain details, external files and a separate private backup destination remain unverified. Retain those recovery tasks without adding a fresh full-rebuild gate before P1.

All new values in this table are **planning estimates**, not blueprint requirements, existing provisions or guaranteed maximum growth. Budget every retained on-demand VM disk even though only one runs at a time.

| Additional C: space purpose | Initial allowance |
|---|---:|
| New Wazuh virtual disk | 300 GiB |
| New Windows source disk | 80 GiB |
| New internal Linux disk | 30 GiB |
| New web/DMZ disk | 30 GiB |
| Three future demand-role disks | 240 GiB (80 each) |
| Optional future dedicated case disk | 80 GiB, held even if the host implementation is used |
| Principal protected fixtures/cases/configuration outside VM disks | 40 GiB |
| Further growth of existing P0 files, excluding separately budgeted snapshot growth | 80 GiB conservative additional allowance |
| Additional snapshot growth | 60 GiB shared planning allowance |
| New installation media and staging | 20 GiB |
| Total additional growth/provision envelope | 960 GiB |
| Host free-space reserve to preserve | 150 GiB |
| Combined planning requirement against currently free space | 1110 GiB (approximately 1.192 TB in decimal bytes) |

The combined requirement is below the approximately 1.29 TB initial / 1.3 TB subsequent free-space readings even using decimal TB for a conservative comparison, but those rounded observations are not exact-byte certification. Recheck C: free space at provisioning; record actual disk units/byte capacity rather than silently equating VMware labels with GiB. No physical allocation has been made by this decision.

The 300 GiB Wazuh disk includes an estimated 220 GiB of the accepted retention allowance: 180 GiB operational data plus 40 GiB temporary work. The remaining 80 GiB is for guest OS, software, state and internal filesystem margin. The other 40 GiB of the accepted 260 GiB allowance is the protected host data row. Do not add the same 260 GiB again to the virtual disks. Thin provisioning does not remove the growth budget.

Current occupied folder bytes are already reflected in free space and are not subtracted again. Existing snapshot files are already included in their folder totals; 60 GiB is for additional growth, not an assertion that every snapshot fits or can be deleted. A snapshot/recovery operation may need more temporary space; assess its actual chain before executing it. Do not purge protected data or snapshots automatically merely to stay within an allowance.

Keep a separate private recovery copy, provisionally 40 GiB under decision 0010, on another medium/system when its destination is selected. It is not claimed to exist. If any additional copy or external dependency uses C:, add its bytes to this budget (40 GiB would make 1150 GiB including the host reserve) and recheck available space. Source-native buffers belong inside their endpoint disk budgets; exports count in the protected-data row. Changes to source volume, snapshot behaviour or case product require updating these estimates.

### Validation and response to limits

Implement progressively during P1 and verify ingestion/indexing, source health, auditing, access, DNS, time, memory/paging and recovery under the documented workload. Test mgmt-01 with its later agent before claiming the 1 GiB allocation supports P1; the observed P0 evidence is not that test. Do not begin a demand exercise if it would impair required ingestion or case work. Stop that optional load, preserve evidence and revise the resource design if necessary. If the bastion requires restoring 2 GiB, reopen the demand/concurrency arithmetic rather than retaining the old totals.

Monitor disk growth and retention during P1. Before growth consumes the host reserve or projected data exceeds an allowance, review provisioning, exports and recovery copies. Retention windows and protected evidence cannot be silently reduced. Snapshot inventory and backup/recovery implementation remain tracked; this design is not proof of restoration. No new fixed paging threshold, test duration or performance guarantee is invented.

## Consequences

The initial capacity architecture and operating windows are now selected within the 32 GB constraint, with the historical deficit explicitly excluded by relocating the case function into the Windows host envelope or a valid no-demand window. This resolves the written resource-design prerequisite for beginning P1, not runtime acceptance or future product compatibility. The 31 GiB demand window has little margin and must be validated when used. No new P1 VM or firewall rule has been deployed by this record.

The [P1 preflight record](../../infra/p1-preflight.md) tracks implementation and evidence. Later workloads remain in their original phases and require their own sizing when specified. This decision preserves the blueprint's functions and does not close a phase.

