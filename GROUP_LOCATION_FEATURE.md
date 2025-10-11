# Group Location Feature Implementation

## Overview
This feature automatically saves the location (city) of a group based on the creator's location when the group is created, and displays this location in the group details About page.

## Implementation Date
October 11, 2025

## Reference
This implementation follows the same pattern used in the post creation flow, where posts automatically inherit the city from the user's profile.

---

## Backend Changes

### 1. Group Model (`backend/src/models/Group.js`)

**Added city field to the group schema:**

```javascript
city: {
    type: String,
    required: true,
    trim: true
}
```

**Location in schema:** Added after the `category` field, before `imageUrl`.

**Purpose:** Store the location/city of the group, inherited from the creator's profile.

---

### 2. Group Controller (`backend/src/controllers/group.controller.js`)

**Modified `createGroup` function to automatically populate city from user profile:**

```javascript
// Get city from the logged-in user's profile (same as post creation flow)
let city;
if (req.user.role === 'user') {
    city = req.user.city;
} else if (req.user.role === 'ngo' || req.user.role === 'corporate') {
    city = req.user.address?.city;
} else if (req.user.role === 'admin') {
    // Admin can create groups, use their city if available
    city = req.user.city || req.user.address?.city;
}

if (!city) {
    return res.status(400).json({ 
        success: false, 
        message: 'User must have a city set in their profile to create groups' 
    });
}
```

**Then added city to the Group creation:**

```javascript
const group = new Group({
    name,
    description,
    creator: userId,
    category,
    city: city.trim(),  // Added this line
    imageUrl,
    cloudinaryPublicId,
    // ... rest of the fields
});
```

---

## Frontend Changes

### 1. Group Context (`frontend/contexts/groups-context.tsx`)

**Group interface already includes city field:**

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
    // ... other fields
    city?: string;  // Group's location field
    // ... rest of the fields
}
```

---

### 2. Group Details Component (`frontend/components/group-details.tsx`)

**Modified the About tab to display group location:**

**Before:**
```tsx
{(currentGroup.city || currentGroup.creator?.city) && (
    <div className="flex justify-between">
        <span className="text-gray-600">Location:</span>
        <span className="flex items-center gap-1 font-medium text-gray-900">
            📍 {currentGroup.city || currentGroup.creator?.city}
        </span>
    </div>
)}
```

**After:**
```tsx
{currentGroup.city && (
    <div className="flex justify-between">
        <span className="text-gray-600">Location:</span>
        <span className="flex items-center gap-1 font-medium text-gray-900">
            📍 {currentGroup.city}
        </span>
    </div>
)}
```

**Location in component:** Inside the "About" tab content, under "Group Information" section.

---

### 3. Group Display Component (`frontend/components/group-display.tsx`)

**Group interface already includes city field:**

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
    // ... other fields
    city?: string;  // Group's location field
    // ... rest of the fields
}
```

---

## How It Works

### 1. Group Creation Flow

1. **User creates a group** through the create group form
2. **Backend receives the request** at `POST /api/groups`
3. **City is automatically extracted** from the user's profile:
   - For regular users (`role: 'user'`): Uses `user.city`
   - For NGOs/Corporates (`role: 'ngo'` or `'corporate'`): Uses `user.address.city`
   - For admins (`role: 'admin'`): Uses `user.city` or `user.address.city`
4. **Validation**: If no city is found, returns error message
5. **Group is created** with the city field populated
6. **Group is saved** to database with location information

### 2. Group Display Flow

1. **User views group details** by clicking on a group
2. **Frontend fetches group data** from `GET /api/groups/:groupId`
3. **Group details component** displays the information in tabs
4. **About tab shows location**:
   - Displays as "Location: 📍 [City Name]"
   - Only shows if `currentGroup.city` exists
   - Appears in the "Group Information" section

---

## Benefits

1. **Automatic Location Tracking**: No need for users to manually enter location when creating groups
2. **Consistency**: Uses the same location pattern as posts (reference implementation)
3. **Location-Based Features**: Enables future filtering/searching of groups by location
4. **User Context**: Helps members understand the geographic context of the group
5. **Data Integrity**: City is required and validated during group creation

---

## User Roles and City Sources

| User Role | City Source | Fallback |
|-----------|-------------|----------|
| `user` | `user.city` | None (required field) |
| `ngo` | `user.address.city` | None (required field) |
| `corporate` | `user.address.city` | None (required field) |
| `admin` | `user.city` | `user.address.city` |

---

## Error Handling

**Scenario**: User tries to create a group without city information in profile

**Error Response**:
```json
{
    "success": false,
    "message": "User must have a city set in their profile to create groups"
}
```

**Resolution**: User must update their profile with city information before creating groups.

---

## Testing Checklist

- [ ] Create a group as a regular user and verify city is saved
- [ ] Create a group as an NGO and verify address.city is saved
- [ ] Create a group as a corporate entity and verify address.city is saved
- [ ] View group details and verify location appears in About tab
- [ ] Try to create a group with a user profile missing city (should fail with appropriate error)
- [ ] Verify location displays correctly with emoji (📍)
- [ ] Check that city is trimmed of whitespace

---

## Future Enhancements

1. **Location-Based Filtering**: Filter groups by city/region
2. **Nearby Groups**: Show groups from nearby locations
3. **Location Search**: Search groups by location
4. **Map Integration**: Display groups on a map
5. **Multi-Location Groups**: Support for groups spanning multiple cities
6. **Location Updates**: Allow group creators to update location if needed

---

## Related Files

### Backend
- `backend/src/models/Group.js` - Group schema with city field
- `backend/src/controllers/group.controller.js` - Group creation logic with city extraction
- `backend/src/models/User.js` - User schema with city fields

### Frontend
- `frontend/contexts/groups-context.tsx` - Group interface with city field
- `frontend/components/group-details.tsx` - Group details display with location
- `frontend/components/group-display.tsx` - Group card interface with city field

### Documentation
- `POST_CREATION_FLOW.md` - Reference implementation for location handling

---

## Notes

- This implementation mirrors the post creation flow for consistency
- City field is required and automatically populated
- Location is displayed in a user-friendly format with location emoji
- The feature maintains backward compatibility (city field is optional in TypeScript interfaces)
