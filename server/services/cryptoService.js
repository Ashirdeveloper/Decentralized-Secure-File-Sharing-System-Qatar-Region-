const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

// Generate a random key
const generateKey = () => {
    return crypto.randomBytes(32);
};

// Generate a random IV
const generateIV = () => {
    return crypto.randomBytes(16);
};

// Encrypt a buffer
const encrypt = (buffer, key) => {
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    // Return IV:EncryptedData
    return {
        iv: iv.toString('hex'),
        content: encrypted
    };
};

// Decrypt a buffer
const decrypt = (encryptedBuffer, key, ivHex) => {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted;
};

module.exports = {
    generateKey,
    generateIV,
    encrypt,
    decrypt
};
