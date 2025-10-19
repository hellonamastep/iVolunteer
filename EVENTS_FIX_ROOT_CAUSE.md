# Events Not Showing - Root Cause & Fix

## 🔍 Root Cause Identified

The events weren't showing because of **city-based filtering**:

### How It Works

1. **When user is logged in:**
   - `showAllEvents = false` (by default)
   - Backend filters events by user's city + global events
   - Query: `{ status: "approved", location: { $or: [{ city: "UserCity" }, { city: "global" }] } }`

2. **Your approved events locations:**
   - "Mumbai" (example, event mumbai, mumbai event)
   - "UK" (test)
   
3. **If your user's city is different** (e.g., "Delhi", "Pune", etc.):
   - No events match the filter
   - Result: 0 events shown

## ✅ Quick Fix Applied

Changed this line in `frontend/app/volunteer/page.tsx`:

```typescript
// BEFORE
const [showAllEvents, setShowAllEvents] = useState(!user);

// AFTER (Temporary fix)
const [showAllEvents, setShowAllEvents] = useState(true);
```

**Result:** Now ALL approved events will show regardless of user's city.

## 🔄 What to Check Now

1. **Refresh your browser** at `/volunteer` page
2. **Check console logs** - should now show:
   ```
   [Volunteer Page] showAllEvents: true
   [NGO Context] Number of events: 4
   ```
3. **Events should display** - All 4 approved events visible

## 📊 Backend Console Logs

If you have access to production server logs, you should see:

```
=== GET ALL PUBLISHED EVENTS ===
Request query: { showAll: 'true' }
User: { role: 'user', city: 'YourCity' }
Show all requested - showing all events

[SERVICE] getAllPublishedEvents called
[SERVICE] locationFilter: null
[SERVICE] Final query: { "status": "approved" }
[SERVICE] Events found: 4
[SERVICE] Event details: [
  { title: 'example', status: 'approved', location: 'Mumbai' },
  { title: 'event mumbai', status: 'approved', location: 'mumbai' },
  { title: 'mumbai event', status: 'approved', location: 'mumbai' },
  { title: 'test', status: 'approved', location: 'UK' }
]
```

## 🎯 Permanent Solutions

### Option 1: Update User's City (Recommended)

If you want city-based filtering to work:
1. Go to your profile
2. Update city to match event locations (e.g., "Mumbai")
3. Change back to: `const [showAllEvents, setShowAllEvents] = useState(!user);`

### Option 2: Make Events "Global"

Update event locations in database to "global":
```javascript
// In MongoDB or backend
Event.updateMany(
  { status: 'approved' },
  { $set: { location: 'global' } }
)
```

### Option 3: Keep ShowAll Toggle (Current)

Leave the fix as-is - always show all events to everyone.

### Option 4: Add UI Toggle

Add a button to let users switch between "All Events" and "My City Events":

```tsx
<button onClick={() => setShowAllEvents(!showAllEvents)}>
  {showAllEvents ? 'Show Local Events' : 'Show All Events'}
</button>
```

## 🐛 Why Events Show in NGO Dashboard But Not Volunteer Page

**NGO Dashboard (`/ngo-dashboard` or event table):**
- Uses `/v1/event/organization` endpoint
- Shows ALL events for that organization (pending, approved, rejected)
- No city filtering

**Volunteer Page (`/volunteer`):**
- Uses `/v1/event/all-event` endpoint
- Shows only approved events
- WITH city filtering (when `showAllEvents = false`)

## 📝 Console Logs Added

### Frontend (`ngo-context.tsx`):
```javascript
[NGO Context] Fetching events from: https://namastep-irod.onrender.com/api
[NGO Context] Full URL: ...
[NGO Context] Events fetched: {...}
[NGO Context] Number of events: X
```

### Frontend (`volunteer/page.tsx`):
```javascript
[Volunteer Page] showAllEvents: true/false
[Volunteer Page] user: { role: '...', city: '...' }
```

### Backend (`ngoEvent.controller.js`):
```javascript
=== GET ALL PUBLISHED EVENTS ===
Request query: {...}
User: {...}
Events returned from service: X
```

### Backend (`ngoEvent.service.js`):
```javascript
[SERVICE] getAllPublishedEvents called
[SERVICE] locationFilter: {...}
[SERVICE] Final query: {...}
[SERVICE] Events found: X
[SERVICE] Event details: [...]
```

## ✅ Testing Checklist

- [ ] Refresh `/volunteer` page
- [ ] Check console shows `showAllEvents: true`
- [ ] Check console shows `Number of events: 4`
- [ ] Verify 4 event cards visible on page
- [ ] Events: "example", "event mumbai", "mumbai event", "test"

## 🚀 Next Steps

1. **Test the fix** - Refresh and verify events show
2. **Check status banners in NGO dashboard** - Should work now
3. **Decide on permanent solution** - Choose from options above

---

**Status:** ✅ Fix Applied - Temporary solution to show all events
**Files Modified:** 
- `frontend/app/volunteer/page.tsx`
- `frontend/contexts/ngo-context.tsx` (debug logs)
- `backend/src/controllers/ngoEvent.controller.js` (debug logs)
- `backend/src/services/ngoEvent.service.js` (debug logs)
