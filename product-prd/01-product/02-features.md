# Features Breakdown

## MVP Features (v1.0)

### 1. Authentication

| Feature | Details |
|---------|---------|
| Phone + OTP Login | User enters phone number, receives 6-digit OTP, verifies to login/register |
| JWT Tokens | Stateless auth with 7-day expiry. Bearer token in all API requests |
| Auto-registration | First OTP verification auto-creates the user account |
| Social Login (UI only) | Google and Apple login buttons designed. Backend integration deferred to v1.1 |

**User Flow:**
```
Enter Phone → Receive OTP → Verify → [New User? → Profile Setup] → Home
```

---

### 2. User Profile

| Feature | Details |
|---------|---------|
| Profile Setup | First-time flow: full name, username, bio, avatar upload |
| Edit Profile | Update name, username, bio, avatar, city |
| Location Settings | GPS-based location update (latitude, longitude, city) |
| Privacy Settings | Toggle: show profile in Party Mode |
| Appearance | Light / Dark / System theme preference |
| Push Notifications | Toggle on/off |
| ID Verification | Upload ID proof for verified badge (future: automated verification) |

---

### 3. Events

| Feature | Details |
|---------|---------|
| Create Event | Title, description, cover image, venue, address, GPS coordinates, date/time, max guests, price, tags |
| Discover Events | Nearby events sorted by distance (Haversine formula), filterable by search |
| My Events | List of events you're hosting |
| Event Detail | Full event info with host profile, attendee count, join button |
| Event Status Lifecycle | `draft → published → live → ended → cancelled` |
| Auto-status Transitions | Cron job flips `published → live` at start time, `live → ended` at end time |
| Event Reminders | Push notification 30 minutes before event starts |

**Status Lifecycle:**
```
draft → published → [startsAt] → live → [endsAt] → ended
                 ↘ cancelled (manual)
```

---

### 4. Join Requests

| Feature | Details |
|---------|---------|
| Request to Join | Attendee sends request with optional message |
| Pending State | Request shows as "Pending" with timer icon |
| Host Management | Host sees all requests with summary (pending/approved/declined counts) |
| Approve / Reject | Host can approve or reject individual requests |
| Capacity Enforcement | Cannot approve beyond `maxGuests` limit |
| Cancel Request | Attendee can cancel their own pending request |
| My Requests | Attendee can view all their sent requests across events |

---

### 5. Party Mode (Core USP)

| Feature | Details |
|---------|---------|
| Activation | Only available when event status is `live` and `partyModeEnabled` is true |
| Swipe Candidates | Shows approved attendees who: haven't been swiped yet, have Party Mode enabled |
| Swipe Actions | Left (pass), Right (like), Super Like |
| Match Detection | Instant bidirectional match when both users swipe right |
| Match Screen | Full-screen "It's a Connection!" celebration overlay |
| Event-scoped | All swipes and matches are tied to a specific event |
| Match Count | Badge showing total matches for the event |

**Swipe Flow:**
```
Event Detail (Live) → Party Mode FAB → Swipe Screen → [Mutual Right] → Match! → Chat
```

---

### 6. Chat

| Feature | Details |
|---------|---------|
| Chat List | All matches with last message preview, timestamp, unread count |
| Chat Screen | iOS-style message bubbles with event context banner |
| Message Types | Text, image, emoji |
| Read Receipts | Mark messages as read when chat is opened |
| Typing Indicators | Real-time via WebSocket |
| Event Context | Every chat shows which event the match originated from |

---

### 7. Notifications

| Type | Trigger |
|------|---------|
| `join_request_received` | Someone requests to join your event |
| `join_request_approved` | Your request was approved |
| `join_request_rejected` | Your request was declined |
| `new_match` | You matched with someone |
| `new_message` | You received a message |
| `event_going_live` | An event you're attending has started |
| `event_reminder` | Event starts in 30 minutes |
| `super_like_received` | Someone super liked you |
| `check_in_available` | Check-in is now available (future) |

**Delivery:** In-app (REST + WebSocket real-time push). Push notifications via FCM/APNS in v1.1.

---

### 8. Event Check-In

| Feature | Details |
|---------|---------|
| GPS-gated | Must be within 500 meters of the venue |
| One-time | Each user can check in once per event |
| Authorization | Must be approved attendee or host |
| Attendee List | "Already here" section with stacked avatars |
| Countdown Timer | Shows time until event starts |

---

## Screen Inventory (44 screens)

All screens are designed in both **light** and **dark** themes.

| Row | Feature | Screens |
|-----|---------|---------|
| 1 | Core Navigation | Welcome, Home - Discover, Event Detail, Create Event |
| 2 | My Events & Profile | My Events, Profile, Edit Profile, Location Settings, Privacy, Appearance |
| 3 | Auth Flow | Login, OTP Verification, Profile Setup |
| 4 | Join Request Flow | Event Detail (Pending), Manage Requests (Host View) |
| 5 | Notifications & Check-in | Notifications, Event Detail (Starting Soon), Check-In |
| 6 | Party Mode | Event Detail (Live), Swipe Screen, Match Screen |
| 7 | Chat | Party Chat List, Chat Screen |

---

## Deferred Features (v1.1+)

| Feature | Priority | Notes |
|---------|----------|-------|
| Social login (Google/Apple) | High | UI designed, backend pending |
| Push notifications (FCM/APNS) | High | WebSocket + in-app done |
| Photo gallery per event | Medium | Shared event photo wall |
| Event ratings & reviews | Medium | Post-event feedback |
| Verified host badges | Medium | Automated ID verification |
| Event categories & filters | Low | Music, Tech, Food, etc. |
| Block & report users | High | Safety feature |
| Payment integration | Medium | Razorpay/Stripe for paid events |
