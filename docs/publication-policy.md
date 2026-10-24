# Publication and privacy limits

The public edition retains the reasoning, policies, summarised tests and project capabilities. Internal addresses and machines in the examples are illustrative. Fictional logs are not reconstructed with those values: historical results are described by roles in the original environment.

The real administrative entry point, personal machine identifiers, MAC addresses, secret locations, key names and operational transcripts have been omitted. Originals are kept outside this edition. Standard service ports and public vendor references may be retained for their technical value.

## Review performed

Before preparing the privacy correction, both visible branches were reviewed: 33 commits—32 from the branches and one additional commit referenced by an old deployment—32 unique trees and 133 unique text-file versions. Their contents were checked against the Git blob identifiers. Commit messages, the pull request, available comments, tag references and visible releases were also inspected. That sample contained no comments, tags or releases. Metadata from 15 GitHub Pages runs was also reviewed: those runs returned no artifacts. Execution logs and the rendered deployed website were not inspected as part of that review.

The review did not identify unequivocally usable credentials with the checks employed. It did find internal addresses, the administration chain, machine names, identities and MAC addresses in current or historical versions. A heuristic search does not prove universal absence of secrets or cover external copies or references that have not been enumerated.

## History and branches

A normal commit changes the current version of a branch but does not remove earlier versions, other branches, downloaded copies or caches. At the time of the review, the correction was being prepared in a draft pull request: preparing that pull request did not itself change the main branch or rewrite history.

No credential leak has been declared, and a history rewrite is not presented as necessary solely because private IP addresses were found. If a usable secret were identified, the first step would be to revoke or rotate it and then determine the scope of removal. GitHub explains the impacts and limits of that procedure in its [official guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

The treatment of the public edition is informed by the review of internal information when extracting or sharing logs described by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude). This is neither OWASP certification nor a complete security audit of the system.

## Technical status

The [firewall guide](firewall-policy.md) and [evidence summary](evidence-summary.md) retain their limits: P1 remains under validation, the Wazuh receiver is planned and, at the evidence cutoff, browser review of the maps and actual printing remained pending. Editorial sanitisation does not change the laboratory configuration or execute its tests.
