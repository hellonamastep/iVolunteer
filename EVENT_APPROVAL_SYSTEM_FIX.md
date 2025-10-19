# Event Approval System Fix - Complete Solution

## Issues Fixed

### 1. **PendingRequestsCTA Component Showing Wrong Data**

**Problem:** The `PendingRequestsCTA` component in the admin dashboard was displaying donation events instead of volunteer events.

**Location:** `frontend/components/PendingRequestsCTA.tsx`

**Fix Applied:**
```typescript
// BEFORE
const { pendingDonationEvents } = useAdmin();
const pendingEvents = pendingDonationEvents || [];

// AFTER
const { pendingEvents } = useAdmin();
const volunteerEvents = pendingEvents || [];
```

**Impact:** Now when NGOs create volunteer events, they will appear in the admin's "Pending Events" section on the dashboard.

---

### 2. **Event Model Default Status Issue**

**Problem:** The Event model had `default: "approved"` for the status field, which could cause events to bypass the approval process.

**Location:** `backend/src/models/Event.js`

**Fix Applied:**
```javascript
// BEFORE
status: {
  type: String,
  enum: ["pending", "approved", "rejected", "completed", "cancelled"],
  default: "approved",  // ❌ Wrong default
},

// AFTER
status: {
  type: String,
  enum: ["pending", "approved", "rejected", "completed", "cancelled"],
  default: "pending",   // ✅ Correct default
},
```

**Impact:** All newly created events will now default to "pending" status, requiring admin approval before being visible to volunteers.

---

### 3. **getAllPublishedEvents Query Issue** ⭐ NEW

**Problem:** The function was querying for `status: "active"` and `approvalStatus: "approved"`, but the Event model only has a `status` field (not `approvalStatus`). This caused approved events to not show up on the volunteer events page.

**Location:** `backend/src/services/ngoEvent.service.js`

**Fix Applied:**
```javascript
// BEFORE
const baseQuery = { status: "active", approvalStatus: "approved" };

// AFTER
const baseQuery = { status: "approved" };
```

**Impact:** Approved events now correctly appear on the volunteer events page (`/volunteer`) for users to browse and participate in.

---

### 4. **getEventsByOrganization Filtering Issue** ⭐ NEW

**Problem:** The function was only returning approved events with specific eventStatus values, preventing NGOs from seeing their pending or rejected events in their dashboard.

**Location:** `backend/src/services/ngoEvent.service.js`

**Fix Applied:**
```javascript
// BEFORE
const events = await Event.find({
  organizationId,
  status: "approved",  // ❌ Only showing approved
  eventStatus: { $in: ["upcoming", "ongoing"] },
})
.sort({ date: 1 });

// AFTER
const events = await Event.find({
  organizationId,  // ✅ Show ALL events (pending, approved, rejected)
})
.sort({ createdAt: -1 });  // Newest first
```

**Impact:** NGOs can now see ALL their events (pending, approved, rejected) in their event management table, with proper status banners displayed.

---

## Existing Features (Already Working)

### Status Banners in NGO Dashboard

The status banners are already implemented in `frontend/components/Ngoeventtable.tsx` and display:

#### 1. **Pending Events Banner (Yellow)**
- Shows when NGO has events awaiting admin approval
- Displays count of pending events
- Clickable to filter and view pending events
```tsx
{pendingCount > 0 && (
  <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 ...">
    {pendingCount} Event{pendingCount > 1 ? 's' : ''} Awaiting Approval
  </div>
)}
```

#### 2. **Rejected Events Banner (Red)**
- Shows when admin rejects an event
- Displays rejection reason from admin
- Clickable to view and manage rejected events
```tsx
{rejectedEvents.length > 0 && (
  <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 ...">
    {rejectedEvents.length} Event{rejectedEvents.length > 1 ? 's' : ''} Rejected
    // Shows rejection reason if available
  </div>
)}
```

---

## Event Approval Workflow

### For NGOs:
1. Create event via `/add-event` page
2. Event is saved with `status: "pending"`
3. Yellow banner appears in NGO's event table showing pending status
4. Event is NOT visible to volunteers until approved
5. If rejected, red banner appears with admin's reason

### For Admins:
1. New events appear in admin dashboard's "Pending Events" card
2. Admin reviews event at `/pendingrequest` page
3. Admin can:
   - **Approve** with point scoring system
   - **Reject** with reason (NGO will see this reason)
4. After action, event is removed from pending list

### For Volunteers:
1. Only see events with `status: "approved"`
2. Can participate in approved events
3. Cannot see pending or rejected events

---

## API Endpoints Involved

### Frontend Context: `admin-context.tsx`
- `fetchPendingEvents()` - Calls `/v1/event/pending`
- `handleApprove()` - Calls `/v1/event/admin/approve-with-scoring/:id`
- `handleDeny()` - Calls `/v1/event/status/:id`

### Backend Routes: `event.routes.js`
```javascript
// Get pending events (Admin only)
router.get("/pending", authMiddleware, authorizeRole("admin"), 
  ngoEventController.getPendingEvents)

// Approve with scoring
router.put("/admin/approve-with-scoring/:eventId", authMiddleware, 
  authorizeRole("admin"), ngoEventController.approveEventWithScoring)

// Update status (approve/reject)
router.put("/status/:eventId", authMiddleware, authorizeRole("admin"), 
  ngoEventController.updateEventStatus)
```

---

## Testing Checklist

- [ ] Create a new event as NGO
- [ ] Verify event appears in admin's "Pending Events" card with correct count
- [ ] Verify yellow "Pending" banner appears in NGO's event table
- [ ] Approve event as admin
- [ ] Verify event disappears from pending list
- [ ] Verify event becomes visible to volunteers
- [ ] Create another event and reject it with a reason
- [ ] Verify red "Rejected" banner appears in NGO's event table with reason
- [ ] Verify rejected event can be edited or deleted by NGO

---

## Files Modified

1. ✅ `frontend/components/PendingRequestsCTA.tsx` - Fixed to use `pendingEvents` instead of `pendingDonationEvents`
2. ✅ `backend/src/models/Event.js` - Changed default status from "approved" to "pending"
3. ⭐ `backend/src/services/ngoEvent.service.js` - Fixed `getAllPublishedEvents` query to use `status: "approved"`
4. ⭐ `backend/src/services/ngoEvent.service.js` - Fixed `getEventsByOrganization` to return ALL events (not just approved)

---

## Related Components

- `frontend/components/PendingRequestsCTA.tsx` - Admin dashboard card for pending volunteer events
- `frontend/components/Donationreqcta.tsx` - Admin dashboard card for pending donation events (separate)
- `frontend/components/Ngoeventtable.tsx` - NGO's event management table with status banners
- `frontend/app/pendingrequest/page.tsx` - Admin page to review pending events
- `frontend/contexts/admin-context.tsx` - Admin state management

---

## Notes

- **Two separate approval systems exist:**
  1. **Volunteer Events** - Regular NGO events (uses `pendingEvents`)
  2. **Donation Events** - Fundraising campaigns (uses `pendingDonationEvents`)
  
- Both systems are independent and have their own:
  - CTA cards in admin dashboard
  - Review pages
  - Context state management

- The fixes ensure volunteer events flow through the proper approval workflow

---

## Future Improvements

1. Add email notifications when event is approved/rejected
2. Add ability to edit and resubmit rejected events directly from banner
3. Add analytics for event approval rates
4. Add bulk approve/reject functionality for admins
