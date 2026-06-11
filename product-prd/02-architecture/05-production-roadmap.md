# Production Roadmap: Local → Cloud

Every local component was designed to be swappable. This document maps each local setup to its production equivalent.

---

## Infrastructure Overview

```
LOCAL                              PRODUCTION
─────                              ──────────

PostgreSQL (brew)          →       AWS RDS / Supabase / Cloud SQL
Local disk uploads         →       AWS S3 + CloudFront CDN
Console OTP logging        →       Twilio / MSG91 SMS
NestJS cron (@schedule)    →       AWS CloudWatch Events / Cloud Tasks
Socket.IO (single server)  →       Socket.IO + Redis Adapter (multi-node)
localhost:3000             →       AWS ECS/EKS or Railway/Render
.env file                  →       AWS Secrets Manager / SSM Parameter Store
No rate limiting           →       @nestjs/throttler + Redis
synchronize: true          →       TypeORM migrations
No monitoring              →       Datadog / Sentry / CloudWatch
```

---

## 1. Database: PostgreSQL → Managed PostgreSQL

### Local
- PostgreSQL 17 via Homebrew
- `localhost:5432`, database `host_a_party`
- `synchronize: true` for auto-schema

### Production Options

| Option | Pros | Cost |
|--------|------|------|
| **Supabase** (Recommended) | Free tier, built-in auth, real-time, PostGIS | Free → $25/mo |
| AWS RDS | Battle-tested, auto-backup, multi-AZ | ~$30/mo (db.t4g.micro) |
| Google Cloud SQL | Good if using GCP | ~$30/mo |
| Neon | Serverless, branching, generous free tier | Free → $19/mo |

### Migration Steps
1. Disable `synchronize: true` in production
2. Generate TypeORM migration: `npx typeorm migration:generate -d src/data-source.ts`
3. Run migrations on deploy: `npx typeorm migration:run`
4. Update `.env` with cloud DB connection string
5. Enable SSL: `ssl: { rejectUnauthorized: false }` in TypeORM config

### Environment Change
```env
# Local
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=party_admin
DB_PASSWORD=party@2026
DB_NAME=host_a_party

# Production (Supabase example)
DB_HOST=db.xxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<secure-password>
DB_NAME=postgres
DB_SSL=true
```

---

## 2. File Storage: Local Disk → S3 + CDN

### Local
- Files saved to `./uploads/<folder>/`
- Served via NestJS `ServeStaticModule` at `/uploads/*`
- Storage provider: `LocalStorageProvider`

### Production
- Create an `S3StorageProvider` implementing `StorageProvider` interface
- CloudFront CDN in front of S3 for fast global delivery

### Migration Steps
1. Create `src/uploads/s3-storage.provider.ts`:

```typescript
@Injectable()
export class S3StorageProvider implements StorageProvider {
  private s3: S3Client;
  
  async upload(file, folder) {
    // PutObject to S3 bucket
    return `https://cdn.hostaparty.com/${folder}/${filename}`;
  }
  
  async delete(fileUrl) {
    // DeleteObject from S3
  }
}
```

2. Swap in `UploadsModule`:
```typescript
{
  provide: STORAGE_PROVIDER,
  useClass: S3StorageProvider,  // was: LocalStorageProvider
}
```

3. Remove `ServeStaticModule` from `AppModule` (CDN serves files now)

### Environment Addition
```env
AWS_S3_BUCKET=host-a-party-uploads
AWS_S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
UPLOAD_BASE_URL=https://cdn.hostaparty.com
```

---

## 3. SMS/OTP: Console Log → SMS Provider

### Local
- OTP printed to server console: `[DEV] OTP for +91...: 123456`
- In-memory OTP store (`Map`)

### Production Options

| Provider | Coverage | Cost |
|----------|----------|------|
| **Twilio** | Global | ~$0.05/SMS |
| **MSG91** | India-focused | ~₹0.20/SMS |
| **AWS SNS** | Global | ~$0.02/SMS |

### Migration Steps
1. Install Twilio SDK: `npm install twilio`
2. Update `AuthService.sendOtp()`:

```typescript
// Replace console.log with:
await this.twilioClient.messages.create({
  body: `Your Host a Party code is: ${otp}`,
  from: process.env.TWILIO_PHONE,
  to: phone,
});
```

3. Replace in-memory OTP store with Redis:
```typescript
// Store: await redis.set(`otp:${phone}`, otp, 'EX', 300);
// Verify: const stored = await redis.get(`otp:${phone}`);
```

### Environment Addition
```env
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE=+1234567890
REDIS_URL=redis://localhost:6379  # or ElastiCache URL
```

---

## 4. Task Scheduling: Local Cron → Cloud Scheduler

### Local
- `@nestjs/schedule` with `@Cron()` decorators
- Runs every minute (event status) and every 30 min (reminders)
- Single-process: runs in the same Node.js instance

### Production Options

| Option | Best For |
|--------|----------|
| **Keep @nestjs/schedule** | Single-instance deployments (simplest) |
| AWS CloudWatch Events + Lambda | Serverless, decoupled |
| Bull/BullMQ + Redis | Job queues with retry, delay, priority |
| Google Cloud Tasks | GCP environments |

### Recommendation for MVP
Keep `@nestjs/schedule` for now. It works fine with a single server instance. Only migrate to a queue system (Bull + Redis) when you need:
- Multiple server instances (horizontal scaling)
- Retry logic for failed jobs
- Job priority and delayed execution

### If Migrating to Bull
```bash
npm install @nestjs/bull bull
```
```typescript
// Replace @Cron with @Process in a BullMQ processor
@Processor('events')
export class EventProcessor {
  @Process('check-status')
  async handleStatusCheck(job: Job) { ... }
}
```

---

## 5. Real-time: Socket.IO → Socket.IO + Redis Adapter

### Local
- Socket.IO on same NestJS server
- In-memory socket tracking (`Map<userId, Set<socketId>>`)
- Single server handles all connections

### Production (Multi-Instance)
When running multiple server instances behind a load balancer, Socket.IO needs a shared pub/sub layer.

### Migration Steps
```bash
npm install @socket.io/redis-adapter redis
```

```typescript
// In GatewayModule or main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

### Environment Addition
```env
REDIS_URL=redis://your-elasticache-endpoint:6379
```

---

## 6. Hosting: localhost → Cloud

### Options

| Option | Type | Cost | Best For |
|--------|------|------|----------|
| **Railway** | PaaS | $5/mo + usage | Fastest MVP deploy |
| **Render** | PaaS | Free → $7/mo | Simple auto-deploy |
| AWS ECS (Fargate) | Container | ~$30/mo | Production scale |
| AWS EKS | Kubernetes | ~$75/mo | Enterprise scale |
| DigitalOcean App Platform | PaaS | $5/mo | Budget-friendly |

### Recommended MVP Path: Railway or Render

```bash
# Railway
railway init
railway add --database postgres
railway up

# Render
# Connect GitHub repo → Auto-deploy on push
# Add PostgreSQL addon
```

### Docker Setup (for any cloud)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
CMD ["node", "dist/main.js"]
EXPOSE 3000
```

---

## 7. Security Hardening

| Item | Local | Production |
|------|-------|------------|
| JWT Secret | Hardcoded in `.env` | AWS Secrets Manager / env var injection |
| Rate Limiting | None | `@nestjs/throttler` (10 OTP req/min, 100 API req/min) |
| CORS | `origin: '*'` | Restrict to app domain |
| HTTPS | No | Yes (via load balancer / Cloudflare) |
| Helmet | Not installed | `npm install helmet` for security headers |
| DB SSL | No | `ssl: { rejectUnauthorized: false }` |
| synchronize | true | **false** (use migrations) |

### Rate Limiting Setup
```bash
npm install @nestjs/throttler
```
```typescript
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])
```

---

## 8. Monitoring & Observability

| Concern | Tool | Notes |
|---------|------|-------|
| Error tracking | **Sentry** | `npm install @sentry/nestjs` |
| APM / Metrics | **Datadog** or **New Relic** | Response times, DB queries |
| Logs | **CloudWatch** or **Logtail** | Structured JSON logs |
| Uptime | **Better Stack** or **Pingdom** | Health check endpoint |
| DB monitoring | **Supabase Dashboard** or **pganalyze** | Slow queries, connections |

### Health Check Endpoint (add to production)
```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

## 9. Push Notifications: In-App → FCM/APNS

### Local
- Notifications stored in DB + delivered via WebSocket
- No push when app is closed

### Production
- **Firebase Cloud Messaging (FCM)** for Android + iOS
- Triggered alongside WebSocket emit in `NotificationsService.create()`

### Migration Steps
```bash
npm install firebase-admin
```
```typescript
// In NotificationsService.create(), after DB save:
if (user.fcmToken) {
  await admin.messaging().send({
    token: user.fcmToken,
    notification: { title, body },
    data: metadata,
  });
}
```

Add `fcmToken` column to `users` table for device token storage.

---

## Production Launch Checklist

- [ ] Migrate to managed PostgreSQL (Supabase / RDS)
- [ ] Set up S3 + CloudFront for file uploads
- [ ] Integrate Twilio / MSG91 for OTP SMS
- [ ] Move OTP store from in-memory to Redis
- [ ] Set `synchronize: false`, create TypeORM migrations
- [ ] Add rate limiting with `@nestjs/throttler`
- [ ] Restrict CORS to app domain
- [ ] Set strong JWT secret in Secrets Manager
- [ ] Add Helmet for security headers
- [ ] Enable HTTPS via load balancer
- [ ] Set up Sentry for error tracking
- [ ] Add health check endpoint
- [ ] Dockerize the application
- [ ] Deploy to Railway / Render / ECS
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Integrate FCM for push notifications
- [ ] Set up Redis for Socket.IO adapter (if multi-instance)
- [ ] Add database backups (automated daily)
- [ ] Set up monitoring and alerting
