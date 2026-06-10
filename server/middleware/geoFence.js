const ipRangeCheck = require('ip-range-check');
const { SIMULATE_QATAR } = require('../config/constants');

// Qatar IP ranges (Partial list for demonstration)
// In a real production system, this would use a dynamically updated GeoIP database.
const QATAR_IP_RANGES = [
    '37.210.0.0/16',
    '78.100.0.0/14',
    '80.80.0.0/19',
    '82.148.96.0/19',
    '86.111.0.0/17',
    '89.211.0.0/16',
    '92.21.0.0/16',
    '92.21.128.0/17',
    '94.200.0.0/15',
    '109.227.0.0/16',
    '151.254.0.0/16',
    '178.152.0.0/15',
    '185.116.204.0/22',
    '185.148.144.0/22',
    '212.77.192.0/19',
    '212.112.224.0/19',
    '213.130.112.0/20'
];

const geoFence = (req, res, next) => {
    if (SIMULATE_QATAR) {
        console.log(`[GeoFence] Simulation Mode: Allowing ${req.ip}`);
        return next();
    }

    let clientIp = req.ip || req.connection.remoteAddress;

    // Normalize IPv6 mapped IPv4
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.substr(7);
    }

    // Allow localhost for dev testing if not strictly simulating failure
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
        // console.log('[GeoFence] Allowing localhost');
        return next();
    }

    const isQatar = ipRangeCheck(clientIp, QATAR_IP_RANGES);

    if (!isQatar) {
        console.warn(`[GeoFence] BLOCKED access from non-Qatar IP: ${clientIp}`);
        return res.status(403).json({ msg: 'Access denied: This service is restricted to Qatar region.' });
    }

    // console.log(`[GeoFence] Allowed access from Qatar IP: ${clientIp}`);
    next();
};

module.exports = geoFence;
