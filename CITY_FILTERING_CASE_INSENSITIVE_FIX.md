# Case-Insensitive City Filtering Fix

## Overview
Fixed case-sensitivity issues in city filtering for both posts and groups to ensure locations like "Mumbai", "mumbai", and "MUMBAI" are treated as the same city.

## Problem
The filtering logic was using strict equality (`===`) for city comparisons, which meant:
- A post from "Mumbai" would not show for a user with city "mumbai"
- Groups from "Pune" would not match users from "PUNE"
- This caused confusion and made the filtering unreliable

## Solution
Updated all city comparison logic to use case-insensitive matching by converting both sides to lowercase before comparison.

## Changes Made

### Frontend (posts/page.tsx)

#### 1. Regional Post Filtering
**Before:**
```typescript
if (postFilter === 'regional' && user?.city) {
    filtered = filtered.filter(post => post.city === user.city);
}
```

**After:**
```typescript
if (postFilter === 'regional' && user?.city) {
    // For regional posts, only show posts from user's city (case-insensitive)
    filtered = filtered.filter(post => 
        post.city?.toLowerCase() === user.city?.toLowerCase()
    );
}
```

#### 2. City Filter Dropdown
**Before:**
```typescript
if (postFilter === 'all' && selectedCity !== 'All') {
    filtered = filtered.filter(post => post.city === selectedCity);
}
```

**After:**
```typescript
if (postFilter === 'all' && selectedCity !== 'All') {
    filtered = filtered.filter(post => 
        post.city?.toLowerCase() === selectedCity?.toLowerCase()
    );
}
```

#### 3. Group City Filtering
**Before:**
```typescript
if (user?.city && user?.role !== 'admin') {
    filtered = filtered.filter(group => {
        const groupCity = group.city || group.creator?.city;
        return groupCity === user.city || groupCity === 'global';
    });
}
```

**After:**
```typescript
if (user?.city && user?.role !== 'admin') {
    filtered = filtered.filter(group => {
        const groupCity = group.city || group.creator?.city;
        // Show groups that match user's city OR are global (case-insensitive)
        return groupCity?.toLowerCase() === user.city?.toLowerCase() || 
               groupCity?.toLowerCase() === 'global';
    });
}
```

### Backend Status
The backend (post.controller.js) was already using case-insensitive filtering via regex:
```javascript
query.$or = [
    { city: new RegExp(`^${userCity.trim()}$`, 'i') },  // 'i' flag = case-insensitive
    { city: 'global' }
];
```

## Technical Details

### Optional Chaining
Used optional chaining (`?.`) to prevent errors when city values are undefined:
```typescript
post.city?.toLowerCase()
```

### Global Groups
The 'global' keyword check is also case-insensitive:
```typescript
groupCity?.toLowerCase() === 'global'
```

## Testing Checklist

### Posts Filtering
- [ ] Create posts with city "Mumbai", "mumbai", "MUMBAI"
- [ ] User with city "mumbai" should see all three posts
- [ ] Regional filter should show all matching posts regardless of case
- [ ] City dropdown filter should work regardless of case
- [ ] Search by city name should work case-insensitively

### Groups Filtering
- [ ] Create groups from users with cities "Pune", "pune", "PUNE"
- [ ] User from "pune" should see all matching groups
- [ ] Global groups should always be visible
- [ ] Admin should see all groups regardless of city
- [ ] Group membership should not be affected by city case

### Edge Cases
- [ ] Test with null/undefined city values
- [ ] Test with empty string city values
- [ ] Test with cities having special characters
- [ ] Test with cities having spaces (e.g., "New Delhi")

## Impact

### Positive Effects
1. **Better User Experience**: Users will see all relevant content regardless of how the city name was entered
2. **Data Consistency**: Reduces confusion from inconsistent city name capitalization
3. **Improved Filtering**: More accurate filtering results

### No Breaking Changes
- Existing functionality remains intact
- Only makes comparisons more lenient
- No database schema changes required

## Recommendations

### Future Improvements
1. **Normalize on Input**: Convert city names to title case when saving (e.g., "mumbai" → "Mumbai")
2. **City Dropdown**: Ensure consistent casing in city selection dropdowns
3. **Database Cleanup**: Run a script to normalize existing city values
4. **Validation**: Add city validation to ensure consistent format

### Database Normalization Script Example
```javascript
// Run this to normalize all existing city values
await Post.updateMany(
    { city: { $exists: true } },
    [{ $set: { city: { $toLower: "$city" } } }]
);

await Group.updateMany(
    { city: { $exists: true } },
    [{ $set: { city: { $toLower: "$city" } } }]
);

await User.updateMany(
    { city: { $exists: true } },
    [{ $set: { city: { $toLower: "$city" } } }]
);
```

## Files Modified
1. `frontend/app/posts/page.tsx`
   - Updated post regional filtering (line ~126)
   - Updated post city dropdown filtering (line ~150)
   - Updated group city filtering (line ~187-190)

## Related Issues
- Fixes city filtering case sensitivity
- Improves location-based content discovery
- Enhances regional post visibility

## Notes
- Backend was already case-insensitive, only frontend needed fixes
- Used `toLowerCase()` for consistency and performance
- Optional chaining prevents runtime errors with missing city data
