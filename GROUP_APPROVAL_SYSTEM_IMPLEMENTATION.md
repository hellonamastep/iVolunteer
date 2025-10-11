# Group Approval System Implementation

## Overview
This feature implements an admin approval system for groups, similar to how events work. When users create groups, they are sent to admin for approval and users can see the status of their group requests via banners in the groups section.

## Implementation Date
October 11, 2025

## Reference
This implementation follows the exact same pattern used in the event approval system.

---

## Backend Changes

### 1. Group Model (`backend/src/models/Group.js`)

**Added status and rejectionReason fields:**

```javascript
status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
},
rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
}
```

**Purpose:**
- `status`: Tracks the approval state of the group (pending/approved/rejected)
- `rejectionReason`: Stores admin's reason if group is rejected
- Default status is 'pending' - all new groups require approval

---

### 2. Group Controller (`backend/src/controllers/group.controller.js`)

#### A. Modified `getGroups` function

**Added status filtering to only show approved groups to regular users:**

```javascript
// Only show approved groups (unless admin viewing all)
// Admin can see all groups, others only see approved ones
if (req.user?.role !== 'admin') {
    query.status = 'approved';
}
```

**Effect:**
- Regular users only see approved groups
- Admins can see all groups (pending, approved, rejected)
- Groups in pending or rejected status are hidden from public view

---

#### B. Added `updateGroupStatus` function (Admin only)

```javascript
export const updateGroupStatus = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status, rejectionReason } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "rejected"'
            });
        }

        // Prepare update data
        const updateData = { status };

        // If rejecting, include rejection reason (if provided)
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        // If approving, clear any previous rejection reason
        if (status === 'approved') {
            updateData.rejectionReason = null;
        }

        const group = await Group.findByIdAndUpdate(
            groupId,
            updateData,
            { new: true }
        ).populate('creator', 'name email');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        res.json({
            success: true,
            message: `Group ${status} successfully`,
            data: group
        });
    } catch (error) {
        console.error('Update group status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group status'
        });
    }
};
```

**Features:**
- Validates status (only accepts 'approved' or 'rejected')
- Stores rejection reason when rejecting
- Clears rejection reason when approving
- Returns updated group data

---

#### C. Added `getPendingGroups` function (Admin only)

```javascript
export const getPendingGroups = async (req, res) => {
    try {
        const groups = await Group.find({ status: 'pending' })
            .populate('creator', 'name email')
            .populate('members.user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get pending groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending groups'
        });
    }
};
```

**Purpose:**
- Allows admins to fetch all groups awaiting approval
- Returns groups sorted by creation date (newest first)
- Populates creator and member information

---

### 3. Group Routes (`backend/src/routes/group.routes.js`)

**Added admin-only routes:**

```javascript
import { authorizeRole } from '../middlewares/auth.middleware.js';

// Admin routes (require admin role)
router.get('/admin/pending', authentication, authorizeRole('admin'), getPendingGroups); 
router.put('/admin/:groupId/status', authentication, authorizeRole('admin'), updateGroupStatus);
```

**Routes:**
- `GET /api/groups/admin/pending` - Get all pending groups (admin only)
- `PUT /api/groups/admin/:groupId/status` - Approve/reject a group (admin only)

**Request body for status update:**
```json
{
  "status": "approved",  // or "rejected"
  "rejectionReason": "Reason for rejection" // optional, only for rejected status
}
```

---

## Frontend Changes

### 1. Group Context (`frontend/contexts/groups-context.tsx`)

**Updated Group interface to include status fields:**

```typescript
interface Group {
    _id: string;
    name: string;
    description: string;
    creator: {
        _id: string;
        name: string;
        email: string;
        city?: string;
    };
    members: GroupMember[];
    category: string;
    imageUrl?: string;
    isPrivate: boolean;
    maxMembers: number;
    messages: Message[];
    settings: {
        allowMemberInvites: boolean;
        requireApproval: boolean;
    };
    tags: string[];
    city?: string;
    status: 'pending' | 'approved' | 'rejected';  // NEW
    rejectionReason?: string;                      // NEW
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    userRole?: 'creator' | 'admin' | 'member' | null;
    isMember?: boolean;
}
```

---

### 2. Group Display Component (`frontend/components/group-display.tsx`)

**Updated Group interface to match context:**

```typescript
interface Group {
    _id: string;
    name: string;
    description: string;
    creator: {
        _id: string;
        name: string;
        email: string;
        city?: string;
    };
    category: string;
    imageUrl?: string;
    isPrivate: boolean;
    memberCount: number;
    userRole?: 'creator' | 'admin' | 'member' | null;
    isMember?: boolean;
    createdAt: string;
    tags: string[];
    city?: string;
    status: 'pending' | 'approved' | 'rejected';  // NEW
    rejectionReason?: string;                      // NEW
}
```

---

### 3. Posts Page (`frontend/app/posts/page.tsx`)

**Added pending and rejected groups banners in the Groups tab:**

The banners appear above the GroupList component and show:

#### A. Pending Groups Banner (Yellow)
- Shows count of groups awaiting approval
- Lists all pending groups with name and category
- Only visible to users who created groups

```tsx
{pendingGroups.length > 0 && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">
                    {pendingGroups.length} Group{pendingGroups.length > 1 ? 's' : ''} Awaiting Approval
                </h4>
                <p className="text-sm text-yellow-800 mb-2">
                    Your group{pendingGroups.length > 1 ? 's are' : ' is'} pending admin approval and will be visible once approved.
                </p>
                <div className="space-y-2 mt-3">
                    {pendingGroups.map(group => (
                        <div key={group._id} className="bg-white rounded-md p-2 text-sm">
                            <span className="font-medium text-gray-900">{group.name}</span>
                            <span className="text-xs text-gray-500 ml-2">• {group.category}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)}
```

#### B. Rejected Groups Banner (Red)
- Shows count of rejected groups
- Lists all rejected groups with name, category, and rejection reason
- Only visible to users who created groups

```tsx
{rejectedGroups.length > 0 && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">
                    {rejectedGroups.length} Group{rejectedGroups.length > 1 ? 's' : ''} Rejected
                </h4>
                <p className="text-sm text-red-800 mb-2">
                    The following group{rejectedGroups.length > 1 ? 's were' : ' was'} not approved by the admin.
                </p>
                <div className="space-y-2 mt-3">
                    {rejectedGroups.map(group => (
                        <div key={group._id} className="bg-white rounded-md p-3 text-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-medium text-gray-900 block">{group.name}</span>
                                    <span className="text-xs text-gray-500">{group.category}</span>
                                </div>
                            </div>
                            {group.rejectionReason && (
                                <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded">
                                    <strong>Reason:</strong> {group.rejectionReason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)}
```

**Banner Logic:**
- Filters user's created groups by status
- Only shows banners if user has pending or rejected groups
- Displays relevant information for each status
- Uses the same design pattern as event banners

---

## How It Works

### 1. Group Creation Flow

1. **User creates a group** through the create group form
2. **Backend creates group** with `status: 'pending'`
3. **Group is saved** to database
4. **User sees success message** but group is not visible to others
5. **Admin receives notification** (group appears in pending list)

### 2. User Experience - Group Creator

**After creating a group:**
1. User navigates to Groups tab
2. Sees yellow banner: "Group Awaiting Approval"
3. Banner shows group name and category
4. Group does not appear in public group list yet

**If group is approved:**
1. Banner disappears
2. Group appears in public group list
3. Other users can discover and join

**If group is rejected:**
1. Yellow banner changes to red banner
2. Shows rejection reason from admin
3. Group remains hidden from public

### 3. Admin Experience

**To approve/reject groups, admin can:**

1. **Fetch pending groups:**
```bash
GET /api/groups/admin/pending
Authorization: Bearer <admin-token>
```

2. **Approve a group:**
```bash
PUT /api/groups/admin/:groupId/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved"
}
```

3. **Reject a group:**
```bash
PUT /api/groups/admin/:groupId/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "rejected",
  "rejectionReason": "Group name violates community guidelines"
}
```

### 4. Group Visibility Rules

| User Role | Can See |
|-----------|---------|
| Admin | All groups (pending, approved, rejected) |
| Regular User | Only approved groups |
| Group Creator | All their own groups regardless of status + all approved groups |

---

## Status Workflow

```
[User Creates Group]
        ↓
   status: 'pending'
        ↓
    [Admin Reviews]
        ↓
    ┌───────┴───────┐
    ↓               ↓
[Approve]      [Reject]
    ↓               ↓
status:        status:
'approved'     'rejected'
    ↓               ↓
Visible to     Hidden, with
everyone       reason shown
               to creator
```

---

## API Endpoints Summary

### Public/User Endpoints
- `POST /api/groups` - Create group (sets status to 'pending')
- `GET /api/groups` - Get all approved groups (or all if admin)
- `GET /api/groups/user/my-groups` - Get user's own groups (all statuses)

### Admin Endpoints
- `GET /api/groups/admin/pending` - Get all pending groups (admin only)
- `PUT /api/groups/admin/:groupId/status` - Approve/reject group (admin only)

---

## Benefits

1. **Content Moderation**: Admins can review groups before they go public
2. **Quality Control**: Prevents spam and inappropriate groups
3. **User Transparency**: Creators see status of their requests
4. **Clear Communication**: Rejection reasons help users understand issues
5. **Consistent Experience**: Mirrors event approval system users are familiar with

---

## Testing Checklist

- [ ] Create a group as regular user and verify status is 'pending'
- [ ] Verify new group does NOT appear in public group list
- [ ] Check yellow "Awaiting Approval" banner appears for creator
- [ ] Admin can fetch pending groups via API
- [ ] Admin can approve group - verify it appears in public list
- [ ] Admin can reject group - verify rejection banner with reason appears
- [ ] Verify approved groups appear to all users
- [ ] Verify rejected groups stay hidden from public
- [ ] Test that admins can see all groups regardless of status
- [ ] Test city filtering still works with approval system
- [ ] Verify banner disappears after approval

---

## Future Enhancements

1. **Admin Dashboard**: Add dedicated UI for reviewing pending groups
2. **Notifications**: Email/push notifications for approval/rejection
3. **Bulk Actions**: Approve/reject multiple groups at once
4. **Appeal Process**: Allow creators to resubmit rejected groups
5. **Auto-Approval**: Trusted users bypass approval after X approved groups
6. **Review Notes**: Add internal admin notes visible only to admins
7. **Approval History**: Track who approved/rejected and when

---

## Related Files

### Backend
- `backend/src/models/Group.js` - Group schema with status fields
- `backend/src/controllers/group.controller.js` - Group approval logic
- `backend/src/routes/group.routes.js` - Admin routes
- `backend/src/middlewares/auth.middleware.js` - Authorization middleware

### Frontend
- `frontend/contexts/groups-context.tsx` - Group interface with status
- `frontend/components/group-display.tsx` - Group display with status
- `frontend/app/posts/page.tsx` - Pending/rejected banners

---

## Notes

- This implementation exactly mirrors the event approval flow for consistency
- Default status is 'pending' for all new groups
- Admins bypass all filters and see groups in any status
- Banners only show to group creators
- Rejection reasons are optional but recommended
- Status transitions are one-way per approval cycle (pending → approved/rejected)
