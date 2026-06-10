const { v4: uuidv4 } = require('uuid');
const { scanBuffer } = require('../services/aiScannerService');
const { encrypt, decrypt, generateKey } = require('../services/cryptoService');
const { splitData, combineShares, bufferToHex, hexToBuffer } = require('../services/sssService');
const { saveShards, getShard, storeInitialMetadata, getMetadata, destroyFile } = require('../services/storageService');
const { SHARDS_TOTAL, SHARDS_THRESHOLD } = require('../config/constants');
const crypto = require('crypto');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        // Limit file size for Prototype SSS performance (2MB limit)
        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({ msg: 'File too large for SSS prototype. Limit is 2MB.' });
        }

        const buffer = req.file.buffer;

        // 1. AI Scan
        const scanResult = scanBuffer(buffer);

        // 2. Generate AES Key & Encrypt
        const key = generateKey(); // 32 bytes
        const { iv, content: encryptedBuffer } = encrypt(buffer, key);

        // 3. Prepare Payload for SSS
        // We will SSS the [Key + EncryptedData] so that reconstruction gives us the Key AND Data.
        // Payload layout: [Key (32 bytes)][EncryptedData (...)]
        // Actually, secrets.js works on Hex strings.
        const keyHex = key.toString('hex'); // 64 chars
        const encryptedHex = encryptedBuffer.toString('hex');
        const payloadHex = keyHex + encryptedHex;

        // 4. Split Payload into 5 Shares (Shards)
        const shards = splitData(payloadHex);

        const fileId = uuidv4();

        // 5. Store Shards in Mock Nodes
        await saveShards(fileId, shards);

        // 6. Store Metadata (IV is needed for decryption, preserved in RAM)
        // We don't store the Key in RAM map, it's in the shards!
        storeInitialMetadata(fileId, {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            iv: iv,
            size: req.file.size
        });

        // 7. Generate "Shard Keys" for the user
        // In this implementation, the "Keys" are just the indices/IDs that allow retrieving/using the shard.
        // Since the server holds the shards, we verify the User has the "Right" to use them.
        // For simplicity, we'll assume the User is the owner.
        // The "Keys" returned are simply the FileID and Shard Index? 
        // Or we return the ACTUAL Shards to the user and DELETE from server?
        // Prompt says "Store each encrypted shard in separate directories".
        // prompt says "Accept minimum 3 shard keys".
        // We will return 5 "Shard Access Tokens".
        // Token = base64(fileId + shardIndex).

        const shardKeys = Array.from({ length: 5 }, (_, i) => {
            return Buffer.from(`${fileId}::${i}`).toString('base64');
        });

        res.json({
            fileId,
            shardKeys,
            findings: scanResult.findings,
            msg: 'File uploaded, encrypted, and split. Shards dispersed to nodes.'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server Error during upload' });
    }
};

exports.reconstructFile = async (req, res) => {
    try {
        const { shardKeys } = req.body;

        if (!shardKeys || !Array.isArray(shardKeys) || shardKeys.length < SHARDS_THRESHOLD) {
            return res.status(400).json({ msg: `Minimum ${SHARDS_THRESHOLD} shard keys required.` });
        }

        // Parse Keys to find FileID and Indices
        let fileId = null;
        const shardIndices = [];

        for (const token of shardKeys) {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const [fid, idxStr] = decoded.split('::');
            if (!fileId) fileId = fid;
            else if (fileId !== fid) return res.status(400).json({ msg: 'Keys belong to different files' });
            shardIndices.push(parseInt(idxStr));
        }

        const metadata = getMetadata(fileId);
        if (!metadata) {
            return res.status(404).json({ msg: 'File not found or expired (Self-Destructed).' });
        }

        // Retrieve Shards from Nodes
        // We need the ACTUAL share strings.
        const shardsToCombine = [];
        for (const idx of shardIndices) {
            // Read from node directory
            const shardContent = await getShard(fileId, idx);
            shardsToCombine.push(shardContent);
        }

        // Combine Shards -> PayloadHex
        const payloadHex = combineShares(shardsToCombine);

        // Extract Key and EncryptedData
        // Key is first 32 bytes (64 hex chars)
        const keyHex = payloadHex.substring(0, 64);
        const encryptedHex = payloadHex.substring(64);

        const key = Buffer.from(keyHex, 'hex');
        const encryptedBuffer = Buffer.from(encryptedHex, 'hex');

        // Decrypt
        const decryptedBuffer = decrypt(encryptedBuffer, key, metadata.iv);

        // Send File
        res.set('Content-Type', metadata.mimetype);
        res.set('Content-Disposition', `attachment; filename="${metadata.filename}"`);
        res.send(decryptedBuffer);

        // Invalidate/Destroy after one-time download?
        // "Immediately destroy reconstructed file" -> It's in RAM (decryptedBuffer).
        // Sending it streams it to user. After request, it's GC'd.
        // "Files and shards automatically self-destruct after a time limit" matches requirement.
        // "Allow one-time download" -> We should destroy shards now?
        // Prompt: "Rebuild file in RAM ... Allow one-time download ... Immediately destroy reconstructed file".
        // Does "one-time download" mean the file (shards) are deleted?
        // Probably.
        destroyFile(fileId);

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Reconstruction failed. Invalid keys or data corruption.' });
    }
};

// Return metadata (for dashboard or sharing page)
exports.getFileInfo = async (req, res) => {
    const { fileId } = req.params;
    const meta = getMetadata(fileId);
    if (!meta) return res.status(404).json({ msg: 'File not found' });
    res.json({
        filename: meta.filename,
        expiresAt: meta.expiresAt,
        nodes: [1, 2, 3, 4, 5] // Simulated active nodes
    });
};
