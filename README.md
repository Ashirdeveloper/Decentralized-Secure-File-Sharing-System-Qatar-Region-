# Decentralized Secure File Sharing System (Qatar Region)

This project is a **Zero Trust** secure file sharing application designed for the Qatar region. It uses **Shamir's Secret Sharing (SSS)** to split encrypted files into shards across simulated decentralized nodes. 

**Key Security Features:**
- **Zero Trust:** Every request is authenticated via JWT.
- **Geo-Fencing:** Access strictly limited to Qatar IPs (simulated for dev).
- **Encryption:** AES-256-CBC encryption for all files.
- **Sharding:** Files are split into 5 shards; 3 are required to reconstruct.
- **RAM-Only:** Reconstructed files exist only in memory and are never written to disk.
- **Self-Destruct:** Files and metadata expire automatically.
- **AI Scanner:** Detects sensitive Qatar ID and Phone numbers before processing.

## 📂 Project Structure

```
root
├── server/                 # Node.js Express Backend
│   ├── config/             # Constants & Secrets
│   ├── controllers/        # Auth & File Logic
│   ├── middleware/         # Auth, GeoFence, Logging
│   ├── mock_nodes/         # Simulated storage nodes (node1..5)
│   ├── routes/             # API Routes
│   ├── services/           # Crypto, SSS, AI Scanner, Storage
│   ├── index.js            # Entry Point
│   └── .env                # Environment Variables
└── client/                 # React (Vite) Frontend
    ├── src/
    │   ├── api/            # Axios setup
    │   ├── components/     # PrivateRoute, UI components
    │   ├── context/        # Auth Context
    │   ├── pages/          # Login, Upload, Reconstruct, etc.
    │   └── App.jsx         # Routing
    └── vite.config.js
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm

### 1. Backend Setup
```bash
cd server
npm install
# Dependencies: express, cors, helmet, jsonwebtoken, bcryptjs, multer, ip-range-check, secrets.js-grempe, uuid, dotenv
```

### 2. Frontend Setup
```bash
cd client
npm install
# Dependencies: axios, react-router-dom, lucide-react, jwt-decode
```

### 3. Running the System
You need two terminals.

**Terminal 1 (Backend):**
```bash
cd server
node index.js
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# client runs on http://localhost:5173
```

## 🔐 Environment Variables

The `server/.env` file is pre-configured for this prototype:
```env
PORT=5000
JWT_SECRET=super-secure-jwt-secret-qatar-2026
SIMULATE_QATAR=true  # Set to false to enforce real IP checks
FILE_TTL_MINUTES=60
```

## 🛠️ Module Explanation

### Backend
- **Auth Middleware (`middleware/auth.js`)**: Verifies JWT tokens on every protected route.
- **GeoFence Middleware (`middleware/geoFence.js`)**: Checks user IP against Qatar IP ranges using `ip-range-check`. Returns 403 if outside.
- **Crypto Service (`services/cryptoService.js`)**: Handles AES-256 encryption/decryption.
- **SSS Service (`services/sssService.js`)**: Uses `secrets.js-grempe` to split the **Encrypted Payload** (Key + Data) into 5 hex shares. 
- **AI Scanner (`services/aiScannerService.js`)**: Regex scanning for Qatar IDs (`^2|3\d{10}`) and Phone numbers.
- **Storage Service (`services/storageService.js`)**: Manages in-memory metadata map and file system operations for the `mock_nodes` directories. Handles TTL self-destruct.

### Frontend
- **AuthContext**: Manages user session state using JWT stored in localStorage.
- **Upload Page**: Scans file, sends to server. Displays the returned **Shard Keys** (Share Tokens) to the user.
- **Reconstruct Page**: Accepts 3 keys, validates them, and triggers a stream download of the reconstructed file.

## 🧪 Verification Steps

1. **Register/Login**: Create an account.
2. **Upload**: Select a file (<2MB). 
   - Observe "AI Scan" warnings if you upload a file with 11-digit numbers starting with 2 or 3.
   - Copy the 5 **Shard Keys** generated.
3. **Check Server**: Look in `server/mock_nodes/node1...node5`. You will see shard files.
4. **Reconstruct**: Go to Reconstruct page. Paste ANY 3 of the keys.
   - The file initiates download.
   - The server logs "Destroying shards" (if configured for immediate destruction) or waits for TTL.
5. **Geo-Fencing**: Toggle `SIMULATE_QATAR=false` in `.env` and try accessing from localhost (will likely block or warn depending on logic), demonstrating protection.

---
**Note:** This is a prototype. In production, `secrets.js` should be replaced with a high-performance WASM library for larger files, and `mock_nodes` replaced with actual distributed servers.
