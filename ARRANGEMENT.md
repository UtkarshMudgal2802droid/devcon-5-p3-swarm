# The Catalog Arrangement

This document defines the rules for maintaining the shared catalogue of the seven monastery libraries. It explains who is responsible for what, how the catalogue survives the departure of its maintainer, and the technological limits we all accept.

## 1. Publishing and the Steward

**Only one person, the Steward, can update the catalogue at any time.** 
The Steward holds a cryptographic key (a "private key"). This key is strictly used for publishing updates. It does *not* hold any funds, and it does not pay for storage. 

If anyone else wants to correct an entry, they must send their updates to the Steward, just as they have done for the past nine years. 

## 2. Succession (Handing Over)

When the Steward decides to step down, they do not pass their key to the next person. A shared key is an insecure key. 

Instead, the new Steward generates their own brand new key. The retiring Steward publishes one final update to the catalogue that says: *"From now on, the Steward is this new person's address."*

The catalogue software automatically detects this handoff. Anyone reading the catalogue will start at the original Steward's address, follow the "handoff" pointer to the new Steward, and read the latest data. This creates an unbroken, cryptographically verifiable chain of succession. The new Steward does exactly the same when they retire.

## 3. Paying for Storage

Swarm is a subscription. Data disappears if it is not paid for. 

However, **the Steward does not have to pay for the storage.** The current "postage batch ID" (the subscription account) is published publicly inside the catalogue itself. 

Any of the seven committees can use the software's `topup` command to add funds (xBZZ) to that batch from their own wallets. This means the community collectively shares the power to keep the data alive, completely independently of the Steward's ability to publish.

## 4. Custody and Limits of this Implementation

We must be honest about our current infrastructure:
Currently, we are sharing a single Swarm node (Ngawang's computer). While the *publishing keys* are cleanly separated between Stewards, the *storage itself* (the postage batches) belongs to the node's underlying wallet. 

Because we share one node, true custody of the storage is not genuinely separated. If the machine running the node is destroyed, the specific postage batches belonging to it cannot be topped up by others, even if they have the ID. In the future, for true decentralization, multiple committees should run their own Swarm light nodes.
