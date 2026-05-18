# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview
Zabbot is a language-learning platform backend (focused on African languages/Yoruba). It uses a microservices architecture with an Express API gateway (`main-server.ts` on port 3010) that spawns 7 child services via `child_process.spawn`:

| Service | Port | Path Prefix |
|---------|------|-------------|
| waiting-list-service | 3002 | `/api/v1/waiting-list` |
| notification-service | 3003 | `/api/v1/notification` |
| user-service | 3004 | `/api/v1/users` |
| lesson-service | 3005 | `/api/v1/lessons` |
| ededun-service | 3006 | `/api/v1/ededun` |
| pronunciation-feedback-service | 3007 | `/api/v1/pronunciation` |
| payment-service | 3008 | `/api/v1/payments` |

### Prerequisites
- **PostgreSQL** must be running locally with 3 databases: `founders_list_db`, `users_service_db`, `ededun_database` (user: `zabbot`, password: `zabbot_dev_pass`).
- **Node.js v22** and **npm** are required.
- A `.env.development` file must exist in the workspace root (gitignored). See `config/development.ts` for all required env var names.

### Running the dev server
```
NODE_ENV=development npx ts-node main-server.ts
```
Or via nodemon: `npm run dev` (uses `nodemon.json` config). The gateway starts all child services automatically.

### Key gotchas
1. **Compiled `.js` files alongside `.ts` files**: Many sub-services have pre-compiled `.js` files next to `.ts` source files. Node's module resolution prefers `.js` over `.ts`, so the compiled versions may be loaded instead of the TypeScript source. The compiled `googleAuth.utilities.js` reads `process.env.GOOGLE_CLIENT_ID` directly (not via config), so this env var must be set in `.env.development`.
2. **WaitingList table not auto-synced**: The `waiting_lists` table in `founders_list_db` is not created by `syncDatabases()` because the WaitingList model is loaded in the child process, not the parent. You may need to create it manually:
   ```sql
   PGPASSWORD=zabbot_dev_pass psql -h localhost -U zabbot -d founders_list_db -c "
   CREATE TABLE IF NOT EXISTS waiting_lists (
     id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
     country VARCHAR(255) NOT NULL, \"sendUpdates\" BOOLEAN NOT NULL DEFAULT false,
     \"betaTest\" BOOLEAN NOT NULL DEFAULT false, \"contributeSkills\" BOOLEAN NOT NULL DEFAULT false,
     \"createdAt\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
     \"updatedAt\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
   );"
   ```
3. **User signup requires beta-tester check**: The `/auth/signup` endpoint calls `config.LOCAL_FOUNDERS_LIST_URL` (pointing to the frontend, not the backend) to verify the user is a beta tester. Without the frontend running, user registration via email will fail. Google OAuth also requires real credentials.
4. **No automated tests exist**: There are no `.test.ts` or `.spec.ts` files in the codebase. The notification-service has Jest/ESLint config in `package.json` but no test files.
5. **No lint config at root level**: Only the notification-service has ESLint configured. TypeScript type-checking can be run with `npx tsc --noEmit` at the root.
6. **Install all dependencies**: Use `npx ts-node installAll.ts` (or `npm run install:all`) to install deps for root + all sub-services.
7. **Health check**: `GET http://localhost:3010/health` returns JSON with all service statuses.
8. **External services with placeholders**: Cloudinary, SendGrid, Mailchimp, OpenAI, Stripe, and PayPal all use placeholder keys in `.env.development`. Features depending on these (media upload, email sending, payments, pronunciation feedback) will fail gracefully.
