# Illustrative configuration templates

These files are public examples, not verified copies of the current machines. The historical directory labels are kept for link compatibility; internal names and values in the examples do not identify real access endpoints. Do not apply them without adapting and validating them in the target environment.

| Example | Purpose |
|---|---|
| [SSH server](mgmt-01/etc/ssh/sshd_config.d/10-bastion.conf) | Illustrate key-based access and restricted direct root login |
| [Time client](mgmt-01/etc/systemd/timesyncd.conf.d/10-fw-01.conf) | Point at the illustrative MGMT time source |
| [Resolver transport](fw-01/usr/local/etc/unbound.opnsense.d/no-ipv6.conf) | Demonstrate an external resolver setting that requires separate recovery |
| [SSH client](mac/ssh_config-mgmt-01) | Demonstrate a fictitious host and key placeholder, without the original ingress chain |

Actual identity files, secrets, encrypted backups, operational access configuration and hypervisor exports are kept outside the public repository. The [role inventory](../inventory.md), [capacity design](../../docs/decisions/0009-capacity.md) and [recovery scope](../restore-log.md) provide context without presenting examples as deployed settings.
