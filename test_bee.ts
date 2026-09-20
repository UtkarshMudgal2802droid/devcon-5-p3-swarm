import { Bee, PrivateKey, Topic, NULL_TOPIC } from '@ethersphere/bee-js';
import crypto from 'crypto';

const bee = new Bee('http://localhost:1633');

async function test() {
    try {
        const bytes = crypto.randomBytes(32);
        const privateKey = new PrivateKey(bytes);
        
        console.log("Private key:", privateKey.toHex());
        
        // Find a valid stamp
        const stamps = await bee.stamp.getAll();
        const batchId = stamps[0].batchID;
        console.log("Batch ID:", batchId);

        const feedWriter = bee.feed.makeWriter(NULL_TOPIC, privateKey);
        
        const payloadBytes = new TextEncoder().encode(JSON.stringify({ hello: "world" }));
        
        const result = await feedWriter.uploadPayload(batchId, payloadBytes);
        console.log("Upload result:", result);
        
        const feedReader = bee.feed.makeReader(privateKey.publicKey().address(), NULL_TOPIC);
        const readResult = await feedReader.downloadPayload();
        console.log("Read result:", new TextDecoder().decode(readResult.payload));

    } catch(e) {
        console.error(e);
    }
}
test();
