# P0 foundation · public write-up

## Decision and reason

Build a segmented lab with an appliance firewall and a bastion role before adding telemetry and exercise sources. Separate administrative access, service exceptions, outside-network protection and final denial. The public topology uses illustrative identifiers; the original operating record is kept separately.

## Lessons observed

- The active host firewall provider must be tested, not inferred from a visible rule in another console.
- Firewall restarts invalidate relevant connection states; reopening access is a separate observation from whether a rule was saved and applied.
- DNS, time, certificates and host sleep interact with the reliability of evidence.
- An appliance backup does not include every host, hypervisor, client or custom-file dependency.

## Verification and limits

Historical P0 samples covered administrative access, selected positive and negative paths, DNS/time behavior and a restore on the same installation. They did not prove every rule, every service, clean-install recovery or future source workloads. Later MGMT samples added three locally attributed firewall blocks; see the [evidence summary](../docs/evidence-summary.md).

## Next phase

P1 segmentation is documented and remains in validation. Wazuh, new source deployment, R07 receipt and complete recovery and resource gates are pending. The project does not present planned telemetry, universal isolation or a fully audited administrative boundary as completed results.

Portfolio summary: built and documented a segmented foundation, investigated host-filtering and recovery dependencies, and reported the practical limits of its tests.
