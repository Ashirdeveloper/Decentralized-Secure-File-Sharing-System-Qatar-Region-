const fs = require('fs');
const path = require('path');
const { NODE_DIRS, FILE_TTL_MS } = require('../config/constants');

// In-memory storage for metadata and users
const fileMetadataMap = new Map();
const userMap = new Map(); // username -> { passwordHash, role, etc }

// Initialize mock node directories
const initNodes = () => {
    NODE_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

initNodes();

// Helper: Get shard path
const getShardPath = (nodeIndex, fileId) => {
    return path.join(NODE_DIRS[nodeIndex], `${fileId}_shard${nodeIndex + 1}`);
};

const saveShards = async (fileId, shards) => {
    // shards is an array of hex strings
    // We distribute them to node1..node5
    const promises = shards.map((shard, index) => {
        const filePath = getShardPath(index, fileId);
        return fs.promises.writeFile(filePath, shard, 'utf8');
    });

    await Promise.all(promises);
};

const getShard = async (fileId, nodeIndex) => {
    const filePath = getShardPath(nodeIndex, fileId);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Shard not found on node ${nodeIndex + 1}`);
    }
    return fs.promises.readFile(filePath, 'utf8');
};

const deleteShards = async (fileId) => {
    const promises = NODE_DIRS.map((dir, index) => {
        const filePath = getShardPath(index, fileId);
        return fs.promises.unlink(filePath).catch(e => {
            // Ignore if file doesn't exist
        });
    });
    await Promise.all(promises);
};

const storeInitialMetadata = (fileId, metadata) => {
    const expiresAt = Date.now() + FILE_TTL_MS;
    fileMetadataMap.set(fileId, { ...metadata, expiresAt });

    // Set timer for self-destruction
    setTimeout(() => {
        destroyFile(fileId);
    }, FILE_TTL_MS);
};

const getMetadata = (fileId) => {
    return fileMetadataMap.get(fileId);
};

const destroyFile = async (fileId) => {
    console.log(`[Storage] Storage TTL expired for ${fileId}, destroying shards...`);
    if (fileMetadataMap.has(fileId)) {
        fileMetadataMap.delete(fileId);
    }
    await deleteShards(fileId);
};

// User Management (InMemory)
const saveUser = (username, userData) => {
    userMap.set(username, userData);
};

const getUser = (username) => {
    return userMap.get(username);
};

module.exports = {
    saveShards,
    getShard,
    deleteShards,
    storeInitialMetadata,
    getMetadata,
    destroyFile,
    saveUser,
    getUser,
    initNodes
};
