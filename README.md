# UniParQ

MITS Smart Parking Management System — a web-based solution designed to address obstructive parking issues on campus by enabling authorized security personnel to scan or manually enter vehicle number plates, retrieve registered owner details securely, and contact them efficiently while ensuring data privacy.

## Live App

**[https://l1thin.github.io/mits-uniparq](https://l1thin.github.io/mits-uniparq)**

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | React 19 (Create React App)                     |
| Routing        | React Router v7 (HashRouter)                    |
| Database       | Supabase (PostgreSQL)                           |
| Auth           | Supabase Auth (email/password)                  |
| OCR / AI       | Plate Recognizer ALPR API (Indian plate region) |
| Edge Functions | Supabase Edge Functions (Deno)                  |
| Storage        | Supabase Storage (`plate-images` bucket)        |
| PWA            | Workbox (service workers, offline support)      |
| Deployment     | GitHub Pages                                    |

## Project Structure

```
mits-uniparq/
├── .env                            # Supabase URL + anon key
├── frontend/                       # React SPA (deployed to GitHub Pages)
│   ├── package.json
│   ├── public/                     # Static assets (logos, offline page)
│   └── src/
│       ├── App.js                  # Routes + lazy loading
│       ├── supabaseClient.js       # Supabase client (with offline toast + remember-me storage)
│       ├── index.js                # Entry point + service worker registration
│       ├── pages/
│       │   ├── Login.jsx           # Email/password login via Supabase Auth
│       │   ├── Dashboard.jsx       # Image upload, OCR scan, vehicle lookup
│       │   └── AdminPanel.jsx      # Register new vehicles
│       └── components/
│           ├── ProtectedRoute.jsx  # Session-based auth guard
│           ├── Navbar.jsx          # Top nav with auth state + logout
│           ├── ResultModal.jsx     # Vehicle info display (name, branch, phone, faculty advisor)
│           ├── ClearwayApp.jsx     # Alternative dark-theme UI (mock data)
│           ├── ScannerOverlay.jsx  # Animated scanner overlay
│           └── ManualInput.jsx     # Bottom-sheet manual plate input
└── supabase/
    ├── config.toml                 # Supabase project config
    ├── migrations/
    │   └── 20260716000000_init_schema.sql   # DB schema (profiles, vehicles, secure_lookup)
    └── functions/
        └── scan-plate/
            └── index.ts            # Edge Function: Plate Recognizer ALPR → secure_lookup RPC
```

## How It Works

### Security Personnel Flow

1. **Login** — email + password via Supabase Auth
2. **Upload** a vehicle image (or enter plate number manually)
3. **Scan** — image is uploaded to Supabase Storage, then the `scan-plate` Edge Function sends it to Plate Recognizer ALPR (optimized for Indian plates)
4. **Lookup** — the detected plate is passed to the `secure_lookup` RPC function which queries the `vehicles` table
5. **Result** — a modal displays the student name, branch, vehicle model, phone number, and faculty advisor details

### Admin Flow

1. **Login** — email + password
2. **Register vehicles** — fill in owner name, department, contact, and plate number
3. Vehicle is inserted directly into the Supabase `vehicles` table

## Database Schema

### `profiles`

| Column         | Type                     | Description                      |
| -------------- | ------------------------ | -------------------------------- |
| `id`           | UUID (PK)                | Auto-generated                   |
| `email`        | TEXT (UNIQUE)            | Login email                      |
| `password_hash`| TEXT                     | Bcrypt-hashed password           |
| `role`         | TEXT (`security`/`admin`)| User role                        |
| `created_at`   | TIMESTAMPTZ              | Auto-set on creation             |

### `vehicles`

| Column      | Type | Description                  |
| ----------- | ---- | ---------------------------- |
| `plate`     | TEXT (PK) | Vehicle registration number |
| `full_name` | TEXT | Owner name                   |
| `department`| TEXT | Department/branch            |
| `phone`     | TEXT | Contact number               |

### `secure_lookup` (RPC Function)

Takes an `input_plate` parameter and returns the matching vehicle's `full_name`, `department`, and `phone`. Used by both the Edge Function and the Dashboard search.

## Getting Started (Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/l1thin/mits-uniparq.git
cd mits-uniparq
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Start the development server

```bash
npm start
```

Opens at `http://localhost:3000`.

> **Note:** The frontend connects directly to the Supabase cloud project. No local backend or database is needed. The Supabase URL and anon key are configured in the root `.env` file.

## Deploying

### Frontend (GitHub Pages)

```bash
cd frontend
npm run deploy
```

This runs `gh-pages -d build` and deploys to `https://l1thin.github.io/mits-uniparq`.

### Edge Functions (Supabase)

```bash
npx supabase functions deploy scan-plate
```

Set the Plate Recognizer API token as a Supabase secret:

```bash
npx supabase secrets set PLATE_RECOGNIZER_TOKEN=your_token_here
```

## Pushing to GitHub

```bash
git add .
git commit -m "your message"
git push origin main
```

## Environment Variables

| Variable               | Location     | Description                          |
| ---------------------- | ------------ | ------------------------------------ |
| `SUPABASE_URL`         | Root `.env`  | Supabase project URL                 |
| `SUPABASE_ANON_KEY`    | Root `.env`  | Supabase publishable/anon key        |
| `PLATE_RECOGNIZER_TOKEN` | Supabase Dashboard (Secrets) | Plate Recognizer API token |

## Routes

| Route        | Auth Required | Description                          |
| ------------ | ------------- | ------------------------------------ |
| `/#/`        | No            | Login page                           |
| `/#/dashboard`| Yes          | Upload image, scan plate, lookup vehicle |
| `/#/admin`   | Yes           | Register new vehicles                |
| `/#/clearway`| No            | Alternative dark-theme UI (mock data)|

## Collaborators

- Mushab Mahin
- Abhijith PM
- Adarsh M Nair
- Lithin Jose
- Anirudh RV

## License

This project is for educational purposes at MITS.
