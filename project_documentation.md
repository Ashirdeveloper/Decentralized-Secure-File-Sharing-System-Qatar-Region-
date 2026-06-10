# Project Documentation: Decentralized Secure File Sharing System (Qatar Region)

## 📖 Project Overview
This project is a **Zero Trust** secure file sharing application designed specifically for the Qatar region. It uses **Shamir's Secret Sharing (SSS)** to split encrypted files into shards across simulated decentralized nodes, ensuring that no single node holds the complete file or the encryption key. The system emphasizes security through **RAM-only processing**, **Geo-fencing**, and **AI-based sensitive data scanning**.

---

## 🔄 App Workflow

### 1. User Access & Authentication
*   **Entry:** Users access the web portal.
*   **Geo-Fencing:** The middleware (`geoFence.js`) checks the user's IP. Access is strictly limited to Qatar IP ranges (simulated in dev).
*   **Auth:** Users must Register/Login. Authentication is handled via **JWT (JSON Web Tokens)**.

### 2. File Upload (The "Splitting" Process)
1.  **Select File:** Authenticated user selects a file (max 2MB for prototype).
2.  **AI Scan:** The server (`aiScannerService.js`) scans the file in memory for sensitive data (Qatar ID, Phone numbers) using Regex. Warnings are returned if found.
3.  **Encryption:**
    *   A random 32-byte **AES-256 Key** is generated.
    *   The file is encrypted using this key.
4.  **Payload Creation:** The system concatenates `[Key] + [Encrypted Data]`.
5.  **Sharding (SSS):**
    *   The payload is split into **5 Hex Shards** using Shamir's Secret Sharing.
    *   **Threshold:** Any **3 shards** are required to reconstruct the payload.
6.  **Distribution:** Each shard is saved to a separate "mock node" directory (`server/mock_nodes/node1` to `node5`).
7.  **Destruction:** The original file, key, and payload are wiped from RAM.
8.  **Key Delivery:** The user receives **5 Shard Keys** (metadata tokens). These keys are the *only* way to retrieve the file. The server *does not* store the keys.

### 3. File Reconstruction (The "Retrieval" Process)
1.  **Input:** User navigates to the "Reconstruct" page and inputs any **3 of the 5 Shard Keys**.
2.  **Validation:** Server validates the keys and identifies the requested file.
3.  **Retrieval:** The server reads the corresponding encrypted shards from the mock nodes.
4.  **Combination:** The 3 shards are combined to reconstruct the `[Key] + [Encrypted Data]` payload.
5.  **Decryption:** The Key is extracted to decrypt the Data.
6.  **Download:** The file is streamed to the user's browser.
7.  **Self-Destruct:** The reconstructed file in RAM and the stored shards on disk are immediately destroyed (one-time access).

---

## ✨ End Product Features

*   **Zero Trust Architecture:** Never trust, always verify. Every request is authenticated.
*   **Geo-Fencing:** Application access is restricted geographically to Qatar.
*   **Shamir's Secret Sharing (SSS):** Mathematically proven security by splitting data into parts.
*   **AES-256 Encryption:** Industry-standard encryption for data confidentiality.
*   **RAM-Only Processing:** Sensitive data (unencrypted files, keys) exists only in volatile memory, never written to disk during processing.
*   **Decentralized Storage Simulation:** Data uses a distributed mock-node architecture.
*   **AI Compliance Scanner:** Proactive detection of sensitive PII (Personall Identifiable Information).
*   **Self-Destruct Mechanism:** Files have a short Time-To-Live (TTL) or are destroyed immediately after access.

---

## 📂 Project Folder Structure & File Descriptions

### **Root Directory**

*   `README.md` - comprehensive guide on project setup, features, and usage.
*   `AI_EXPLANATION.md` - Documentation specifically detailing the AI scanning logic.
*   `GEO_FENCING_EXPLANATION.md` - Documentation detailing the Geo-fencing implementation.
*   `.gitignore` - Specifies intentionally untracked files to ignore.

### **Client (Frontend)**
*Path: `/client`*

*   `package.json` - Frontend dependencies (React, Vite, Tailwind, etc.) and scripts.
*   `vite.config.js` - Configuration for Vite bundler (proxy setup, plugins).
*   `tailwind.config.js` - Configuration for Tailwind CSS styling.
*   `postcss.config.js` - PostCSS configuration for processing CSS.
*   `index.html` - Main HTML entry point for the React application.
*   **`src/`**
    *   `main.jsx` - React entry point, mounts the App component.
    *   `App.jsx` - Main component defining application routes and layout.
    *   `index.css` - Global styles and Tailwind imports.
    *   **`api/`**
        *   `axios.js` - Configured Axios instance for making HTTP requests to backend.
    *   **`components/`**
        *   `PrivateRoute.jsx` - HOC (Higher Order Component) to protect routes requiring login.
    *   **`context/`**
        *   `AuthContext.jsx` - Manages global authentication state (user, login/logout functions).
    *   **`pages/`**
        *   `Login.jsx` - User login interface.
        *   `Register.jsx` - User registration interface.
        *   `Dashboard.jsx` - informational landing page after login.
        *   `Upload.jsx` - Interface for file selection, uploading, and viewing shard keys.
        *   `Reconstruct.jsx` - Interface for entering shard keys to download files.

### **Server (Backend)**
*Path: `/server`*

*   `package.json` - Backend dependencies (Express, cors, jsonwebtoken, etc.) and scripts.
*   `index.js` - Main server entry point. Configures middleware, routes, and starts the app.
*   `.env` - Environment variables (Secrets, PORT, specific flags).
*   **`config/`**
        *   `constants.js` - Centralized configuration strings and constants.
*   **`controllers/`**
        *   `authController.js` - Logic for handling user registration and login.
        *   `fileController.js` - Core logic for file upload (split/encrypt) and reconstruction (combine/decrypt).
*   **`middleware/`**
        *   `auth.js` - Middleware to verify JWT tokens on protected routes.
        *   `geoFence.js` - Middleware to enforce IP-based restrictions (Qatar only).
*   **`routes/`**
        *   `api.js` - Definitions of all API endpoints and their associated controllers.
*   **`services/`**
        *   `aiScannerService.js` - Logic for scanning file buffers for sensitive patterns.
        *   `cryptoService.js` - Helper functions for AES encryption and decryption.
        *   `sssService.js` - Wrapper for Shamir's Secret Sharing logic (split/combine).
        *   `storageService.js` - Manages file operations for mock nodes and in-memory metadata.
*   **`mock_nodes/`**
        *   `node1/`, `node2/`, `node3/`, `node4/`, `node5/` - Directories representing separate physical storage nodes.
