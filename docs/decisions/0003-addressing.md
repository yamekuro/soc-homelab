# 0003 · Addressing and separation · public representation

Status: accepted design. The values below replace the original lab and outside-network addresses. They are illustrations, not an export or a tested endpoint list.

Use one non-overlapping subnet per routed zone and reserve room for later phases. The example block is `10.77.0.0/16`: MGMT `.10`, USERS `.20`, SERVERS `.30`, DMZ `.40`, SOC `.50`, ATTACK `.60`, AI `.70`, OT `.80` and WAN transit `.254`, each as a `/24`. AI, OT and ATTACK retain their future phase gates. The sandbox has no firewall link.

Within the public example, `.1` denotes the firewall; static and DHCP roles are separated. The three outside networks in `HOME_NETS` are illustrated as `172.31.240.0/24`, `172.31.241.0/24` and `172.31.242.0/24`. R01 seeks to block new lab connections to the declared outside networks. This is not a claim that every state, IPv6 path or unlisted network was tested.

The [network plan](../network-plan.html) is a design representation; the [policy guide](../firewall-policy.md) describes observed manual policy and scoped evidence. Device identifiers are logical labels in the public edition. Administrative ingress values and forwarding details are omitted.
