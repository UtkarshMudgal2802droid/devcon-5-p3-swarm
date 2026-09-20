import { Bee, PrivateKey, Topic } from '@ethersphere/bee-js';
import crypto from 'crypto';

const bee = new Bee('http://localhost:1633');

// A deterministic 32-byte topic for our catalog feed
const TOPIC_BYTES = new Uint8Array(32);
TOPIC_BYTES.set(new TextEncoder().encode("DeccanBirdersCat")); 
const CATALOG_TOPIC = new Topic(TOPIC_BYTES);

async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0];

    try {
        if (cmd === 'init') {
            const bytes = crypto.randomBytes(32);
            const privateKey = new PrivateKey(bytes);
            console.log(`\nNew Steward Private Key: ${privateKey.toHex()}`);
            console.log(`New Steward Public Address: ${privateKey.publicKey().address().toHex()}\n`);
            console.log(`Save this Private Key. You will need it to publish updates and hand off stewardship.\n`);
        } 
        else if (cmd === 'update') {
            const privKeyHex = args[1];
            const batchId = args[2];
            const nextStewardAddr = args[3]; // optional

            if (!privKeyHex || !batchId) {
                console.log("Usage: update <privateKeyHex> <batchId> [nextStewardAddressHex]");
                process.exit(1);
            }

            const privateKey = new PrivateKey(privKeyHex);
            const writer = bee.feed.makeWriter(CATALOG_TOPIC, privateKey);

            const payload = {
                title: "Deccan Birders Catalogue",
                lastUpdated: new Date().toISOString(),
                batchId: batchId,
                nextSteward: nextStewardAddr || null,
                items: [
                    { id: 1, condition: "Fragile", photographed: true },
                    { id: 2, condition: "Good", photographed: false }
                ]
            };

            console.log("Publishing payload...");
            const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
            const result = await writer.uploadPayload(batchId, payloadBytes);
            console.log(`Update published successfully.`);
            console.log(`Feed reference: ${result.reference.toHex()}`);
        }
        else if (cmd === 'read') {
            const startAddressHex = args[1];
            if (!startAddressHex) {
                console.log("Usage: read <startAddressHex>");
                process.exit(1);
            }

            let currentOwner = startAddressHex;
            let currentPayload: any = null;

            console.log(`\nStarting resolution from original steward: ${startAddressHex}`);

            while (true) {
                console.log(`Reading feed for owner: ${currentOwner}...`);
                const reader = bee.feed.makeReader(CATALOG_TOPIC, currentOwner);
                
                try {
                    const result = await reader.downloadPayload();
                    // result.payload is likely a string or object if it's already decoded? Or we can just log it
                    console.log("Raw payload type:", typeof result.payload);
                    let currentPayloadRaw = result.payload;
                    if (currentPayloadRaw.text) {
                        currentPayloadRaw = await currentPayloadRaw.text();
                    }
                    if (currentPayloadRaw.bytes) {
                        currentPayloadRaw = new TextDecoder().decode(currentPayloadRaw.bytes);
                    }
                    
                    const text = typeof currentPayloadRaw === 'string' ? currentPayloadRaw : (currentPayloadRaw instanceof Uint8Array ? new TextDecoder().decode(currentPayloadRaw) : JSON.stringify(currentPayloadRaw));
                    currentPayload = JSON.parse(text);

                    if (currentPayload.nextSteward) {
                        console.log(`-> Handoff detected! Steward delegated to: ${currentPayload.nextSteward}`);
                        currentOwner = currentPayload.nextSteward;
                        continue; // Follow the chain
                    } else {
                        break; // End of chain
                    }
                } catch (err: any) {
                    console.error(`Failed to read feed for ${currentOwner}:`);
                    console.error(err);
                    break;
                }
            }

            if (currentPayload) {
                console.log(`\n==== FINAL CATALOG STATE ====`);
                console.log(JSON.stringify(currentPayload, null, 2));
                console.log(`=============================\n`);
                console.log(`Active Batch ID for topups: ${currentPayload.batchId}`);
            } else {
                console.log("Could not resolve any catalog data.");
            }
        }
        else if (cmd === 'topup') {
            const batchId = args[1];
            const amount = args[2];
            if (!batchId || !amount) {
                console.log("Usage: topup <batchId> <amount>");
                process.exit(1);
            }

            try {
                console.log(`Fetching current metrics for batch ${batchId}...`);
                const stamp = await bee.stamp.get(batchId);
                const ttlSeconds = (stamp as any).batchTTL || 0;
                const daysRemaining = Math.floor(ttlSeconds / (24 * 3600));
                
                console.log(`\n======================================================`);
                console.log(`[Honesty Check] Batch Time-To-Live Metrics`);
                console.log(`Currently, this storage will expire in ~${daysRemaining} days.`);
                console.log(`If it reaches 0, the catalog will be permanently lost.`);
                console.log(`======================================================\n`);
                
            } catch (err) {
                console.log(`Could not fetch prior metrics for batch. Proceeding anyway...`);
            }

            console.log(`Topping up batch ${batchId} with ${amount} xBZZ...`);
            await bee.stamp.topUp(batchId, amount);
            console.log("Top-up successful! The collective storage has been secured for an extended period.");
        }
        else {
            console.log("Unknown command. Available: init, update, read, topup");
        }
    } catch (err) {
        console.error("Error executing command:", err);
    }
}

main();
