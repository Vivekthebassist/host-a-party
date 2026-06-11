# Database Schema

## Overview

**Database:** PostgreSQL 17  
**ORM:** TypeORM 1.x  
**Tables:** 8  

---

## Entity Relationship Diagram

```
┌─────────┐       ┌──────────────┐       ┌─────────┐
│  users  │──1:N──│   events     │──1:N──│ check_  │
│         │       │              │       │  ins    │
│         │──1:N──│              │       └─────────┘
│         │       └──────┬───────┘
│         │              │
│         │         1:N  │  1:N
│         │              │
│         │       ┌──────┴───────┐
│         │──1:N──│join_requests │
│         │       └──────────────┘
│         │
│         │       ┌──────────────┐       ┌──────────┐
│         │──1:N──│   swipes     │       │ matches  │
│         │       │  (event-     │──────>│ (event-  │
│         │       │   scoped)    │       │  scoped) │
│         │       └──────────────┘       └────┬─────┘
│         │                                   │
│         │       ┌──────────────┐            │ 1:N
│         │──1:N──│  messages    │<───────────┘
│         │       └──────────────┘
│         │
│         │       ┌──────────────┐
│         │──1:N──│notifications │
│         │       └──────────────┘
└─────────┘
```

---

## Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique user ID |
| fullName | VARCHAR(100) | NOT NULL | Display name |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Unique handle |
| phone | VARCHAR(15) | UNIQUE, NOT NULL, INDEXED | Phone for OTP auth |
| bio | TEXT | NULLABLE | Short bio |
| avatarUrl | VARCHAR | NULLABLE | Profile picture URL |
| idProofUrl | VARCHAR | NULLABLE | ID verification doc URL |
| isVerified | BOOLEAN | DEFAULT false | ID verification status |
| isProfileComplete | BOOLEAN | DEFAULT false | Profile setup completed |
| latitude | DECIMAL(10,7) | NULLABLE | Last known latitude |
| longitude | DECIMAL(10,7) | NULLABLE | Last known longitude |
| city | VARCHAR | NULLABLE | City name |
| appearance | ENUM | DEFAULT 'system' | Theme: light/dark/system |
| locationEnabled | BOOLEAN | DEFAULT true | Location sharing pref |
| showProfileInPartyMode | BOOLEAN | DEFAULT true | Visible in swipe stack |
| pushNotificationsEnabled | BOOLEAN | DEFAULT true | Push notification pref |
| createdAt | TIMESTAMP | auto | Account creation time |
| updatedAt | TIMESTAMP | auto | Last profile update |

**Serialization:** `phone`, `idProofUrl`, `latitude`, `longitude`, `appearance`, `locationEnabled`, `showProfileInPartyMode`, `pushNotificationsEnabled` are excluded from public API responses. Only returned on `/users/me` (own profile).

---

## Table: `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Event ID |
| title | VARCHAR(200) | NOT NULL | Event name |
| description | TEXT | NOT NULL | Full description |
| coverImageUrl | VARCHAR | NULLABLE | Cover photo URL |
| venue | VARCHAR | NOT NULL | Venue name |
| address | VARCHAR(200) | NOT NULL | Full address |
| latitude | DECIMAL(10,7) | NOT NULL, INDEXED | Venue latitude |
| longitude | DECIMAL(10,7) | NOT NULL, INDEXED | Venue longitude |
| startsAt | TIMESTAMP | NOT NULL | Event start time |
| endsAt | TIMESTAMP | NOT NULL | Event end time |
| maxGuests | INT | NOT NULL | Max approved attendees |
| price | DECIMAL(10,2) | DEFAULT 0 | Entry price |
| status | ENUM | DEFAULT 'published' | draft/published/live/ended/cancelled |
| partyModeEnabled | BOOLEAN | DEFAULT true | Enable swipe feature |
| tags | TEXT (simple-array) | NULLABLE | Comma-separated tags |
| hostId | UUID | FK → users.id, CASCADE | Event creator |
| createdAt | TIMESTAMP | auto | |
| updatedAt | TIMESTAMP | auto | |

---

## Table: `join_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Request ID |
| userId | UUID | FK → users.id, CASCADE | Requesting user |
| eventId | UUID | FK → events.id, CASCADE | Target event |
| status | ENUM | DEFAULT 'pending' | pending/approved/rejected/cancelled |
| message | TEXT | NULLABLE | Optional message to host |
| respondedBy | UUID | NULLABLE | Host who responded |
| respondedAt | TIMESTAMP | NULLABLE | Response timestamp |
| createdAt | TIMESTAMP | auto | |
| updatedAt | TIMESTAMP | auto | |

**Unique constraint:** `(userId, eventId)` — one request per user per event.

---

## Table: `swipes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Swipe ID |
| swiperId | UUID | FK → users.id, CASCADE | User who swiped |
| swipedId | UUID | FK → users.id, CASCADE | User being swiped on |
| eventId | UUID | FK → events.id, CASCADE | Event context |
| direction | ENUM | NOT NULL | left/right/super_like |
| createdAt | TIMESTAMP | auto | |

**Unique constraint:** `(swiperId, swipedId, eventId)` — one swipe per pair per event.

---

## Table: `matches`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Match ID |
| userOneId | UUID | FK → users.id, CASCADE | First user (sorted by ID) |
| userTwoId | UUID | FK → users.id, CASCADE | Second user |
| eventId | UUID | FK → events.id, CASCADE | Event where match occurred |
| isSuperLike | BOOLEAN | DEFAULT false | Either user used super like |
| createdAt | TIMESTAMP | auto | Match timestamp |

**Unique constraint:** `(userOneId, userTwoId, eventId)` — one match per pair per event.  
**Note:** `userOneId < userTwoId` is enforced in code to prevent duplicate pairs.

---

## Table: `messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Message ID |
| matchId | UUID | FK → matches.id, CASCADE, INDEXED | Parent match/conversation |
| senderId | UUID | FK → users.id, CASCADE | Message author |
| eventId | UUID | FK → events.id, CASCADE | Event context |
| content | TEXT | NOT NULL | Message text |
| type | ENUM | DEFAULT 'text' | text/image/emoji |
| isRead | BOOLEAN | DEFAULT false | Read receipt |
| createdAt | TIMESTAMP | auto | |

---

## Table: `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Notification ID |
| userId | UUID | FK → users.id, CASCADE, INDEXED | Recipient |
| type | ENUM | NOT NULL | See notification types below |
| title | VARCHAR(200) | NOT NULL | Notification headline |
| body | TEXT | NOT NULL | Notification body text |
| metadata | JSONB | NULLABLE | Contextual data (eventId, matchId, etc.) |
| isRead | BOOLEAN | DEFAULT false | Read status |
| createdAt | TIMESTAMP | auto | |

**Notification types:** `join_request_received`, `join_request_approved`, `join_request_rejected`, `new_match`, `new_message`, `event_going_live`, `event_reminder`, `super_like_received`, `check_in_available`

---

## Table: `check_ins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Check-in ID |
| userId | UUID | FK → users.id, CASCADE | User checking in |
| eventId | UUID | FK → events.id, CASCADE | Event |
| latitude | DECIMAL(10,7) | NOT NULL | Check-in GPS lat |
| longitude | DECIMAL(10,7) | NOT NULL | Check-in GPS lng |
| checkedInAt | TIMESTAMP | auto | Check-in time |

**Unique constraint:** `(userId, eventId)` — one check-in per user per event.
