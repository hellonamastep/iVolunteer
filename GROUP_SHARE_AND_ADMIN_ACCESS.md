# Group Share and Admin Message Access Implementation

## Overview
Added share functionality to all group cards and enabled platform admins to view messages in any group regardless of membership status.

## Changes Made

### 1. Share Functionality (group-display.tsx)

#### Icon Import
- Added `Share2` icon from lucide-react to the imports

#### Share Handler Function
```typescript
const handleShare = async () => {
    try {
        const groupUrl = `${window.location.origin}/posts?groupId=${group._id}`;
        await navigator.clipboard.writeText(groupUrl);
        toast({
            title: 'Link copied!',
            description: 'Group link copied to clipboard',
        });
    } catch (error) {
        toast({
            title: 'Failed to copy link',
            description: 'Please try again',
            variant: 'destructive'
        });
    }
};
```

**Features:**
- Generates shareable group link with groupId parameter
- Copies link to clipboard using Navigator API
- Shows success toast notification
- Handles errors gracefully

#### Share Button Placement
Added Share button in two locations within the GroupCard component:

**For Members (already joined):**
```tsx
<Button
    onClick={handleShare}
    variant="outline"
    className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
>
    <Share2 className="w-4 h-4" />
</Button>
```

**For Non-Members:**
```tsx
<Button
    onClick={handleShare}
    variant="outline"
    className="px-4 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
>
    <Share2 className="w-4 h-4" />
</Button>
```

Positioned after the View/Open and Join/Leave buttons in the actions section.

### 2. Admin Message Access (group-chat.tsx)

#### Updated Role Checks
```typescript
const isCreator = currentGroup?.userRole === 'creator' || currentGroup?.creator?._id === user?._id || currentGroup?.creator?._id === user?.id;
const isGroupAdmin = currentGroup?.userRole === 'admin';
const isPlatformAdmin = user?.role === 'admin';
const canSendMessages = isCreator || isGroupAdmin;
const canViewMessages = currentGroup?.isMember || isCreator || isPlatformAdmin;
```

**Key Changes:**
- `isAdmin` renamed to `isGroupAdmin` for clarity
- Added `isPlatformAdmin` check for platform-level admins
- Created `canViewMessages` variable that includes platform admins
- `canSendMessages` remains restricted to group creator and group admins only

#### Updated Message Display Condition
**Before:**
```tsx
{!currentGroup.isMember && !isCreator ? (
    // Show "Join to view" message
```

**After:**
```tsx
{!canViewMessages ? (
    // Show "Join to view" message
```

Now platform admins can view messages even if they're not members.

#### Updated Message Input Condition
**Before:**
```tsx
{user && (currentGroup.isMember || isCreator) ? (
```

**After:**
```tsx
{user && canViewMessages ? (
```

Platform admins can view the chat interface but cannot send messages (controlled by `canSendMessages`).

#### Fixed Placeholder Text
Updated input placeholder to use `isGroupAdmin` instead of deprecated `isAdmin`:
```tsx
placeholder={isCreator ? "Type your message as group host..." : isGroupAdmin ? "Type your message as admin..." : "Type your message..."}
```

## User Experience

### Share Functionality
1. **All Users**: Can click share button on any group card (member or non-member)
2. **Action**: Copies shareable link to clipboard
3. **Feedback**: Toast notification confirms successful copy
4. **Link Format**: `http://localhost:3000/posts?groupId={groupId}`

### Admin Message Access
1. **Platform Admins** (user.role === 'admin'):
   - Can view all group messages without joining
   - Cannot send messages (read-only access)
   - Useful for moderation and oversight

2. **Group Admins** (userRole === 'admin' in group):
   - Can view and send messages
   - Remains unchanged

3. **Regular Members**:
   - Must join group to view messages
   - Can send messages if member

## Technical Details

### Share Button Styling
- Outline variant for subtle appearance
- Share2 icon (16x16px)
- Matches Leave button styling
- Positioned in actions section for consistency

### Admin Access Logic
- Platform admin check: `user?.role === 'admin'`
- Group admin check: `currentGroup?.userRole === 'admin'`
- View access: members OR creators OR platform admins
- Send access: creators OR group admins only

## Testing Checklist

### Share Functionality
- [ ] Click share button on member group card
- [ ] Click share button on non-member group card
- [ ] Verify link copied to clipboard
- [ ] Verify toast notification appears
- [ ] Paste link and verify it navigates correctly
- [ ] Test error handling (deny clipboard permission)

### Admin Message Access
- [ ] Login as platform admin
- [ ] View group without joining
- [ ] Verify messages are visible
- [ ] Verify cannot send messages (input disabled or not shown)
- [ ] Login as regular user
- [ ] Verify must join to view messages
- [ ] Login as group creator/admin
- [ ] Verify can view and send messages

## Files Modified
1. `frontend/components/group-display.tsx`
   - Added Share2 icon import
   - Added handleShare function
   - Added Share buttons in both member/non-member sections

2. `frontend/components/group-chat.tsx`
   - Added isPlatformAdmin check
   - Renamed isAdmin to isGroupAdmin
   - Added canViewMessages logic
   - Updated message display condition
   - Updated message input condition
   - Fixed placeholder text

## Notes
- Share functionality uses Clipboard API (requires HTTPS in production)
- Platform admins have read-only access for moderation purposes
- Group admins retain full message permissions
- All changes maintain backward compatibility
