# Debugging Guide - Events Not Showing Issue

## Current Setup

### Frontend Configuration
- **API Base URL:** `https://namastep-irod.onrender.com/api` (Production server)
- **Environment File:** `frontend/.env`
- **Frontend Server:** Running on `http://localhost:3000`

### Backend Configuration  
- **Production Server:** `https://namastep-irod.onrender.com`
- **MongoDB Cluster:** `mongodb+srv://hellonamastep_db_user:Atharva123@namastep.5iwwocn.mongodb.net/namastepDB`
- **Database Status:** 
  - ✅ 4 approved events exist
  - ✅ 1 pending event exists

## How to Debug

### Step 1: Open Browser Developer Tools

1. Open your app in browser: `http://localhost:3000`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Navigate to Volunteer Page

1. Go to `/volunteer` page
2. Look for console logs showing:
   ```
   [NGO Context] Fetching events from: https://namastep-irod.onrender.com/api
   [NGO Context] Full URL: https://namastep-irod.onrender.com/api/v1/event/all-event
   [NGO Context] Events fetched: {...}
   [NGO Context] Number of events: X
   ```

### Step 3: Check Network Tab

1. Go to **Network** tab in Developer Tools
2. Filter by "all-event"
3. Look for the request to `/v1/event/all-event`
4. Check:
   - **Request URL:** Should be `https://namastep-irod.onrender.com/api/v1/event/all-event`
   - **Status Code:** Should be `200`
   - **Response:** Click on the request and view the response to see what events are returned

### Step 4: Check Production Server Logs

If you have access to the production server logs (Render.com dashboard):
1. Go to your Render.com dashboard
2. Find your backend service
3. Check the logs for:
   ```
   === GET ALL PUBLISHED EVENTS ===
   Request query: {...}
   User: {...}
   Events returned from service: X
   Event statuses: [...]
   ```

## Expected Results

### ✅ If Working Correctly

**Console logs should show:**
```javascript
[NGO Context] Fetching events from: https://namastep-irod.onrender.com/api
[NGO Context] Number of events: 4
```

**Network tab should show:**
- Status: `200 OK`
- Response body contains 4 events with `status: "approved"`

**Volunteer page should display:**
- 4 event cards visible
- Events: "example", "event mumbai", "mumbai event", "test"

### ❌ If Not Working

#### Issue 1: Events fetched but not displayed

**Symptoms:**
- Console shows events fetched: 4
- But volunteer page shows "No events found"

**Possible causes:**
1. Events filtered out by location/city
2. Events filtered out by eventType (virtual/in-person/community)
3. React state not updating properly

**Solution:**
- Check if `showAllEvents` is true
- Check the activeTab filter (virtual/in-person/community)
- Verify events have correct `eventType` field

#### Issue 2: API call to wrong URL

**Symptoms:**
- Console shows: `http://localhost:5000/api/v1/event/all-event`
- Connection refused or timeout error

**Solution:**
1. Stop and restart frontend server:
   ```powershell
   # Press Ctrl+C in the terminal running frontend
   cd frontend
   npm run dev
   ```

2. Verify .env file:
   ```powershell
   cat frontend/.env
   ```
   Should show: `NEXT_PUBLIC_API_URL=https://namastep-irod.onrender.com/api`

3. Clear browser cache and reload

#### Issue 3: 0 events returned from API

**Symptoms:**
- Console shows: `[NGO Context] Number of events: 0`
- Network tab shows status 200 but empty events array

**Possible causes:**
1. All events filtered by location (user's city doesn't match)
2. No events with `status: "approved"` in production DB

**Solution:**
- Add `?showAll=true` to URL: `/volunteer?showAll=true`
- Check user's city in profile
- Verify events in production DB have correct status

#### Issue 4: Authentication issues

**Symptoms:**
- 401 Unauthorized error
- Token expired message

**Solution:**
- Logout and login again
- Clear localStorage
- Check if auth token is being sent in request headers

## Quick Fixes

### Fix 1: Force Show All Events

Add this temporary code to volunteer page:
```tsx
// In volunteer page, around line 88
useEffect(() => {
  fetchAvailableEvents(true); // Force showAll to true
}, []);
```

### Fix 2: Check API URL in Browser Console

Run this in browser console while on the volunteer page:
```javascript
console.log('API Base URL:', window.localStorage.getItem('NEXT_PUBLIC_API_URL'));
```

### Fix 3: Manually Test API Endpoint

Open this URL in browser (replace TOKEN with your auth token):
```
https://namastep-irod.onrender.com/api/v1/event/all-event?showAll=true
```

Add header in Postman/Thunder Client:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Status Banners (NGO Dashboard)

The status banners in NGO dashboard should show:

### Yellow Banner - Pending Events
```tsx
"X Event(s) Awaiting Approval"
```
Shows when: `event.status === "pending"`

### Red Banner - Rejected Events
```tsx
"X Event(s) Rejected" + rejection reason
```
Shows when: `event.status === "rejected"`

### Green/Normal - Approved Events
Shows as "Open", "Ongoing", or "Full"
Shows when: `event.status === "approved"`

## Common Issues

### Issue: "No events to display"

**Check:**
1. Are you logged in?
2. What's your user's city?
3. Are events in your city?
4. Is `showAllEvents` toggle on?

### Issue: Status banners not showing in NGO table

**Check:**
1. Is `/v1/event/organization` returning ALL events?
2. Are events mapped correctly with status field?
3. Is the component re-fetching after status changes?

## Files with Debug Logging

- ✅ `frontend/contexts/ngo-context.tsx` - Added console logs to fetchAvailableEvents
- ✅ `backend/src/controllers/ngoEvent.controller.js` - Added detailed logging to getAllPublishedEvents

## Next Steps

1. Open browser and go to `/volunteer`
2. Open Developer Tools (F12)
3. Check Console and Network tabs
4. Report what you see:
   - API URL being called
   - Number of events returned
   - Any errors shown

---

**Note:** The production server at `https://namastep-irod.onrender.com` is the source of truth. Your local frontend is connecting to it correctly. The issue is likely in how events are being filtered or displayed on the frontend.
