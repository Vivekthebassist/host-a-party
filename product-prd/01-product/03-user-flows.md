# User Flows

## Flow 1: New User Onboarding

```
App Launch
  → Welcome Screen (app intro + features)
  → "Get Started"
  → Login Screen
      → Enter phone number
      → Tap "Send OTP"
  → OTP Verification Screen
      → Enter 6-digit OTP
      → Tap "Verify"
  → Profile Setup Screen (first-time only)
      → Upload avatar
      → Enter full name, username, bio
      → Tap "Complete Setup"
  → Home - Discover (events feed)
```

## Flow 2: Host Creates an Event

```
Home Screen
  → Tap "+" FAB (floating action button)
  → Create Event Screen
      → Fill: title, description, cover image
      → Fill: venue, address (auto-detect GPS)
      → Set: date, time, max guests, price
      → Add: tags
      → Tap "Create Event"
  → Event published → visible on Discover feed
```

## Flow 3: Attendee Joins an Event

```
Home - Discover
  → Browse nearby events (sorted by distance)
  → Tap event card → Event Detail Screen
  → Tap "Request to Join" (with optional message)
  → Button changes to "Request Pending" with timer
  → [Waits for host response]
  → Notification: "Request Approved!" or "Request Declined"
```

## Flow 4: Host Manages Join Requests

```
My Events → Tap event
  → Event Detail → "Manage Requests" button
  → Manage Requests Screen
      → Summary: 5 pending, 12 approved, 2 declined
      → List of individual requests with user info
      → Tap "Approve" ✓ or "Reject" ✗ per request
  → Approved users receive notification + can check in
```

## Flow 5: Event Goes Live → Party Mode

```
[Automatic at startsAt time]
  → Event status flips to "live"
  → All approved attendees receive "Party is Live!" notification
  → Event Detail shows "LIVE NOW" badge
  → "Request to Join" button becomes "You're In"
  → Orange pulsing "Party Mode" FAB appears

Attendee taps Party Mode FAB
  → Swipe Screen (full-bleed photo cards)
      → Swipe Right = Like
      → Swipe Left = Pass
      → Tap Star = Super Like
  → [Both swipe right] → Match Screen ("It's a Connection!")
      → "Send a Message" → Chat Screen
      → "Keep Swiping" → back to swipe stack
```

## Flow 6: Chat After Match

```
Match notification received
  → Tap notification → Chat Screen
  OR
  → Bottom nav → Chat tab → Chat List
      → See all matches with last message preview
      → Tap match → Chat Screen
          → Event context banner at top
          → Send text/image/emoji messages
          → See typing indicator (real-time)
          → Messages marked as read on open
```

## Flow 7: Event Check-In

```
[Event starting soon / live]
  → Event Detail shows countdown timer
  → "Already here" section with checked-in avatars
  → "Check In" button (location-gated)
  → Tap "Check In"
      → App requests GPS location
      → If within 500m of venue → Check-in success ✓
      → If too far → Error: "You are X.Xkm away. Must be within 500m."
```

## Flow 8: Notifications

```
Home Screen → Tap bell icon (with red badge "3")
  → Notifications Screen
      → "New" section (unread)
          → "Request Approved" → tap → Event Detail
          → "New Match" → tap → Chat Screen
          → "New Message" → tap → Chat Screen
      → "Earlier" section (read)
      → "Mark all as read" action
```
