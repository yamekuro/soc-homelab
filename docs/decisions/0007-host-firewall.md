# 0007 · Effective host firewall

Status: accepted. Historical testing showed that a rule in a management console did not establish effective filtering when another installed provider owned the applicable host firewall categories.

## Decision and reason

Identify and restrict the provider that actually filters hypervisor traffic. Preserve required outbound guest connectivity and restrict administrative ingress to an authorized origin. Verify both an allowed administrator and a denied separate device; do not rely only on configuration screenshots.

The historical sample found and corrected an overly broad application permission in the active provider. The public edition omits the real application-rule export, entry port, client identity, outside addresses and forwarding chain. That omission does not change the lesson or claim that all applications and future updates were tested.

Retest after relevant hypervisor, host-firewall or networking changes. Host filtering is an external dependency of appliance recovery and needs its own protected configuration record. See the [operating method](../runbook.md) and [evidence scope](../evidence-summary.md).
