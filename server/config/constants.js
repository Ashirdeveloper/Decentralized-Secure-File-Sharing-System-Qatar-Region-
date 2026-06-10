require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-prod-qatar-project',
  // Set to 'true' to bypass Geo-fencing for dev/demo if not in Qatar
  SIMULATE_QATAR: process.env.SIMULATE_QATAR === 'true', 
  
  // SSS Config
  SHARDS_TOTAL: 5,
  SHARDS_THRESHOLD: 3,
  
  // File TTL (e.g., 24 hours). 
  // User said "Assign TTL timer to each file... Files and shards automatically self-destruct after a time limit"
  FILE_TTL_MS: (process.env.FILE_TTL_MINUTES || 60) * 60 * 1000, 
  
  // Node directories (simulated)
  NODE_DIRS: [
      path.join(__dirname, '../mock_nodes/node1'),
      path.join(__dirname, '../mock_nodes/node2'),
      path.join(__dirname, '../mock_nodes/node3'),
      path.join(__dirname, '../mock_nodes/node4'),
      path.join(__dirname, '../mock_nodes/node5')
  ]
};
