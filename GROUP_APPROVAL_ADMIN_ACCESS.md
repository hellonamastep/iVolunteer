# Group Approval System - Admin Access Guide

## 🎯 Overview
When a user creates a group, it requires admin approval before becoming visible to all users. Admins can manage these requests directly from the homepage.

## 📍 Admin Access Locations

### 1. **Main Admin Dashboard** (http://localhost:3000/)
When logged in as admin, you'll see:
- **Pending Events CTA** - Blue card showing pending event count
- **Pending Groups CTA** - Purple card showing pending group count ✨ NEW

Click on the **"Pending Groups"** card to review all groups awaiting approval.

### 2. **Dedicated Review Page** (http://localhost:3000/pendinggrouprequest)
Full-featured admin interface for reviewing groups:
- **Table view** with all pending groups
- **Group details**: Name, description, creator, location (city)
- **Action buttons**: Approve (green) or Reject (red)
- **Rejection workflow**: Requires reason (10-500 characters)
- **Confirmation modals** for both approve/reject actions

### 3. **Alternative Admin Panel** (http://localhost:3000/admin)
Separate admin panel with tabs:
- **Events tab**: Pending/Approved/Rejected events
- **Groups tab**: Pending/Approved/Rejected groups ✨ NEW

---

## 🔄 Complete Workflow

### User Creates Group
1. User fills in group details (name, description, etc.)
2. Group is saved with `status: 'pending'`
3. Group's `city` is automatically populated from user's profile
4. User sees **yellow banner** in Groups tab: "Group pending approval"
5. Group is **not visible** in public group list yet

### Admin Reviews on Homepage
1. Admin logs into http://localhost:3000/
2. Sees **"Pending Groups"** card with count badge
3. Clicks card → redirected to `/pendinggrouprequest`
4. Reviews group details in table format
5. Options:
   - **Approve**: Makes group visible to all users
   - **Reject**: Enter reason → User sees red banner with reason

### User Sees Status
- **Pending**: Yellow banner with clock icon
- **Rejected**: Red banner with rejection reason
- **Approved**: No banner, group appears in public list

---

## 🎨 Visual Indicators

### Pending Groups CTA Card (Homepage)
- **Color**: Purple/Indigo gradient
- **Icon**: Users/Groups icon
- **Badge**: Purple with count
- **Text**: "Requires your review" / "All caught up"

### Review Page
- **Header**: Purple icon, pending count badge
- **Group cards**: Purple gradient icon
- **Approve button**: Green with checkmark
- **Reject button**: Red with X icon
- **Confirmation modals**: Smooth animations

---

## 🔐 Security & Access Control

### Route Protection
All admin routes check:
```typescript
if (!user || user.role !== 'admin') {
  router.push('/'); // Redirect non-admins
}
```

### Backend Authorization
Admin endpoints use middleware:
```javascript
router.get('/admin/pending', authentication, authorizeRole('admin'), getPendingGroups);
router.put('/admin/:groupId/status', authentication, authorizeRole('admin'), updateGroupStatus);
```

### API Endpoints
- `GET /v1/groups/admin/pending` - Get all pending groups
- `PUT /v1/groups/admin/:groupId/status` - Approve/reject group

---

## 📊 Components Overview

### New Components Created
1. **`PendingGroupsCTA.tsx`** - Homepage card component
2. **`app/pendinggrouprequest/page.tsx`** - Full review interface

### Modified Components
1. **`app/page.tsx`** - Added PendingGroupsCTA to AdminDashboard
2. **`app/admin/page.tsx`** - Added Groups tab with approval UI

### Context Functions Used
```typescript
// From groups-context.tsx
getPendingGroups() // Fetch all pending groups
approveGroup(groupId) // Approve a group
rejectGroup(groupId, reason) // Reject with reason
```

---

## 🧪 Testing Checklist

### As Regular User
- [ ] Create a group
- [ ] Verify status banner shows "pending"
- [ ] Verify group doesn't appear in public list
- [ ] Can still see your own group in Groups tab

### As Admin
- [ ] Login and go to homepage (http://localhost:3000/)
- [ ] See "Pending Groups" card with count
- [ ] Click card → redirected to review page
- [ ] See group in table with all details
- [ ] Click "Approve" → confirm → group approved
- [ ] Click "Reject" → enter reason → confirm → group rejected

### Verify Results
- [ ] Approved group appears in public GroupList
- [ ] User no longer sees pending banner for approved group
- [ ] Rejected group shows red banner with admin's reason
- [ ] City field is populated from user's location

---

## 🎯 Key Features

### User Experience
✅ Clear status indicators (banners)
✅ Transparent rejection reasons
✅ Can see their own pending groups

### Admin Experience
✅ Homepage CTA with pending count
✅ Dedicated review interface
✅ Required rejection reason (prevents accidental rejections)
✅ Confirmation modals for safety
✅ Smooth animations and feedback

### Security
✅ Role-based access control
✅ JWT authentication
✅ Backend authorization middleware
✅ Frontend route protection

---

## 🚀 Quick Start

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Create Test User**: Sign up with role: 'user'
4. **Create Test Admin**: Sign up/modify user with role: 'admin'
5. **Test Flow**:
   - Login as user → create group → see pending banner
   - Login as admin → go to homepage → click "Pending Groups"
   - Approve or reject the group
   - Login back as user → verify status change

---

## 📝 Notes

- Groups are filtered based on user role and status
- Admins see ALL groups regardless of status
- Users see approved groups + their own groups (any status)
- Rejection reasons are stored in database and displayed to users
- City is auto-populated from user profile on group creation
- All status changes trigger real-time UI updates

