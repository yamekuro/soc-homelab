# Restore log

Every restore test, with its starting point and how the result was checked. The procedures are in the [runbook](../docs/runbook.md).

| Date | What was restored | Starting point | Result | Checked with |
|---|---|---|---|---|
| 2026-10-01 | `fw-01` configuration, from its encrypted backup: all areas, with a reboot | Snapshot *antes de reglas MGMT 2026-10-01*: no MGMT rules, every test connection open | The rules, the aliases and the disabled anti-lockout rule came back | The verification battery gave the same results as before; the web GUI opened through R03 at 14:09 UTC |

## Not tested yet

- Restoring the backup onto a new installation of `fw-01`.
- Console option 13, *Restore a backup*, from the local configuration history.
- Rebuilding `mgmt-01` from the [templates](templates/README.md).
