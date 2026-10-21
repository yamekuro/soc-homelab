# Operating and recovery method · public edition

This is a general method, not the current lab's access instructions. The original access chain, identities, entry ports, backup locations and secret-management entries are kept in the private operating record. Example addresses elsewhere in the repository must not be treated as real endpoints.

## Start and stop

Start the firewall before dependent clients; confirm their DNS, route and time dependencies. Stop clients before the firewall and host. A suspended host can suspend guests and distort time observations, so verify the effective power policy and guest clocks after resume.

## Administration and host filtering

Use a restricted administrative origin and an independently available recovery console. Identify the firewall provider that actually filters host traffic; a rule in an inactive provider is not evidence of protection. Verify both permitted administration and a denied device before depending on the restriction. Do not infer global GUI exclusivity from a single manual rule.

## Backups and recovery

Keep encrypted configuration backups outside the public repository and protect their passwords separately. Inventory host settings, custom files, hypervisor networking and client configuration that are not included in an appliance backup. A snapshot is not an independent backup.

Before a risky change, retain a known recovery route and a reversible configuration checkpoint. Restore through the vendor's supported mechanism in a controlled scope, then verify filtering, management, DNS, time and required applications. A historical restore on the same installation was recorded; clean-install recovery and complete external dependency recovery remain separate tests.

## Verification method

| Check | What a result establishes | Additional evidence needed |
|---|---|---|
| Ordinary HTTPS | The application path works for that destination and session | Certificate validation and response; rule attribution is separate |
| DNS positive and selected negative names | Resolver behavior from that client over the tested transport | UDP/TCP, actual clients and browser behavior |
| Forbidden resolver, external SSH and outside network | Expected negative scenarios | Correlated firewall action, rule and connection; timeout alone is insufficient |
| Time sample | Reply or client synchronization at that observation | Sustained accuracy and other clients |
| Restore | Recovery in the tested scenario | New-install recovery and external configuration |

Preserve the original timestamps and connections privately for attribution. Publish conclusions by role with limitations, without constructing fictional packet transcripts using illustrative addresses. The [current evidence summary](evidence-summary.md) describes the actual MGMT samples.
