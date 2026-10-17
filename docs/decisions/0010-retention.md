# 0010 · Retention by data type

- **Status:** Accepted (policy; implementation pending)
- **Date:** 2026-10-08
- **Accepted:** 2026-10-17, by the project owner in this working conversation
- **Phase:** Before P1
- **Source baseline:** 4b97f8f6e28552f0c173c73bdf0841292c7d85e3

## Context

The [blueprint decision register](https://github.com/yamekuro/soc-homelab/blob/4b97f8f6e28552f0c173c73bdf0841292c7d85e3/docs/blueprint.html#L1615) requires a retention decision before P1, based on available space, data type and investigation needs. Its Wazuh capability requires retention by data type, source coverage and ingestion health. The curriculum also preserves fixtures, normalised events and verifiable evidence.

The blueprint does not prescribe retention days, events per second, average event size, disk percentages or an archive product. These remain design decisions. A searchable alert is not a complete record of all received activity.

Wazuh distinguishes alert indices from archives of received events. Archives are disabled by default; enabling them adds storage demand. Raw archive files and searchable indices are separate storage copies. [Wazuh event logging](https://documentation.wazuh.com/current/user-manual/manager/event-logging.html), [index patterns](https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-indices.html).

Preserving all events received by the manager does not prove that every event generated at a source reached it. The P1 source-to-alert and source-health checks still apply.

## Options considered

| Option | Investigation benefit | Trade-off |
|---|---|---|
| Alert-only operational storage, with selected original events preserved for tests | Smallest operational footprint | Historical benign activity and events that did not trigger an alert may be unavailable; requires demonstrating that the preservation process meets the curriculum |
| Index received events and alerts for the same investigation window | Broad interactive access | Highest index and storage demand; capacity and lifecycle behaviour must be measured |
| Separate searchable windows from retained originals | Supports recent searches and later replay from preserved originals | Requires explicit archive retention, exports, retrieval and recovery tests; historical data may need replay or reindexing |

## Decision

Select separate searchable windows, a received-event archive and protected evidence/fixtures. On 2026-10-17 the owner selected the presented proposal ("Elijo tu propuesta"): searchable alerts for 30 days, all received events searchable for 7 days and archived for 30 days, protected case/test evidence, fixtures and necessary configuration, and a 260 GiB initial estimated allowance for data and temporary work. The 90-day alternative was not selected. These are project design choices, not numeric requirements from the blueprint.

| Accepted policy category | Minimum window / preservation condition | Logical storage and expiry |
|---|---|---|
| Indexed alerts | 30 days from receipt | Alert indices; expire eligible indices only after required case/test material is protected |
| All received events, including benign activity, searchable | 7 days from receipt | Archive indices; independent lifecycle from alerts and manager files |
| All received events, archived | 30 days from receipt | Manager JSON files under `/var/ossec/logs/archives/`, including rotations; separate file cleanup after preservation checks |
| Fixtures and normalised test events | While a current test, rule, result or publication depends on them | Versioned private datasets and anonymised publishable samples; no age-based operational purge |
| Case and gate evidence | While a case is open and throughout the life of the project and its deliverables; owner review before later removal | Private packages outside VM disks/snapshots and anonymised published samples; no automatic expiry |
| Configuration and recovery records | Retain versions needed by current evidence, fixtures or recovery; current configuration and last verified recovery version | Secret-free repository history plus private recovery material; retire manually by dependency after successor verification |

Implementation planning defaults are 30 days for detailed health/operational history (disconnects, delay, loss, storage and recovery) and 7 days for local alert files. These defaults and the category allowances below remain labelled estimates to refine during P1, rather than additional user choices or blueprint mandates. Gate summaries become protected evidence. Source-native buffers retain their own documented rotation; export needed native originals before overwrite. A manager JSON archive is a record of received events, not necessarily a complete native EVTX or all activity generated at a source.

### Space allowance and measured basis

The [measurement record](../../infra/p0-measurements-2026-10-15.md) preserves initial C: free/total readings of 1.29/1.81 TB, later VMware free space of 1.3 TB, and the two VM folders' summed size on disk of 15,944,458,240 bytes (approximately 14.85 GiB). Both displayed disks are on C: with 40 GB maximum virtual capacity. Folder contents already include any snapshots stored inside them; existing occupancy is already reflected in free space. These observations support planning, not proof of future ingestion capacity or a verified separate backup.

The owner selected **260 GiB as an initial planning estimate**, not a disk provisioned or a measured retention guarantee. Its provisional breakdown is:

| Copy / purpose | Estimated allowance |
|---|---:|
| Indexed alerts | 40 GiB |
| Indexed received events | 40 GiB |
| Manager received-event archive | 80 GiB |
| Local alert files | 10 GiB |
| Operational/source-health indices and records, counted per actual store | 10 GiB |
| Principal fixture datasets | 10 GiB |
| Principal case/gate evidence | 20 GiB |
| Principal configuration/recovery material | 10 GiB |
| Subtotal | 220 GiB |
| Temporary extraction, exports, reindexing and operating margin | 40 GiB |
| Total initial local data allowance | 260 GiB |

These allowances must not trigger deletion before an accepted time window. If projections do not fit, record the deviation and revise capacity/export arrangements before data is lost. Changing an accepted investigation window requires revisiting this decision.

A separate private copy of fixtures, evidence and configuration has a provisional additional 40 GiB allowance; its destination is still to be established. A copy on C: consumes additional C: space but does not protect against failure of that disk. Guest operating systems, other curriculum components, endpoint buffers, VM copies, snapshot growth and the host free-space reserve are outside the 260 GiB and must be counted in decision 0009. Provisioning remains dependent on that capacity design.

### Implementation safeguards for P1

Count time from recorded receipt while retaining source timestamps for investigations. Index age policies must include index time-span/granularity so the minimum event window is preserved. For rotated files, consider the newest received event in a closed file. Identify actual paths, indices and versions at deployment; do not apply a global `wazuh-*` deletion pattern to state, configuration or inventory indices.

Enable JSON received-event archives with `logall_json` when implementing this policy, and configure their Filebeat indexing separately for the 7-day searchable copy. Index lifecycle policies do not clean manager archive files. No such setting is applied by accepting this document.

Before expiry, protect original/context data needed by an unresolved test or case. Each protected package records case/test ID, source and coverage, source/receipt intervals, location, hashes, export/anonymisation steps and relevant versions. Verify readability and replay/recovery; a hash alone does not demonstrate recovery. Observe daily growth during P1, including cuts and new sources; a proposed 7-day sampling period is a planning aid, not an added phase gate. Use isolated data to test expiry, preservation and failure visibility before automatic purges.

The data contract retains source time, ingestion time, host, user, process, origin, event ID, rule version and expected result. Fixtures include the original or a documented anonymised counterpart, the normalised event, the expected result and the relevant configuration/rule version. This information supports the programmed checks; those checks are not completed by writing this decision.

Estimate storage separately for each actual copy:

`budget = daily indexed-alert growth × alert days + daily indexed-event growth × event days + daily retained-file growth × archive days + evidence/configuration/snapshot reserves`

Use measured growth where available and clearly labelled planning estimates for sources not yet deployed. Count disk copies separately, without assuming an index has the size of the original event or assuming a compression ratio.

Index lifecycle rules are distinct from deletion or preservation of manager files. Wazuh supports index retention through Index State Management policies. Applying an index policy does not by itself establish a policy for archive files or private evidence. [Wazuh index lifecycle management](https://documentation.wazuh.com/current/user-manual/wazuh-indexer-cluster/index-lifecycle-management.html).

## Consequences

The retention choice is accepted and recorded; implementation, measured growth, capacity provision and the private recovery destination remain pending. No deletion policy, global archiving setting or automatic purge has been applied. Decision 0009 remains Proposed, and this acceptance does not close the P1 gate.

During P1, verify that the selected policy permits the required source-to-alert trace, benign controls, fixture replay, retrieval of preserved evidence and interruption/recovery accounting. Use isolated test data to verify lifecycle behaviour; writing a policy is not evidence that it works.

The local retention proposal does not set cloud retention or cost controls for L. Those remain in the parallel AWS programme. Scope and phase gates remain unchanged.

See the [P1 preflight record](../../infra/p1-preflight.md) for the required measurements and the open decision fields.

