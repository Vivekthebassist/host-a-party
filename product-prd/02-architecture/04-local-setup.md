# Local Development Setup

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v22.x | `nvm install 22` |
| npm | v10.x | Comes with Node |
| PostgreSQL | 17 | `brew install postgresql@17` |
| DBeaver | Latest | Download from dbeaver.io (optional, for DB GUI) |

---

## Step 1: PostgreSQL Setup

```bash
# Install PostgreSQL 17
brew install postgresql@17

# Start the service
brew services start postgresql@17

# Verify it's running
/opt/homebrew/opt/postgresql@17/bin/pg_isready
# → /tmp:5432 - accepting connections

# Create the database
/opt/homebrew/opt/postgresql@17/bin/createdb host_a_party

# Create a dedicated user
/opt/homebrew/opt/postgresql@17/bin/psql -d host_a_party -c "
  CREATE USER party_admin WITH PASSWORD 'party@2026';
  GRANT ALL PRIVILEGES ON DATABASE host_a_party TO party_admin;
  ALTER DATABASE host_a_party OWNER TO party_admin;
  GRANT ALL ON SCHEMA public TO party_admin;
"

# Verify connection
/opt/homebrew/opt/postgresql@17/bin/psql -U party_admin -d host_a_party -h localhost \
  -c "SELECT current_database(), current_user;"
```

### DBeaver Connection

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `host_a_party` |
| Username | `party_admin` |
| Password | `party@2026` |

---

## Step 2: Backend Setup

```bash
cd host-a-party

# Install dependencies
npm install

# Verify .env exists (should already be there)
cat .env

# Build the project
npm run build

# Start in development mode (with hot reload)
npm run start:dev

# OR start in production mode
npm run build && npm run start:prod
```

### Environment Variables (`.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=party_admin
DB_PASSWORD=party@2026
DB_NAME=host_a_party

JWT_SECRET=host-a-party-jwt-secret-change-in-production
JWT_EXPIRATION=7d
```

---

## Step 3: Verify Everything Works

```bash
# Server should be running on http://localhost:3000

# 1. Check Swagger docs
open http://localhost:3000/docs

# 2. Test auth flow
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'

# 3. Check server logs for OTP (printed to console in dev mode)
# [DEV] OTP for +919876543210: 123456

# 4. Verify OTP and get token
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456"}'

# 5. Use the returned accessToken for all subsequent requests
```

---

## Step 4: Database Tables

On first startup with `synchronize: true`, TypeORM auto-creates all 8 tables:

```
users, events, join_requests, swipes, matches,
messages, notifications, check_ins
```

Verify in DBeaver by refreshing the `host_a_party` database, or:

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -U party_admin -d host_a_party -h localhost -c "\dt"
```

---

## File Uploads (Local)

Uploaded files are stored in `./uploads/<folder>/` and served at `/uploads/<folder>/<filename>`.

```
uploads/
├── avatars/
├── events/
├── id-proofs/
└── chat/
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Start compiled build |
| `brew services start postgresql@17` | Start PostgreSQL |
| `brew services stop postgresql@17` | Stop PostgreSQL |
| `brew services restart postgresql@17` | Restart PostgreSQL |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pg_isready` shows "no response" | `brew services restart postgresql@17` |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill` |
| TypeORM sync fails | Check `.env` credentials match PostgreSQL user |
| Upload fails | Ensure `uploads/` directory exists in project root |
| WebSocket won't connect | Pass JWT in `auth.token` during handshake |
