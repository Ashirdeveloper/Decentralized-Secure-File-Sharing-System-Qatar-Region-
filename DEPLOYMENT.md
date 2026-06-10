# Deployment Guide

## Overview
This is a monorepo with a React frontend (Vite) and Node.js/Express backend.

```
Qatar-project/
├── client/          (React + Vite) → Deploy to Vercel
├── server/          (Express) → Deploy to Railway/Render/Fly.io
├── vercel.json      (Vercel config for client deployment)
└── .env.example     (Environment variables template)
```

---

## Frontend Deployment (Vercel)

### Steps:
1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import Git Repo
   - Select your Qatar-project repository

2. **Configure Project Settings**
   - **Root Directory**: Leave as `.` (Vercel will find vercel.json)
   - **Framework**: Automatically detected (Vite)
   - **Build Command**: Auto-detected from vercel.json
   - **Output Directory**: Auto-detected as `client/dist`

3. **Environment Variables** (if needed)
   - Add any required `.env` variables in Vercel dashboard
   - Example: `VITE_API_URL=https://your-backend-url.com`

4. **Deploy**
   - Vercel will build and deploy automatically on every push to `main`
   - Frontend live at: `https://your-project.vercel.app`

---

## Backend Deployment

### Option A: Railway.app (Recommended - easiest)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → Deploy from GitHub
3. Select the repo
4. Set **Start Command**: `node index.js`
5. Set **Environment Variables** from `.env`:
   - `PORT=5000`
   - `JWT_SECRET=your-secret-key`
   - `SIMULATE_QATAR=true`
   - `FILE_TTL_MINUTES=60`
6. Deploy — backend live at: `https://your-backend.up.railway.app`

### Option B: Render.com
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node index.js`
6. Add environment variables
7. Deploy

### Option C: Fly.io
1. Install Fly CLI: `brew install flyctl` (macOS) or download from fly.io
2. Run: `flyctl launch` in the `server/` directory
3. Configure `fly.toml` with your settings
4. Deploy: `flyctl deploy`

---

## Local Development

### Terminal 1 (Backend):
```bash
cd server
npm install
node index.js
# Runs on http://localhost:5000
```

### Terminal 2 (Frontend):
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

Or use the root script (requires `concurrently`):
```bash
npm install -g concurrently
npm run dev  # Runs both concurrently
```

---

## Key Files

- **`vercel.json`**: Tells Vercel to build `client/` as the frontend and serve all routes to `index.html`
- **`.env.example`**: Template for environment variables (copy to `.env` locally)
- **`.gitignore`**: Excludes `.env`, `node_modules/`, and build artifacts

---

## Environment Variables

### Server (.env)
```env
PORT=5000
JWT_SECRET=super-secure-jwt-secret-qatar-2026
SIMULATE_QATAR=true
FILE_TTL_MINUTES=60
```

### Client (if using API URL)
Add to `client/.env` or use Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com
```

---

## Troubleshooting

### Frontend shows 404 on refresh
- ✅ Fixed by `vercel.json` routes config (SPA fallback)

### Backend not accessible from frontend
- Update `VITE_API_URL` in frontend environment
- Ensure CORS is enabled on backend (it is in `server/index.js`)

### `.env` accidentally committed
- Run: `git rm --cached .env`
- Run: `git commit -m "Remove .env"`
- Create `server/.env` from `.env.example`

---

## Quick Checklist

- [ ] Push code to GitHub
- [ ] Create Vercel project → Deploy frontend
- [ ] Create Railway/Render/Fly project → Deploy backend
- [ ] Set environment variables on each platform
- [ ] Update `VITE_API_URL` in frontend to point to backend
- [ ] Test login, upload, and reconstruct flows
- [ ] Monitor logs on Vercel and backend platform
