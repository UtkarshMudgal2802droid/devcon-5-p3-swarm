# The succession nobody wrote down (Problem 3)

This repository contains the solution for Problem Statement 3: The succession nobody wrote down. 

## The Solution
We solve the succession problem using a **Linked Feeds** architecture based on Swarm Single Owner Chunks (SOC). 
- **Publishing:** A specific steward holds the private key for the feed.
- **Succession:** Succession works by publishing a `nextSteward` pointer to the successor's Ethereum address. The reader automatically traverses these pointers to find the current active steward.
- **Paying:** The current Swarm `batchId` is published in the feed payload, allowing anyone to call `topup` to fund the storage subscription, decoupling publishing from paying.

## Files
- `catalog.ts`: The Node.js CLI script for managing the catalog.
- `ARRANGEMENT.md`: The plain language document describing the arrangement to the committees.
- `HANDOFF_RECORD.md`: The record of the actual handoff performed using the CLI tool.

## Usage

```bash
npm install

# Initialize a new identity
npx tsx catalog.ts init

# Publish an update (with optional handoff to a new address)
npx tsx catalog.ts update <privateKeyHex> <batchId> [nextStewardAddressHex]

# Read the catalog (follows handoff chain automatically)
npx tsx catalog.ts read <originalStewardAddressHex>

# Top up a batch
npx tsx catalog.ts topup <batchId> <amount>
```
