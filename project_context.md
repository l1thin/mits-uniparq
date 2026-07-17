# UniParQ Project Context

## Overview
UniParQ is a smart parking management system built for the MITS campus. It enables authorized security personnel to scan or manually enter vehicle number plates, retrieve registered owner details securely, and contact them to resolve obstructive parking issues while preserving data privacy.

## Tech Stack
- **Frontend**: React 19 (Create React App), React Router v7
- **Backend**: Node.js + Express (JavaScript/ES6)
- **Database**: PostgreSQL 17 (self-hosted via Docker)
- **Authentication**: bcryptjs (hashing) + jsonwebtoken (JWT)
- **File Uploads**: Multer (local disk storage)
- **API Client**: Custom Fetch API client (`supabaseClient.js`) that mimics a Supabase SDK but communicates with the custom backend.

## Project Structure
```text
mits-uniparq/
├── frontend/               # React SPA (Runs on port 3000)
│   ├── .env                # REACT_APP_API_URL=http://localhost:54321
│   └── src/
│       ├── App.js          # Route definitions
│       ├── supabaseClient.js # Custom API client (mimics Supabase SDK)
│       └── pages/          # Login, Dashboard, AdminPanel
├── backend/                # Node.js Express server (Runs on port 54321)
│   ├── .env                # PORT, DATABASE_URL, JWT_SECRET
│   ├── server.js           # Entry point
│   ├── middleware/auth.js  # JWT verification
│   └── routes/             # auth.js, vehicles.js, functions.js
└── docker-compose.yml      # PostgreSQL database (Runs on port 54322)
```

## System Architecture Notes
- The frontend uses a custom client (`supabaseClient.js`) that looks like the Supabase SDK (e.g., `supabase.auth.signInWithPassword`, `supabase.from('profiles').select()`) but it is actually wrapping `fetch()` calls to the Express backend.
- The Express backend handles JWT generation, verification, and direct PostgreSQL queries using the `pg` pool.
- Mock plate scanning is implemented via the `/functions/scan-plate` endpoint.
- File uploads (like plate images) are stored locally using Multer in the backend `uploads/` directory.

## Getting Started
1. **Database**: Run `docker compose up -d` in the root directory.
2. **Backend**: `cd backend && npm install && npm run dev` (Runs on `http://localhost:54321`)
3. **Frontend**: `cd frontend && npm install && npm start` (Runs on `http://localhost:3000`)

## Test Credentials
| Role     | Email                    | Password     |
| -------- | ------------------------ | ------------ |
| Admin    | `admin@mits.ac.in`       | `admin123`   |
| Security | `security@mits.ac.in`    | `security123`|
