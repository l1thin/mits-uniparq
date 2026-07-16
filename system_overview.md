# UniParQ — System Overview

## Project Summary

UniParQ is a **smart parking management system** built for the MITS campus. It enables authorized security personnel to scan or manually enter vehicle number plates, retrieve registered owner details securely, and contact them to resolve obstructive parking issues — all while preserving data privacy through a secure lookup abstraction layer.

---

## Tech Stack

| Layer              | Technology                                    |
| ------------------ | --------------------------------------------- |
| Frontend           | React 19 (Create React App)                   |
| Routing            | react-router-dom v7                           |
| Backend            | Node.js + Express (JavaScript/ES6)            |
| Database           | PostgreSQL 17 (self-hosted via Docker)         |
| Authentication     | bcryptjs (hashing) + jsonwebtoken (JWT)        |
| File Uploads       | Multer (local disk storage)                    |
| HTTP Client        | Fetch API (custom API client)                  |
| Containerization   | Docker Compose                                 |

---

## Directory Structure

```
mits-uniparq/
├── README.md
├── system_overview.md
├── docker-compose.yml                  # PostgreSQL 17 container
│
├── frontend/                           # React SPA
│   ├── .env                            # REACT_APP_API_URL=http://localhost:54321
│   ├── package.json
│   ├── public/                         # Static assets (logos, favicon, index.html)
│   └── src/
│       ├── index.js                    # Entry point — renders <App />
│       ├── App.js                      # Router: all route definitions
│       ├── supabaseClient.js           # Custom API client (mimics Supabase interface)
│       ├── pages/
│       │   ├── Login.jsx               # Authentication page
│       │   ├── Dashboard.jsx           # Security personnel workspace
│       │   └── AdminPanel.jsx          # Vehicle registration (admin)
│       └── components/
│           ├── ProtectedRoute.jsx      # Auth + role guard
│           ├── Navbar.jsx              # Top navigation bar
│           ├── ClearwayApp.jsx         # Alternative dark-theme UI (prototype)
│           ├── ScannerOverlay.jsx      # Animated scanner overlay
│           ├── ManualInput.jsx         # Bottom-sheet manual plate input
│           └── ResultModal.jsx         # Vehicle result display modal
│
└── backend/                            # Node.js Express server
    ├── .env                            # PORT, DATABASE_URL, JWT_SECRET
    ├── server.js                       # Express app entry point
    ├── seed.js                         # Standalone seed script (bcrypt hashes)
    ├── migration.sql                   # Database schema DDL
    ├── seed.sql                        # Initial data (used by Docker)
    ├── config/
    │   └── db.js                       # PostgreSQL connection pool
    ├── middleware/
    │   └── auth.js                     # JWT verification middleware
    ├── routes/
    │   ├── auth.js                     # POST /auth/v1/token, GET /auth/v1/session
    │   ├── vehicles.js                 # GET/POST /rest/v1/profiles, /rest/v1/rpc/*, /rest/v1/vehicles
    │   └── functions.js                # POST /functions/scan-plate, /storage/*
    └── uploads/                        # Local file storage for plate images
```

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER (React SPA)                      │
│                                                                  │
│  ┌──────────┐   ┌────────────┐   ┌────────────┐   ┌──────────┐ │
│  │  Login   │──▶│ Dashboard  │   │   Admin    │   │ Clearway │ │
│  │  Page    │   │ (Security) │   │   Panel    │   │   (UI)   │ │
│  └────┬─────┘   └─────┬──────┘   └─────┬──────┘   └──────────┘ │
│       │               │                │                         │
│  ┌────▼───────────────▼────────────────▼──────┐                  │
│  │        Custom API Client (fetch)            │                  │
│  │   supabaseClient.js — mimics Supabase SDK  │                  │
│  └────────────────────┬────────────────────────┘                  │
└───────────────────────┼──────────────────────────────────────────┘
                        │ HTTP (localhost:54321)
┌───────────────────────▼──────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND                               │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  /auth/v1/* │  │ /rest/v1/*   │  │  /functions/*         │   │
│  │  (auth.js)  │  │ (vehicles.js)│  │  (functions.js)       │   │
│  │             │  │              │  │                        │   │
│  │  POST token │  │ GET profiles │  │  POST scan-plate (mock)│   │
│  │  GET session│  │ POST rpc/*   │  │  POST storage/upload   │   │
│  │             │  │ POST vehicles│  │  GET storage/public-url│   │
│  └──────┬──────┘  └──────┬───────┘  └───────────────────────┘   │
│         │                │                                        │
│  ┌──────▼────────────────▼──────────────────────────────────┐    │
│  │                    middleware/auth.js                      │    │
│  │              (JWT verification on protected routes)        │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                        │
│  ┌───────────────────────▼──────────────────────────────────┐    │
│  │              config/db.js (pg Pool)                       │    │
│  └───────────────────────┬──────────────────────────────────┘    │
└──────────────────────────┼───────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   PostgreSQL 17          │
              │   (Docker container)     │
              │   Port: 54322            │
              │                          │
              │   Tables:                │
              │   - profiles             │
              │   - vehicles             │
              └──────────────────────────┘
```

---

## Database Schema

### Table: `profiles`

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('security', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `vehicles`

```sql
CREATE TABLE vehicles (
    plate TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Migration file:** `backend/migration.sql` (auto-applied by Docker on first run)

---

## Authentication Flow

```
User visits /
     │
     ▼
┌─────────────────────────┐
│  Login Page             │
│  - Enter email/password │
│  - Select role (dropdown│
│   : "security" / "admin")│
└────────┬────────────────┘
         │
         ▼
  POST /auth/v1/token { email, password }
         │
         ▼
  Express: bcrypt.compare → JWT sign (sub, email, role)
         │
         ├──▶ Success ──▶ { access_token, user.id }
         │                     │
         │                     ▼
         │        GET /rest/v1/profiles?id=eq.{userId}&select=role
         │                     │
         │              ┌──────┴──────┐
         │              │  Match?     │
         │         Yes  │             │  No
         │              ▼             ▼
         │     ┌──────────────┐  Error: "Incorrect role selected"
         │     │ Redirect:    │
         │     │ admin → /admin
         │     │ security → /dashboard
         │     └──────────────┘
         │
         ▼
    Show error message
```

### Route Protection (`ProtectedRoute.jsx`)

Every protected route is wrapped in a `ProtectedRoute` component that:

1. Calls `supabase.auth.getSession()` → `GET /auth/v1/session` (validates JWT)
2. Fetches the user's role → `GET /rest/v1/profiles?id=eq.{userId}&select=role`
3. Compares the fetched role against the required `role` prop
4. If valid → renders the child component
5. If invalid or no session → redirects to `/`

**Protected routes:**
| Route       | Required Role |
| ----------- | ------------- |
| `/dashboard`| `security`    |
| `/admin`    | `admin`       |

### Logout (`Navbar.jsx`)

- Clears `access_token` and `role` from `localStorage`
- Redirects to `/`

---

## Backend API Endpoints

The Express backend exposes Supabase-compatible endpoints so the frontend API client works seamlessly.

### Auth (no auth required)

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| POST   | `/auth/v1/token`             | Email/password login → JWT      |
| GET    | `/auth/v1/session`           | Validate JWT → session data     |

### Data (auth required — JWT middleware)

| Method | Endpoint                              | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| GET    | `/rest/v1/profiles?id=eq.{id}`       | Fetch user profile by ID             |
| POST   | `/rest/v1/rpc/secure_lookup`         | Look up vehicle by plate number      |
| POST   | `/rest/v1/vehicles`                  | Insert/update a vehicle record       |
| GET    | `/rest/v1/vehicles`                  | List all vehicles                    |

### Functions & Storage

| Method | Endpoint                     | Auth    | Description                        |
| ------ | ---------------------------- | ------- | ---------------------------------- |
| POST   | `/functions/scan-plate`      | Yes     | Mock OCR — returns static plate    |
| POST   | `/storage/upload`            | Yes     | Upload file to local disk          |
| GET    | `/storage/public-url`        | No      | Get public URL for uploaded file   |

---

## API Client (`frontend/src/supabaseClient.js`)

A custom API client that **replaces** the `@supabase/supabase-js` library. It exposes the same method signatures the frontend components expect, but sends requests to the local Express backend instead of the Supabase platform.

### Methods

| Client Call                                          | Backend Endpoint                              |
| --------------------------------------------------- | --------------------------------------------- |
| `supabase.auth.signInWithPassword({email, password})`| `POST /auth/v1/token`                         |
| `supabase.auth.getSession()`                        | `GET /auth/v1/session`                        |
| `supabase.from("profiles").select("role").eq(...)`  | `GET /rest/v1/profiles?id=eq.{userId}&select=role` |
| `supabase.rpc("secure_lookup", {input_plate})`      | `POST /rest/v1/rpc/secure_lookup`             |
| `supabase.from("vehicles").insert({...})`           | `POST /rest/v1/vehicles`                      |
| `supabase.storage.from("bucket").upload(path, file)`| `POST /storage/upload`                        |
| `supabase.storage.from("bucket").getPublicUrl(path)`| `GET /storage/public-url`                     |

**Token management:** JWT is stored in `localStorage` under key `access_token`.

---

## Pages and Routes

### `/ ` — Login Page

**File:** `frontend/src/pages/Login.jsx`

Authentication entry point. Renders a red-gradient card with:
- Email and password inputs
- Role selection dropdown (`Security Personnel` / `Administrator`)
- Sign In button

**Test credentials:**
| Email                    | Password     | Role     |
| ------------------------ | ------------ | -------- |
| `admin@mits.ac.in`       | `admin123`   | admin    |
| `security@mits.ac.in`    | `security123`| security |

---

### `/dashboard` — Security Dashboard

**File:** `frontend/src/pages/Dashboard.jsx`
**Guard:** `ProtectedRoute role="security"`

The primary workspace for security personnel. Provides two methods to identify a vehicle:

#### Camera Capture Flow
1. Click "Take Photo" — activates rear-facing camera via `getUserMedia()`
2. Aim at license plate — live video preview displayed
3. Click "Capture Image" — freezes frame, captures to canvas
4. Click "Scan Number Plate":
   - Uploads image to local backend storage (`POST /storage/upload`)
   - Calls mock scan-plate endpoint (`POST /functions/scan-plate`)
   - Returns a static plate number (`KL07CD1234`)
   - Plate number populated in the input field

#### Manual Entry Flow
1. Type plate number directly (auto-uppercased)
2. Click "Search Vehicle"

#### Lookup
- Calls `supabase.rpc("secure_lookup", { input_plate })` → `POST /rest/v1/rpc/secure_lookup`
- Displays results: **Owner Name**, **Department**, **Phone**

---

### `/admin` — Admin Panel

**File:** `frontend/src/pages/AdminPanel.jsx`
**Guard:** `ProtectedRoute role="admin"`

Vehicle registration form for administrators. **Now fully connected to the database.**

**Fields:**
| Field              | Required | Notes                        |
| ------------------ | -------- | ---------------------------- |
| Owner Name         | Yes      |                              |
| Department         | Yes      |                              |
| Contact Number     | No       |                              |
| Vehicle Plate No.  | Yes      | Auto-uppercased on input     |

On submit, calls `supabase.from("vehicles").insert({...})` → `POST /rest/v1/vehicles`.

---

### `/clearway` — Clearway UI (Alternative Prototype)

**File:** `frontend/src/components/ClearwayApp.jsx`
**Guard:** None (publicly accessible)

A separate dark-themed glassmorphism UI using **mock data only**. Does not connect to the backend.

---

## Data Flow Diagrams

### Security Personnel — Full Scan Flow

```
Security User
     │
     ├─ 1. Login (email + password + "security" role)
     │        │
     │        ▼
     │   POST /auth/v1/token ──▶ JWT + profiles.role check ──▶ /dashboard
     │
     ├─ 2. Capture photo (rear camera)
     │        │
     │        ▼
     │   canvas.toBlob() ──▶ POST /storage/upload (local disk)
     │        │
     │        ▼
     │   Public URL generated
     │
     ├─ 3. Scan plate
     │        │
     │        ▼
     │   POST /functions/scan-plate { imageUrl }
     │        │
     │        └─▶ Mock OCR ──▶ Returns static plate "KL07CD1234"
     │
     └─ 4. Search vehicle
              │
              ▼
         POST /rest/v1/rpc/secure_lookup { input_plate }
              │
              ▼
         PostgreSQL: SELECT FROM vehicles WHERE plate = $1
              │
              ▼
         Owner Name + Department + Phone displayed
```

### Admin — Vehicle Registration Flow

```
Admin User
     │
     ├─ 1. Login (email + password + "admin" role)
     │        │
     │        ▼
     │   POST /auth/v1/token ──▶ JWT + profiles.role check ──▶ /admin
     │
     └─ 2. Register vehicle
              │
              ▼
         Fill form (name, dept, contact, plate)
              │
              ▼
         POST /rest/v1/vehicles { plate, full_name, department, phone }
              │
              ▼
         PostgreSQL: INSERT INTO vehicles ... ON CONFLICT DO UPDATE
              │
              ▼
         "Vehicle added successfully"
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Value                                    |
| --------------- | ---------------------------------------- |
| `PORT`          | `54321`                                  |
| `DATABASE_URL`  | `postgresql://postgres:local_secure_password@localhost:54322/mits-uniparq` |
| `JWT_SECRET`    | `uniparq_super_secure_local_jwt_secret_2025` |

### Frontend (`frontend/.env`)

| Variable             | Value                        |
| -------------------- | ---------------------------- |
| `REACT_APP_API_URL`  | `http://localhost:54321`     |

---

## Docker Compose

**File:** `docker-compose.yml` (root)

```yaml
services:
  postgres_db:
    image: postgres:17
    container_name: uniparq_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: local_secure_password
      POSTGRES_DB: mits-uniparq
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migration.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
```

On first run, Docker automatically applies `migration.sql` (schema) and `seed.sql` (test data).

---

## Getting Started

### 1. Start the database

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 3. Seed the database (if not using Docker auto-seed)

```bash
npm run seed
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm start
```

### 5. Open the app

Navigate to `http://localhost:3000` and log in with the test credentials.

---

## Known Issues and Limitations

1. **Mock OCR** — The `scan-plate` endpoint returns a static plate number (`KL07CD1234`). A real ML model endpoint must be integrated for production use.

2. **No phone number privacy on Dashboard** — The Clearway prototype masks phone numbers, but the actual Dashboard shows the full number from `secure_lookup`.

3. **Legacy login file is orphaned** — `frontend/pages/Login.jsx` is a pre-existing file that calls `localhost:5000`. It is not imported or used.

4. **Broken test** — `App.test.js` still asserts "learn react" text which no longer exists in the UI.

5. **Dual UI designs** — The project contains two separate UI implementations: the primary React Router-based theme and the Clearway dark glassmorphism prototype at `/clearway`.

---

## User Roles

| Role     | Access              | Capabilities                                         |
| -------- | ------------------- | ---------------------------------------------------- |
| Security | `/dashboard`        | Capture/scan plate images, search vehicle database   |
| Admin    | `/admin`            | Register new vehicles (writes to PostgreSQL)         |
| None     | `/`, `/clearway`    | Login page, Clearway prototype (mock data)           |
