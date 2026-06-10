const secrets = require('secrets.js-grempe');
const { SHARDS_TOTAL, SHARDS_THRESHOLD } = require('../config/constants');

// Split hex string into shares
const splitData = (hexData) => {
    // shares is an array of hex strings
    const shares = secrets.share(hexData, SHARDS_TOTAL, SHARDS_THRESHOLD);
    return shares;
};

// Combine shares to reconstruct hex string
const combineShares = (sharesArray) => {
    const combinedHex = secrets.combine(sharesArray);
    return combinedHex;
};

// Helper: Convert Buffer to Hex
const bufferToHex = (buffer) => {
    return buffer.toString('hex');
};

// Helper: Convert Hex to Buffer
const hexToBuffer = (hex) => {
    return Buffer.from(hex, 'hex');
};

module.exports = {
    splitData,
    combineShares,
    bufferToHex,
    hexToBuffer
};
