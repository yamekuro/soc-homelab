# 0010 · Retention by data type

- **Status:** Proposed
- **Date:** 2026-10-08
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

No numeric retention policy is accepted yet.

The candidate design is separate searchable storage, retained originals and fixed evidence/fixtures. The final choice and durations require an available-space budget and documented investigation windows. This is a proposal, not a requirement added to the blueprint.

| Data category | Purpose and preservation requirement | Values to settle before deployment |
|---|---|---|
| Indexed alerts | Investigation and source-to-alert trace | Searchable window, index capacity and lifecycle action |
| Received events, including benign activity | Baseline, comparison and investigation of activity without alerts | Whether indexed, searchable window, original-event archive window and archive capacity |
| Source-health and operational data | Disconnects, delays, storage issues, loss and recovery metrics | Window, measurement granularity and capacity |
| Fixtures and normalised test events | Repeat rules and searches; retain expected outcomes | Named datasets, versions, private/public destinations and preservation conditions |
| Case and gate evidence | Support conclusions, timestamps, hashes and manifests | Export and preservation conditions, private originals and anonymised published samples |
| Configuration and recovery records | Recreate data handling and verify recovery | Versions, separate copies and restore procedure |

Before accepting the policy, each category must have an explicit value or condition, its storage location, its investigation purpose, its space allowance and the action taken at expiry. Original events needed by an unresolved test or case must have a preservation route before operational expiry.

The data contract retains source time, ingestion time, host, user, process, origin, event ID, rule version and expected result. Fixtures include the original or a documented anonymised counterpart, the normalised event, the expected result and the relevant configuration/rule version. This information supports the programmed checks; those checks are not completed by writing this decision.

Estimate storage separately for each actual copy:

`budget = daily indexed-alert growth × alert days + daily indexed-event growth × event days + daily retained-file growth × archive days + evidence/configuration/snapshot reserves`

Use measured growth where available and clearly labelled planning estimates for sources not yet deployed. Count disk copies separately, without assuming an index has the size of the original event or assuming a compression ratio.

Index lifecycle rules are distinct from deletion or preservation of manager files. Wazuh supports index retention through Index State Management policies. Applying an index policy does not by itself establish a policy for archive files or private evidence. [Wazuh index lifecycle management](https://documentation.wazuh.com/current/user-manual/wazuh-indexer-cluster/index-lifecycle-management.html).

## Consequences

Available-space measurements and durations remain pending. No deletion policy, global archiving setting or automatic purge has been applied.

During P1, verify that the selected policy permits the required source-to-alert trace, benign controls, fixture replay, retrieval of preserved evidence and interruption/recovery accounting. Use isolated test data to verify lifecycle behaviour; writing a policy is not evidence that it works.

The local retention proposal does not set cloud retention or cost controls for L. Those remain in the parallel AWS programme. Scope and phase gates remain unchanged.

See the [P1 preflight record](../../infra/p1-preflight.md) for the required measurements and the open decision fields.
