# System Architecture Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Mobile App** | React Native | TBD |
| **Backend Framework** | NestJS | 11.x |
| **Language** | TypeScript | 6.x |
| **ORM** | TypeORM | 1.x |
| **Database** | PostgreSQL | 17 |
| **Real-time** | Socket.IO (via @nestjs/websockets) | 4.x |
| **Auth** | JWT (via @nestjs/jwt + Passport) | - |
| **Task Scheduling** | @nestjs/schedule (cron) | 6.x |
| **API Docs** | Swagger / OpenAPI (via @nestjs/swagger) | - |
| **File Storage** | Local disk (dev) / S3 (prod) | - |
| **Validation** | class-validator + class-transformer | - |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   REST   │  │ Socket.IO│  │  Static  │              │
│  │  Client  │  │  Client  │  │  Assets  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼──────────────┼─────────────┼────────────────────┘
        │              │             │
        ▼              ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS Server (:3000)                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   API Layer                         │  │
│  │  /api/auth/*  /api/users/*  /api/events/*          │  │
│  │  /api/join-requests/*  /api/matches/*              │  │
│  │  /api/chats  /api/notifications/*                  │  │
│  │  /api/uploads/*  /api/events/:id/check-ins/*       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  WebSocket   │  │  Cron Jobs    │  │  Static File │  │
│  │  Gateway     │  │  (Scheduler)  │  │  Server      │  │
│  │  - chat msgs │  │  - event live │  │  /uploads/*  │  │
│  │  - matches   │  │  - event end  │  │              │  │
│  │  - notifs    │  │  - reminders  │  │              │  │
│  │  - typing    │  │               │  │              │  │
│  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────┴──────────────────┴──────────────────┴───────┐  │
│  │                  Service Layer                      │  │
│  │  AuthService  UsersService  EventsService          │  │
│  │  JoinRequestsService  ConnectionsService           │  │
│  │  MessagesService  NotificationsService             │  │
│  │  CheckInsService  UploadsService                   │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              TypeORM Entity Layer                   │  │
│  │  User  Event  JoinRequest  Swipe  Match            │  │
│  │  Message  Notification  CheckIn                    │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   PostgreSQL 17   │
                  │   host_a_party    │
                  │   (8 tables)      │
                  └──────────────────┘
```

---

## Module Structure

```
host-a-party/
├── src/
│   ├── main.ts                     # App bootstrap, Swagger, global pipes
│   ├── app.module.ts               # Root module (all imports)
│   ├── types.d.ts                  # Global type declarations
│   │
│   ├── entities/                   # TypeORM entities (database schema)
│   │   ├── user.entity.ts
│   │   ├── event.entity.ts
│   │   ├── join-request.entity.ts
│   │   ├── swipe.entity.ts
│   │   ├── match.entity.ts
│   │   ├── message.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── check-in.entity.ts
│   │   └── index.ts
│   │
│   ├── auth/                       # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts         # OTP generation, verification, JWT issue
│   │   ├── auth.controller.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/                      # User profile management
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── dto/
│   │
│   ├── events/                     # Event CRUD + discovery + scheduler
│   │   ├── events.module.ts
│   │   ├── events.service.ts
│   │   ├── events.controller.ts
│   │   ├── events-scheduler.service.ts  # Cron: auto live/ended + reminders
│   │   └── dto/
│   │
│   ├── join-requests/              # Join request flow
│   │   ├── join-requests.module.ts
│   │   ├── join-requests.service.ts
│   │   ├── join-requests.controller.ts
│   │   └── dto/
│   │
│   ├── connections/                # Party Mode: swipes + matches
│   │   ├── connections.module.ts
│   │   ├── connections.service.ts
│   │   ├── connections.controller.ts
│   │   └── dto/
│   │
│   ├── messages/                   # Chat between matches
│   │   ├── messages.module.ts
│   │   ├── messages.service.ts
│   │   ├── messages.controller.ts
│   │   └── dto/
│   │
│   ├── notifications/              # In-app notifications
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.controller.ts
│   │
│   ├── check-ins/                  # GPS-gated event check-in
│   │   ├── check-ins.module.ts
│   │   ├── check-ins.service.ts
│   │   ├── check-ins.controller.ts
│   │   └── dto/
│   │
│   ├── uploads/                    # File upload (pluggable storage)
│   │   ├── uploads.module.ts
│   │   ├── uploads.service.ts
│   │   ├── uploads.controller.ts
│   │   ├── storage.interface.ts    # StorageProvider interface
│   │   └── local-storage.provider.ts
│   │
│   ├── gateway/                    # WebSocket real-time
│   │   ├── gateway.module.ts
│   │   ├── app.gateway.ts
│   │   └── ws-auth.guard.ts
│   │
│   └── common/
│       └── decorators/
│           └── current-user.decorator.ts
│
├── uploads/                        # Local file storage directory
├── .env                            # Environment variables
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```
