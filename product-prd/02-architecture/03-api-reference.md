# API Reference

**Base URL:** `http://localhost:3000/api`  
**Swagger UI:** `http://localhost:3000/docs`  
**Auth:** Bearer JWT token in `Authorization` header (unless noted)

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/send-otp` | No | Send OTP to phone number |
| POST | `/auth/verify-otp` | No | Verify OTP, get JWT + user |

### POST `/auth/send-otp`
```json
{ "phone": "+919876543210" }
→ { "message": "OTP sent successfully" }
```

### POST `/auth/verify-otp`
```json
{ "phone": "+919876543210", "otp": "123456" }
→ {
    "accessToken": "eyJ...",
    "isNewUser": true,
    "isProfileComplete": false,
    "user": { "id", "phone", "fullName", "username", "avatarUrl" }
  }
```

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Yes | Get own full profile (including private fields) |
| PUT | `/users/me/setup` | Yes | First-time profile setup |
| PATCH | `/users/me` | Yes | Update profile |
| PATCH | `/users/me/location` | Yes | Update GPS location |
| PATCH | `/users/me/preferences` | Yes | Update app preferences |
| GET | `/users/:id` | Yes | Get public profile (sensitive fields excluded) |

---

## Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events` | Yes | Create new event |
| GET | `/events/discover` | Yes | Discover nearby events |
| GET | `/events/my-events` | Yes | List events I'm hosting |
| GET | `/events/:id` | Yes | Get event detail |
| PATCH | `/events/:id` | Yes | Update event (host only) |
| PATCH | `/events/:id/status/:status` | Yes | Change event status (host only) |
| DELETE | `/events/:id` | Yes | Delete event (host only) |

### GET `/events/discover` — Query Params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| latitude | number | - | User's latitude |
| longitude | number | - | User's longitude |
| radiusKm | number | 50 | Search radius in km |
| status | string | - | Filter by status |
| search | string | - | Search title/venue |
| page | number | 1 | Page number |
| limit | number | 20 | Results per page (max 50) |

---

## Join Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events/:eventId/join-requests` | Yes | Request to join event |
| GET | `/events/:eventId/join-requests` | Yes | Get event requests (host only) |
| PATCH | `/join-requests/:id/respond` | Yes | Approve/reject request (host only) |
| GET | `/join-requests/mine` | Yes | Get my sent requests |
| DELETE | `/join-requests/:id` | Yes | Cancel pending request |

### PATCH `/join-requests/:id/respond`
```json
{ "status": "approved" }  // or "rejected"
```

---

## Connections (Party Mode)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events/:eventId/swipe` | Yes | Swipe on a user |
| GET | `/events/:eventId/candidates` | Yes | Get swipe candidates |
| GET | `/events/:eventId/matches` | Yes | Get matches for this event |
| GET | `/matches` | Yes | Get all my matches |

### POST `/events/:eventId/swipe`
```json
{ "targetUserId": "uuid", "direction": "right" }
→ { "swipe": {...}, "isMatch": true, "match": {...} }
```

**Direction values:** `left`, `right`, `super_like`

---

## Messages (Chat)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chats` | Yes | Get chat list with last message + unread count |
| POST | `/matches/:matchId/messages` | Yes | Send message |
| GET | `/matches/:matchId/messages` | Yes | Get chat history (paginated) |
| PATCH | `/matches/:matchId/messages/read` | Yes | Mark messages as read |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | Get notifications (paginated) + unread count |
| PATCH | `/notifications/:id/read` | Yes | Mark single notification as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |

---

## Check-Ins

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events/:eventId/check-ins` | Yes | Check in (GPS-gated, 500m) |
| GET | `/events/:eventId/check-ins` | Yes | Get all check-ins for event |
| GET | `/events/:eventId/check-ins/status` | Yes | Get my check-in status |

---

## File Uploads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/uploads/:folder` | Yes | Upload image file |

**Folders:** `avatars`, `events`, `id-proofs`, `chat`  
**Body:** `multipart/form-data` with field `file`  
**Limits:** 5MB max, JPEG/PNG/WebP/GIF only  

```json
→ { "url": "http://localhost:3000/uploads/avatars/1718045123-abc123.jpg" }
```

---

## WebSocket Events

**Connection:** `ws://localhost:3000` with `auth.token` in handshake

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_event` | `{ eventId }` | Join event room for live updates |
| `leave_event` | `{ eventId }` | Leave event room |
| `join_chat` | `{ matchId }` | Join chat room for real-time messages |
| `leave_chat` | `{ matchId }` | Leave chat room |
| `typing` | `{ matchId }` | Broadcast typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | Message object | New chat message in joined chat room |
| `new_match` | Match object | You got a new match |
| `notification` | Notification object | Any notification |
| `event_update` | `{ type, status, eventId }` | Event went live/ended |
| `user_typing` | `{ matchId, userId }` | Someone is typing in your chat |
