// Regex patterns for Sensitive Data in Qatar

// Qatar ID (QID): 11 digits
// Format: 
// 1st digit: Century (2 or 3)
// 2nd,3rd: Year
// 4,5,6: ISO Country Code (usually 340 for born in Qatar, or others)
// 7-11: Sequence
// Simplified Regex: ^(2|3)\d{10}$
// We'll look for 11 digits specifically matching this start.
const QID_REGEX = /\b(2|3)\d{10}\b/g;

// Qatar Phone Numbers:
// Mobile: 8 digits, starts with 3, 5, 6, 7 (e.g. 33xxxxxx)
// Landline: 8 digits, starts with 4 (e.g. 44xxxxxx)
// We'll catch both.
const QATAR_PHONE_REGEX = /\b[34567]\d{7}\b/g;

const scanBuffer = (buffer) => {
    // Convert buffer to string for scanning (assuming text based or extractable strings)
    // For binary files, this might just scan raw bytes interpretation, which is hit-or-miss but standard for "DLP" prototypes.
    // We try to interpret as UTF-8
    const content = buffer.toString('utf-8');

    // Check if content is mostly binary/garbage? For now, just scan.

    const qidMatches = content.match(QID_REGEX) || [];
    const phoneMatches = content.match(QATAR_PHONE_REGEX) || [];

    const findings = [];

    if (qidMatches.length > 0) {
        findings.push({
            type: 'QID',
            count: qidMatches.length,
            examples: qidMatches.slice(0, 3) // Show first 3
        });
    }

    if (phoneMatches.length > 0) {
        findings.push({
            type: 'QATAR_PHONE',
            count: phoneMatches.length,
            examples: phoneMatches.slice(0, 3)
        });
    }

    return {
        isSafe: findings.length === 0,
        findings
    };
};

module.exports = {
    scanBuffer
};
