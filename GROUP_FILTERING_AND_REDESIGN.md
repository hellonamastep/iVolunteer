# Group Filtering and Redesign Implementation

## Overview
Implemented city-based filtering, real-time search with text highlighting, "My Groups" sidebar widget, and a modern card redesign matching the reference image.

## Latest Updates (v4)

### City Inheritance from Creator
- **Automatic Inheritance**: Groups automatically inherit the city/location from their creator
- **Fallback Logic**: Displays `group.city` if available, otherwise falls back to `group.creator.city`
- **Filtering**: City-based filtering now checks both `group.city` and `group.creator.city`
- **Display**: Location shown on group cards and detail pages using inherited city
- **Implementation**: Added `city?: string` to creator object in Group interface

## Latest Updates (v3)

### Admin Privileges
- **All Groups Visible to Admins**: Admin users can see ALL groups regardless of location/city
- **Role-Based Filtering**: City-based filtering bypassed for users with `role === 'admin'`
- **Purpose**: Allows administrators to moderate and manage all groups across all cities

### Location Display
- **Group Cards**: City/location displayed on each group card with 📍 icon (teal color)
- **Group Details/About Page**: Location shown in "Group Information" section at the top
- **Conditional Display**: Only shows if group has a city value OR creator has a city value
- **Inheritance**: Groups inherit location from their creator if no explicit city is set

## Latest Updates (v2)

### My Groups Sidebar Widget
- **Location**: Right sidebar (replaces Trending Topics when on Groups tab)
- **Features**:
  - Shows all groups the user has joined
  - Displays group count badge
  - Shows group name and truncated description (5 words + ...)
  - Clickable cards that navigate to the group detail
  - Empty state for users with no joined groups
  - Gradient cards with hover effects

### Filter Simplification
- **Removed**: All Groups / My Groups toggle (from both desktop and mobile filters)
- **Reason**: "My Groups" moved to dedicated sidebar widget for better visibility
- **Current Filters**: Category dropdown only

### Real-Time Search with Highlighting
- **Search Fields**: Name, Description, Category, and Tags
- **Highlighting**: Matching text is highlighted in yellow across:
  - Group name
  - Group description
  - Category badge
  - Tags
- **Real-Time**: Results filter instantly as you type
- **Case-Insensitive**: Search works regardless of text case

## Changes Made

### 1. Group Filtering Logic (`frontend/app/posts/page.tsx`)

#### City-Based Filtering
- **Automatic City Filter**: Groups are now filtered to show only groups from the user's city
- **Admin Exception**: Admin users (`role === 'admin'`) can see ALL groups regardless of city
- **City Inheritance**: Groups inherit city from their creator if no explicit city is set
- **Implementation**: Added city check with role-based logic and inheritance in `filteredGroups` useMemo
```typescript
// Filter by user's city - only show groups from same city (EXCEPT for admins)
// Admins can see all groups regardless of location
// Groups inherit city from their creator
if (user?.city && user?.role !== 'admin') {
    filtered = filtered.filter(group => {
        const groupCity = group.city || group.creator?.city;
        return groupCity === user.city;
    });
}
```

#### Tag-Based Search
- **Search by Tags Only**: Group search now searches only through tags (not name or description)
- **Implementation**: Modified search filter
```typescript
// Search filter by tags
if (groupSearchText.trim() !== '') {
    const lower = groupSearchText.toLowerCase();
    filtered = filtered.filter(group =>
        (group.tags && group.tags.some(tag => tag.toLowerCase().includes(lower)))
    );
}
```

#### Filter Options
- **Category Filter**: Filter by group categories (Environmental Action, Community Service, etc.)
- **Real-Time Search**: Search groups by name, description, category, and tags with instant highlighting

### 2. UI Updates

#### Desktop Filters
**Removed:**
- Location dropdown (replaced with automatic city filtering)
- All Groups / My Groups toggle (moved to sidebar widget)

**Kept:**
- Category dropdown
- Search bar with real-time filtering

#### Mobile Filters
**Removed:**
- Location dropdown
- All Groups / My Groups toggle (moved to sidebar widget)

**Kept:**
- Category dropdown
- Search bar with real-time filtering

#### Search Bar
- Updated placeholder text to "Search groups..." when on groups tab
- Search filters by name, description, category, and tags in real-time
- Matching text is highlighted in yellow for easy scanning

#### Right Sidebar
**Groups Tab:**
- Shows "My Groups" widget with:
  - User's joined groups
  - Group count badge
  - Clickable cards to navigate to group detail
  - Truncated descriptions (5 words + ...)
  
**Other Tabs:**
- Shows Trending Topics (default behavior)

### 3. Group Card Redesign (`frontend/components/group-display.tsx`)

#### New Design Features
**Header Section:**
- Full-width gradient banner (or group image if available)
- Height: 128px (h-32)
- Privacy badge (Public/Private) - top right corner
- Creator badge (if user is creator) - top left corner

**Content Section:**
- Cleaner padding and spacing (p-5)
- Title: Bold, single line with ellipsis
- Category badge: Below title, rounded with color coding
- Description: 2 lines max with ellipsis
- Tags: Teal-themed badges (#tag format), max 3 visible + counter
- Stats bar: Member count and creation date, separated by border
- Action buttons: Full-width with modern styling

**Color Scheme:**
- Primary: Teal/Cyan gradient
- Tags: Teal-50 background with teal-600 text and teal-200 border
- Borders: Gray-200 with hover effect to teal-300
- Buttons: Rounded-lg with consistent styling

**Styling Changes:**
```css
/* Card */
- Border: border-gray-200 → border-teal-300 on hover
- Shadow: hover:shadow-lg
- Rounded: rounded-xl

/* Image Header */
- Gradient: from-teal-400 to-cyan-500
- Height: 32 (128px)

/* Tags */
- Background: bg-teal-50
- Text: text-teal-600
- Border: border-teal-200

/* Buttons */
- Rounded: rounded-lg
- Primary: bg-teal-500 hover:bg-teal-600
- Join: gradient from-teal-500 to-cyan-600
```

### 4. Text Highlighting Feature (`frontend/components/group-display.tsx`)

#### Implementation
Added `highlightText` helper function that:
- Takes text and search query as input
- Splits text by matching pattern
- Wraps matching parts in `<mark>` tags with yellow background
- Returns JSX with highlighted segments

#### Applied To
- Group name
- Group description
- Category badge
- Tags

#### Styling
```css
mark {
    background: bg-yellow-200
    text: text-gray-900
    border-radius: rounded
    padding: px-0.5
}
```

### 5. State Management

#### Removed States
- `selectedLocation` - No longer needed as city filtering is automatic
- `groupFilter` - Removed (replaced with sidebar widget)

#### Active States
- `selectedGroupCategory` - Category filter
- `groupSearchText` - Real-time search query
- `myGroups` - useMemo for user's joined groups (for sidebar)

### 6. Location Display

#### City Inheritance Logic
- Groups automatically inherit city from their creator
- Display logic: `group.city || group.creator?.city`
- Filtering logic: Uses the same inheritance pattern
- Ensures all groups have a location if their creator has one

#### Group Cards
- City/location displayed in stats section
- Shows with 📍 icon in teal color
- Positioned below member count
- Displays group's city or falls back to creator's city
- Only displays if either city value exists

#### Group Details Page (Info/About Tab)
- Location shown in "Group Information" section (renamed from "Group Settings")
- Displayed at the top of the information list
- Shows with 📍 emoji icon
- Font-weight: medium, color: gray-900
- Displays group's city or falls back to creator's city
- Conditional rendering (only if either city exists)

### 7. Display Updates
- Groups count now shows filtered count: `${filteredGroups.length} groups found`
- GroupList component receives `filteredGroups` and `searchText` props
- Right sidebar conditionally shows "My Groups" widget on groups tab
- My Groups widget displays truncated descriptions (5 words + ...)
- Clickable group cards in sidebar navigate to group detail
- Location displayed on group cards and detail pages

## Backend Requirements

### Groups Schema Update Needed
The backend Group model should include city in the creator object and optionally in the group itself:

```typescript
interface Group {
    // ... existing fields
    creator: {
        _id: string;
        name: string;
        email: string;
        city?: string; // REQUIRED: Inherit city from creator
    };
    city?: string; // OPTIONAL: Override city for group (if different from creator)
}
```

### Implementation in Backend:
1. **Group Creation**: 
   - Automatically set `group.city = creator.city` when creating a group
   - Or allow creator to override during creation
   
2. **Filtering Logic**:
   - Frontend already implements: `const groupCity = group.city || group.creator?.city`
   - Backend should populate creator.city in API responses

3. **Group Updates**:
   - Allow creator/admins to update group.city
   - Displayed on group cards and detail pages
   - Used for location-based filtering (except for admin users)

**Current State**: 
- Frontend is ready with inheritance logic
- Groups will display creator's city as fallback
- City-based filtering checks both group.city and creator.city

## Filter Flow

### Groups Tab Filtering
1. **City Filter** (Automatic) → Only shows groups from user's city (EXCEPT for admins who see all)
2. **Category** → Filter by selected category
3. **Real-Time Search** → Searches name, description, category, and tags with instant highlighting

### Role-Based Access
- **Regular Users**: See only groups from their city
- **Admin Users**: See ALL groups from ALL cities (no location restriction)
- **Purpose**: Enables admin moderation and management across the platform

### User Experience
- Users see only groups from their city automatically
- Location dropdown removed - simplifies UI
- Real-time search with highlighting makes finding groups instant and intuitive
- "My Groups" sidebar provides quick access to joined groups
- Click any group in sidebar to navigate directly to group detail
- Modern card design improves visual hierarchy
- Search highlights matching text in yellow for easy scanning

## Testing Checklist

### Filtering & Search
- [ ] Verify groups show only from user's city (once backend updated)
- [ ] Test that admin users see ALL groups regardless of city
- [ ] Test category filtering
- [ ] Test real-time search functionality
- [ ] Verify text highlighting works for name, description, category, and tags
- [ ] Test search with special characters
- [ ] Verify highlighting case-insensitivity

### My Groups Sidebar
- [ ] Test "My Groups" sidebar widget displays correctly
- [ ] Click groups in sidebar to verify navigation to group detail
- [ ] Verify group count badge in sidebar
- [ ] Test empty state when user has no joined groups
- [ ] Test description truncation (5 words + ...) in sidebar

### Group Cards & Display
- [ ] Verify card design matches reference
- [ ] Check location/city display on group cards (📍 icon)
- [ ] Verify location only shows when group has city value
- [ ] Test join/leave group actions
- [ ] Verify creator badge shows correctly
- [ ] Verify privacy badge (Public/Private) displays correctly
- [ ] Check tag display and +N counter

### Group Details Page
- [ ] Open group detail page and go to Info/About tab
- [ ] Verify location shows in "Group Information" section
- [ ] Confirm location appears at the top of the information list
- [ ] Test with groups that have no city (should not display location)

### Responsive & Roles
- [ ] Test responsive design on mobile
- [ ] Test as regular user (should see city-filtered groups)
- [ ] Test as admin user (should see ALL groups)
- [ ] Verify admin badge/indicator if applicable

## Files Modified

1. `frontend/app/posts/page.tsx`
   - Updated filtering logic for real-time search
   - Added admin role check: `user?.role !== 'admin'` to bypass city filtering for admins
   - Added `user?.role` to filteredGroups useMemo dependencies
   - Removed location filter UI (desktop & mobile)
   - Removed All Groups / My Groups toggle (desktop & mobile)
   - Updated search placeholder to "Search groups..."
   - Modified filteredGroups useMemo to search name, description, category, and tags
   - Added myGroups useMemo for sidebar
   - Added "My Groups" sidebar widget with conditional rendering
   - Sidebar shows on groups tab, trending topics on other tabs
   - Pass searchText prop to GroupList
   - Removed groupFilter state variable

2. `frontend/components/group-display.tsx`
   - Complete card redesign
   - New header with image/gradient
   - Updated badges and tags
   - Modern button styling
   - Added highlightText helper function
   - Added searchText prop to GroupCard and GroupList
   - Implemented text highlighting for name, description, category, and tags
   - Yellow highlight with rounded corners and padding
   - Added `city?: string` to both Group interface and creator object
   - Added location display in stats section with 📍 icon (teal color)
   - Conditional rendering with fallback: `group.city || group.creator?.city`

3. `frontend/components/group-details.tsx`
   - Renamed "Group Settings" section to "Group Information"
   - Added location/city display at the top of information section
   - Location shows with 📍 emoji and medium font weight
   - Conditional rendering with fallback: `group.city || group.creator?.city`
   - Shows city from group or inherits from creator

4. `frontend/contexts/groups-context.tsx`
   - Added `city?: string` field to Group interface
   - Added `city?: string` field to creator object within Group interface
   - Enables location data and inheritance for all group operations

## Notes

- City filtering is prepared but requires backend to add `city` field to groups
- Real-time search provides instant feedback with text highlighting
- New design improves information hierarchy and visual appeal
- Removed location dropdown and All/My Groups toggle simplifies UI
- "My Groups" sidebar widget provides dedicated space for user's joined groups
- Text highlighting uses native `<mark>` element with custom styling
- Search is case-insensitive for better user experience
- Description truncation in sidebar ensures consistent card heights

## Key Features Summary

### ✨ Real-Time Search with Highlighting
- **What**: Instant filtering as you type with yellow highlighted matches
- **Where**: Searches across group name, description, category, and tags
- **Why**: Makes finding specific groups fast and intuitive

### 📋 My Groups Sidebar
- **What**: Dedicated widget showing user's joined groups
- **Where**: Right sidebar (replaces trending topics on groups tab)
- **Why**: Quick access to joined groups without cluttering filters
- **Features**: Click to navigate, count badge, truncated descriptions

### 🎯 Simplified Filters
- **What**: Category dropdown only
- **Removed**: All/My Groups toggle (moved to sidebar), Location dropdown (automatic)
- **Why**: Less clutter, better UX, dedicated sidebar for "My Groups"

### 👑 Admin Privileges
- **What**: Admins can see all groups regardless of city/location
- **How**: City filtering bypassed when `user.role === 'admin'`
- **Why**: Enables platform-wide moderation and management

### 📍 Location Display & Inheritance
- **What**: Group location/city displayed on cards and detail pages
- **Inheritance**: Groups automatically inherit city from their creator
- **Logic**: `group.city || group.creator?.city` (fallback pattern)
- **Where**: 
  - Group cards: Stats section with 📍 icon
  - Group details: "Group Information" section at top
- **Why**: Provides geographic context for groups, ensures all groups have location if creator has one
