# Weeja

Weeja is a pool system demo app for creating, reviewing, joining, and settling wager-style pools. It has a React frontend for users and admins, plus an Express backend that handles authentication, wallets, pool entries, admin review, and pool settlement.

## What The Demo Shows

- User signup, email verification, login, and profile management.
- Public pool browsing with category filters for sports and events.
- Authenticated pool joining with wallet balance checks.
- User-submitted pool creation through the account area.
- Admin dashboard for pool management, categories, pool submissions, approvals, rejection, locking, results, settlement, and cancellation.
- Super-admin passkey management for admin registration.
- Wallet and transaction views for supported currencies.
- Background polling that advances ended pools every minute.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, React Icons.
- Backend: Node.js, Express, JWT auth, bcryptjs, Nodemailer.
- Database access: `diamond-sql` connected through DBMS environment variables.
- Database schema: `backend/sql/pool_system.sql` with an additional OTP-to-verification-link migration.

## Project Structure

```text
.
├── backend/        Express API, routes, DB config, scripts, SQL files
├── frontend/       React/Vite web app
├── weeja/          Static HTML demo/mockup screens
└── README.md
```

## Requirements

- Node.js 18 or newer.
- npm.
- Access to the configured DBMS project.
- SMTP credentials if you want verification emails to send during the demo.

## Environment Setup

Create `backend/.env` from `backend/.env.example` and set the values for your environment:

```env
PORT=5000
SITE_ID=your-site-id
API_KEY=your-dbms-api-key
DBMS_URL=your-dbms-url
JWT_SECRET=replace-with-a-strong-secret

SMTP_HOST=your-smtp-host
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM=your-from-email

FRONTEND_URL=http://localhost:5173
SUPER_ADMIN_NAME=superadmin
SUPER_ADMIN_EMAIL=superadmin@weeja.com
SUPER_ADMIN_PASSWORD=123456
```

For the frontend, create `frontend/.env` only if the API is not running at the default local URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Database

The main schema and seed data are in:

```text
backend/sql/pool_system.sql
```

There is also a newer local dump, when present, at:

```text
backend/migration/pool_system.sql
```

Additional migration:

```text
backend/sql/migrations/2026_05_05_replace_otp_with_verification_links.sql
```

The migration updates the backend auth flow from OTP columns to verification-link columns:

- Adds `verification_token_hash`.
- Adds `verification_expires_at`.
- Clears old verification token data.
- Drops `otp_hash` and `otp_expires_at`.

After the database is available and `backend/.env` is configured, create or update the demo super admin:

```bash
cd backend
npm run seed:super-admin
```

If existing verified users need wallets created for each active currency, run:

```bash
npm run backfill:wallets
```

## Run The App

Start the backend API:

```bash
cd backend
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

## Demo Flow

1. Open `http://localhost:5173`.
2. Browse active pools from the home page.
3. Sign up as a user and verify the email through the generated verification link.
4. Log in and open `/account` to view account tools and submit a pool.
5. Open `/wallet` to review wallets and transactions.
6. Log in as the super admin at `/admin/login`.
7. Review submitted pools at `/admin/pools/submissions`.
8. Approve a submitted pool, manage pool options, lock the pool, set a result, and settle it.
9. Check `/results` to view completed pool outcomes.

## Demo Logins

The SQL seed files include these verified demo accounts. The password hash for each listed account was checked against the plaintext password shown here.

| Role | Name | Email / Username | Password | Seed source |
| --- | --- | --- | --- | --- |
| Super admin | Super Admin | `admin@weeja.com` | `123456` | Both seed files |
| User | Samuel Oghenchovwe | `8amlight@gmail.com` | `123456` | `backend/sql/pool_system.sql` |
| User | Samuel Oghenchovwe | `8am@gmail.com` | `123456` | `backend/migration/pool_system.sql` |
| User | one | `one@gmail.com` | `123456` | Both seed files |
| User | two | `two@gmail.com` | `123456` | Both seed files |
| User | three | `three@gmail.com` | `123456` | Both seed files |
| User | four | `four@gmail.com` | `123456` | Both seed files |
| User | five | `five@gmail.com` | `123456` | Both seed files |
| User | sam | `8amjoker@gmail.com` | `123456` | `backend/migration/pool_system.sql` |
| User | sam | `8amlight@gmail.com` | `123456` | `backend/migration/pool_system.sql` |

The seeded admin registration passkey is:

```text
Passkey: 123456
Label: admin upboarding
```

The `npm run seed:super-admin` script can also create or update a local super admin from environment variables. If `SUPER_ADMIN_*` values are not set, it uses:

```text
Email: superadmin@weeja.com
Password: 123456
```

## Main Pages

- `/` - Public pool list and join flow.
- `/results` - Pool results.
- `/login` - User login.
- `/signup` - User registration.
- `/verify-email` - Email verification callback screen.
- `/account` - Authenticated user dashboard and pool submission area.
- `/wallet` - Authenticated wallet dashboard.
- `/admin/login` - Admin login.
- `/admin/register` - Admin registration using a passkey.
- `/admin/dashboard` - Admin overview.
- `/admin/pools` - Admin pool management.
- `/admin/pools/create` - Admin-created pool flow.
- `/admin/pools/submissions` - User-submitted pool review queue.
- `/admin/passkeys` - Super-admin passkey management.

## API Overview

Backend health and status:

- `GET /` - API status message.
- `GET /health/dbms` - DBMS connectivity check.

Main API groups:

- `/api/auth` - Register, login, email verification, resend verification, current user.
- `/api/users` - User profile endpoints.
- `/api/wallet` - Wallet balances and transactions.
- `/api/payments` - Payment placeholder routes.
- `/api/pools` - Public pools, pool detail, totals, and join endpoint.
- `/api/categories` - Public active categories.
- `/api/votes` - Vote placeholder routes.
- `/api/withdrawals` - Withdrawal placeholder routes.
- `/api/user-pools` - Authenticated user-submitted pools.
- `/api/admin/categories` - Admin category CRUD.
- `/api/admin/pools` - Admin pool CRUD, options, lock, result, settlement, cancellation.
- `/api/admin/pool-reviews` - Admin settings and review actions for submitted pools.
- `/api/super-admin` - Super-admin passkeys.

## Logs

The backend logs directly to the terminal:

- Startup: `Server running on port http://localhost:5000`.
- Background pool updates: errors are logged as `Could not advance ended pools`.
- Route errors: most route handlers log caught errors with `console.error`.
- Seed scripts log whether a super admin was created or updated.
- Wallet backfill logs the number of users processed.

The frontend logs browser-side errors in the browser dev tools console. Vite also prints local development server output in the terminal.

There is no file-based log storage configured yet. If persistent logs are needed, add a logger such as Winston or Pino and write logs to a configured log directory or external service.

For a demo, run the backend and frontend in separate terminals so the logs stay easy to read:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Useful Commands

Backend:

```bash
npm run dev
npm start
npm run seed:super-admin
npm run backfill:wallets
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The backend requires valid DBMS configuration before most endpoints can work.
- Email verification depends on SMTP settings and `FRONTEND_URL`.
- Admin routes require a JWT for a user with `admin` or `super_admin` role.
- Super-admin passkey management requires a `super_admin` user.
- Some placeholder route groups currently return basic responses and can be expanded as payment, voting, and withdrawal flows are completed.
