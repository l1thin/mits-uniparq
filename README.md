# UniParQ

MITS Smart Parking Management System — a web-based solution designed to address obstructive parking issues on campus by enabling authorized security personnel to scan or enter vehicle number plates, retrieve owner details securely, and notify them efficiently while ensuring data privacy.

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Frontend    | React 19 (Create React App)               |
| Backend     | Node.js + Express                         |
| Database    | PostgreSQL 17 (self-hosted via Docker)    |
| Auth        | bcryptjs + jsonwebtoken (JWT)             |
| File Upload | Multer (local disk)                       |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

## Project Structure

```
mits-uniparq/
├── docker-compose.yml          # PostgreSQL container
├── README.md
├── system_overview.md          # Detailed architecture documentation
├── frontend/                   # React SPA
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── App.js              # Routes
│       ├── supabaseClient.js   # API client
│       ├── pages/              # Login, Dashboard, AdminPanel
│       └── components/         # ProtectedRoute, Navbar, ClearwayApp
└── backend/                    # Express server
    ├── .env
    ├── server.js
    ├── seed.js
    ├── migration.sql
    ├── seed.sql
    ├── config/db.js
    ├── middleware/auth.js
    └── routes/
        ├── auth.js
        ├── vehicles.js
        └── functions.js
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/l1thin/mits-uniparq.git
cd mits-uniparq
```

### 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 17 on port **54322** and automatically runs the schema migration and seed data on first startup.

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The Express server runs on `http://localhost:54321`. Nodemon auto-restarts on file changes.

### 4. Seed the database (if needed)

If you didn't use Docker auto-seed (e.g. you already had a PostgreSQL instance running), run:

```bash
cd backend
npm run seed
```

### 5. Start the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The React dev server runs on `http://localhost:3000`.

### 6. Open the app

Navigate to `http://localhost:3000` in your browser.

## Test Credentials

| Email                    | Password     | Role     |
| ------------------------ | ------------ | -------- |
| `admin@mits.ac.in`       | `admin123`   | Admin    |
| `security@mits.ac.in`    | `security123`| Security |

## Routes

| Route        | Role     | Description                          |
| ------------ | -------- | ------------------------------------ |
| `/`          | Public   | Login page                           |
| `/dashboard` | Security | Camera scan, plate lookup            |
| `/admin`     | Admin    | Register new vehicles                |
| `/clearway`  | Public   | Alternative dark-theme UI (mock data)|

## Pushing to GitHub

Make sure you have the latest changes committed, then push to the `main` branch:

```bash
# Switch to main and merge current work
git checkout main
git merge supabase

# Push to GitHub
git push origin main
```

To push a different branch:

```bash
git push origin supabase
```

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                          | Default                                    |
| --------------- | ------------------------------------ | ------------------------------------------ |
| `PORT`          | Server port                          | `54321`                                    |
| `DATABASE_URL`  | PostgreSQL connection string         | `postgresql://postgres:local_secure_password@localhost:54322/mits-uniparq` |
| `JWT_SECRET`    | Secret for signing JWTs              | `uniparq_super_secure_local_jwt_secret_2025` |

### Frontend (`frontend/.env`)

| Variable           | Description               | Default               |
| ------------------ | ------------------------- | --------------------- |
| `REACT_APP_API_URL`| Backend server URL        | `http://localhost:54321` |

## Collaborators

- Mushab Mahin
- Abhijith PM
- Adarsh M Nair
- Lithin Jose
- Anirudh RV

## License

This project is for educational purposes at MITS.
