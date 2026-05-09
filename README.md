# zabbot-backend

## Backend Recovery / Deployment

### Symptom this runbook addresses

If login fails with errors similar to:

- `Error fetching user, please try again`
- `Fetch User Error: relation "users" does not exist`
- `POST /auth/login 500`

then your users database is reachable but missing the required auth tables (`users`, `otps`) or the app is pointed at the wrong database.

### 1) Install dependencies

At repo root:

```bash
npm install
npm run install:all
```

### 2) Build and start backend

At repo root:

```bash
npm run buildAll
MAIN_PORT=3010 npm start
```

### 3) Initialize auth tables safely (non-destructive)

This project now includes an idempotent DB initialization command that creates only missing auth tables used by login:

- `users`
- `otps`

Run at repo root:

```bash
NODE_ENV=production npm run db:init
```

If you deploy only the user service:

```bash
cd user-service
npm run db:init
```

Notes:

- This does **not** drop tables.
- This does **not** delete data.
- If your production DB should already contain user data, verify that your DB URL points to the intended database before initializing.

### 4) DigitalOcean App Platform settings

#### If deploying the full backend gateway (repo root app)

- **Build Command**
  ```bash
  npm run install:all && npm run buildAll
  ```
- **Run Command**
  ```bash
  MAIN_PORT=$PORT npm start
  ```

#### If deploying a single service app (example: `user-service`)

- **Source Directory:** `user-service`
- **Build Command**
  ```bash
  npm install && npm run build
  ```
- **Run Command**
  ```bash
  npm start
  ```

### 5) Required environment variables

Use `.env.example` as the template. At minimum for login and user auth:

- `NODE_ENV=production`
- `USERS_SERVICE_PRODUCTION_DB`
- `APP_JWT_SECRET`
- `USERS_PORT` (or `MAIN_PORT` for gateway)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ZABBOT_GOOGLE_LOGIN_CALLBACK_URL`
- `ZABBOT_GOOGLE_REGISTER_CALLBACK_URL`

For gateway mode you must also provide other service DB/port variables in `.env.example`.

### 6) Verify login is healthy

After deploy:

1. Ensure auth tables exist in the users DB:
   ```sql
   SELECT tablename
   FROM pg_catalog.pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('users', 'otps');
   ```
2. Exercise login endpoint:
   - Gateway route: `POST /api/v1/users/auth/login`
   - Service route: `POST /auth/login`
3. Expected behavior:
   - `200` for valid credentials
   - `401/403/404` for invalid/unverified users
   - No `relation "users" does not exist` errors in logs