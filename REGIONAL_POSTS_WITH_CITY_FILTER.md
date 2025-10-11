# Regional Posts with City Filter Enhancement

## Summary of Changes

Implemented smart post filtering based on user's selection of "All Posts" vs "Regional Posts" with dynamic city selection and post counts.

---

## 1. **Regional Posts Filtering** 🌍

### New Behavior:

#### When "Regional Posts" is Selected:
- ✅ Shows **only posts from the user's city**
- ✅ City filter dropdown is **hidden** (not needed)
- ✅ Automatically filters to user's city
- ✅ Cleaner interface - less clutter

#### When "All Posts" is Selected:
- ✅ Shows **all posts from all cities**
- ✅ City filter dropdown is **visible**
- ✅ User can filter by specific city
- ✅ Each city shows **post count** in dropdown

---

## 2. **Implementation Details**

### A. User Interface Updated (`auth-context.tsx`)

Added `city` field to User interface:

```typescript
export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points: number;
  coins: number;
  volunteeredHours: number;
  totalRewards: number;
  completedEvents: string[];
  createdAt: string;
  profilePicture?: string;
  cloudinaryPublicId?: string;
  city?: string;  // ✅ Added for regional filtering
}
```

---

### B. City List with Post Counts

**Before:**
```typescript
const availableCities = useMemo(() => {
    const cities = new Set<string>();
    posts.forEach(post => {
        if (post.city && post.city !== 'global') {
            cities.add(post.city);
        }
    });
    return Array.from(cities).sort();
}, [posts]);
```

**After:**
```typescript
const availableCities = useMemo(() => {
    const cityCountMap = new Map<string, number>();
    posts.forEach(post => {
        if (post.city && post.city !== 'global') {
            cityCountMap.set(post.city, (cityCountMap.get(post.city) || 0) + 1);
        }
    });
    // Convert to array of objects with city and count
    return Array.from(cityCountMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => a.city.localeCompare(b.city));
}, [posts]);
```

**Result:**
- Returns: `[{ city: 'Delhi', count: 5 }, { city: 'Mumbai', count: 12 }, ...]`
- Sorted alphabetically by city name
- Includes post count for each city

---

### C. Enhanced Filtering Logic

**New filtering flow:**

```typescript
const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // 1. Filter by post type (regional or all)
    if (postFilter === 'regional' && user?.city) {
        // For regional posts, only show posts from user's city
        filtered = filtered.filter(post => post.city === user.city);
    }
    
    // 2. Category filter
    if (selectedCategory !== 'All') {
        filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // 3. Time filter
    if (selectedTime !== 'all') {
        // ... time filtering logic
    }
    
    // 4. City filter (only applies when "All Posts" is selected)
    if (postFilter === 'all' && selectedCity !== 'All') {
        filtered = filtered.filter(post => post.city === selectedCity);
    }
    
    // 5. Search filter
    if (searchText.trim() !== '') {
        // ... search logic
    }
    
    return filtered;
}, [posts, selectedCategory, selectedTime, selectedCity, searchText, postFilter, user?.city]);
```

**Key Points:**
- Regional filtering happens **first** (highest priority)
- City filter only applies for "All Posts" mode
- Depends on `user.city` for regional filtering

---

### D. Conditional City Dropdown Display

#### Desktop Filters:

**Before:**
```tsx
<div className="flex-1 min-w-[150px]">
    <select value={selectedCity} ...>
        <option value="All">📍 All Cities</option>
        {availableCities.map(city => (
            <option key={city} value={city}>
                📍 {city}
            </option>
        ))}
    </select>
</div>
```

**After:**
```tsx
{postFilter === 'all' && (  // ✅ Only show for "All Posts"
    <div className="flex-1 min-w-[150px]">
        <select value={selectedCity} ...>
            <option value="All">📍 All Cities</option>
            {availableCities.map(({ city, count }) => (
                <option key={city} value={city}>
                    📍 {city} ({count})  {/* ✅ Show post count */}
                </option>
            ))}
        </select>
    </div>
)}
```

#### Mobile Filters:

Same conditional logic applied:
```tsx
{postFilter === 'all' && (
    <select value={selectedCity} ...>
        <option value="All">📍 All Cities</option>
        {availableCities.map(({ city, count }) => (
            <option key={city} value={city}>
                📍 {city} ({count})
            </option>
        ))}
    </select>
)}
```

---

### E. Auto-Reset City Selection

Added useEffect to reset city selection when switching to Regional Posts:

```typescript
useEffect(() => {
    if (postFilter === 'regional') {
        setSelectedCity('All');
    }
}, [postFilter]);
```

**Why?**
- When switching from "All Posts" to "Regional Posts", any previously selected city should be cleared
- Prevents confusing state where city filter is set but not visible
- Ensures clean state transition

---

## 3. **User Experience Flow**

### Scenario 1: User in Mumbai Selects "Regional Posts"

```
┌─────────────────────────────────────────────────────────────┐
│ Filter: [All Posts] [Regional Posts ✓]                     │
├─────────────────────────────────────────────────────────────┤
│ City dropdown: HIDDEN                                       │
│                                                              │
│ Showing posts from: Mumbai (user's city)                   │
│                                                              │
│ Post 1: Mumbai Cleanup Drive                               │
│ [🤝 Volunteer] [📍 Mumbai]                                  │
│                                                              │
│ Post 2: Mumbai Tree Plantation                             │
│ [🌱 Environmental] [📍 Mumbai]                              │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 2: User Selects "All Posts"

```
┌─────────────────────────────────────────────────────────────┐
│ Filter: [All Posts ✓] [Regional Posts]                     │
├─────────────────────────────────────────────────────────────┤
│ City: [📍 All Cities ▼]                                    │
│       - 📍 All Cities                                       │
│       - 📍 Delhi (8)                                        │
│       - 📍 Mumbai (12)                                      │
│       - 📍 Pune (5)                                         │
│                                                              │
│ Showing all posts from all cities                          │
│                                                              │
│ Post 1: Delhi Food Drive                                   │
│ [🍲 Community Service] [📍 Delhi]                           │
│                                                              │
│ Post 2: Mumbai Beach Cleanup                               │
│ [🌱 Environmental] [📍 Mumbai]                              │
│                                                              │
│ Post 3: Pune Education Drive                               │
│ [📚 Education] [📍 Pune]                                    │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 3: User Filters "All Posts" by Delhi

```
┌─────────────────────────────────────────────────────────────┐
│ Filter: [All Posts ✓] [Regional Posts]                     │
├─────────────────────────────────────────────────────────────┤
│ City: [📍 Delhi (8) ▼]  ← Selected specific city          │
│                                                              │
│ Showing 8 posts from Delhi                                 │
│                                                              │
│ Post 1: Delhi Food Drive                                   │
│ [🍲 Community Service] [📍 Delhi]                           │
│                                                              │
│ Post 2: Delhi Environmental Action                         │
│ [🌱 Environmental] [📍 Delhi]                               │
│                                                              │
│ ... (6 more Delhi posts)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. **Filter Visibility Rules**

| Filter Type | Regional Posts | All Posts |
|-------------|---------------|-----------|
| **Post Type Toggle** | ✅ Visible | ✅ Visible |
| **City Dropdown** | ❌ Hidden | ✅ Visible |
| **Category Filter** | ✅ Visible | ✅ Visible |
| **Time Filter** | ✅ Visible | ✅ Visible |
| **Sort Buttons** | ✅ Visible | ✅ Visible |

---

## 5. **City Dropdown Format**

### Display Format:
```
📍 All Cities
📍 Ahmedabad (3)
📍 Bangalore (7)
📍 Chennai (5)
📍 Delhi (8)
📍 Hyderabad (4)
📍 Kolkata (6)
📍 Mumbai (12)
📍 Pune (5)
```

### Features:
- ✅ MapPin icon (📍) for visual consistency
- ✅ City name
- ✅ Post count in parentheses
- ✅ Alphabetically sorted
- ✅ "All Cities" option at top

---

## 6. **Benefits**

### For Users:
1. **Cleaner Interface** - City filter hidden when not needed
2. **Better Context** - See post counts before filtering
3. **Regional Focus** - Easy to view only local posts
4. **Exploration** - Can browse all cities when desired
5. **Smart Defaults** - Automatic reset when switching modes

### For Platform:
1. **Location-Based Engagement** - Users see relevant local content
2. **Discovery** - Users can explore other cities
3. **Data Transparency** - Post counts show activity levels
4. **Better UX** - Contextual UI based on selection
5. **Scalability** - Works with any number of cities

---

## 7. **Technical Details**

### Dependencies:
- `user.city` - Must be set in user profile
- `post.city` - Must be present in post data
- `postFilter` - State: 'all' | 'regional'
- `selectedCity` - State: city name or 'All'

### Performance:
- ✅ `useMemo` for city list computation
- ✅ `useMemo` for filtered posts
- ✅ Efficient Map-based counting
- ✅ Single-pass iteration for counts

### Edge Cases Handled:
- ✅ User without city → No regional filtering
- ✅ Empty post list → Empty city dropdown
- ✅ Global posts excluded from city list
- ✅ City filter reset on mode switch
- ✅ Search works across all filters

---

## 8. **Testing Checklist**

### Functionality Testing:
- [ ] Regional Posts shows only user's city posts
- [ ] All Posts shows all posts from all cities
- [ ] City dropdown visible only for All Posts
- [ ] City dropdown hidden for Regional Posts
- [ ] Post counts display correctly next to city names
- [ ] City filter works when "All Posts" selected
- [ ] City selection resets when switching to Regional
- [ ] Category filter works in both modes
- [ ] Time filter works in both modes
- [ ] Search works in both modes

### Visual Testing:
- [ ] Desktop: City dropdown appears/disappears smoothly
- [ ] Mobile: City dropdown appears/disappears smoothly
- [ ] Post counts display correctly formatted
- [ ] Layout doesn't break when city dropdown hidden
- [ ] MapPin icons display correctly

### Edge Cases:
- [ ] User without city set (regional posts behavior)
- [ ] No posts available (empty dropdown)
- [ ] Only one city has posts
- [ ] Switch between modes rapidly
- [ ] Apply multiple filters together

---

## 9. **Files Modified**

### 1. `frontend/contexts/auth-context.tsx`
**Change:** Added `city?: string;` to User interface
**Reason:** Enable regional filtering based on user's city

### 2. `frontend/app/posts/page.tsx`
**Changes:**
- Updated `availableCities` to return `{ city, count }[]` instead of `string[]`
- Enhanced filtering logic to prioritize regional filter
- Added city filter condition: only applies when `postFilter === 'all'`
- Wrapped city dropdown in conditional: `{postFilter === 'all' && (...)}`
- Updated city options to display: `📍 {city} ({count})`
- Added useEffect to reset city selection on mode switch
- Updated dependency arrays for useMemo/useEffect

---

## 10. **Migration Notes**

### If User Data Doesn't Have City:
If existing users don't have `city` set in their profile:
1. Regional Posts will show no posts (user.city is undefined)
2. All Posts will work normally
3. Need to prompt users to update their profile with city

### Recommended Approach:
```typescript
// In filtering logic
if (postFilter === 'regional' && user?.city) {
    filtered = filtered.filter(post => post.city === user.city);
} else if (postFilter === 'regional' && !user?.city) {
    // Show message: "Please set your city in profile for regional posts"
    filtered = [];
}
```

---

## 11. **Future Enhancements**

### Potential Improvements:
1. **Nearby Cities** - Include nearby cities in regional view (e.g., within 50km)
2. **City Clustering** - Group nearby cities (e.g., "Mumbai Metropolitan")
3. **Visual Map** - Show posts on a map view
4. **Popular Cities** - Highlight cities with most posts
5. **City Autocomplete** - Search for cities instead of dropdown
6. **Save Preferences** - Remember last selected city
7. **Multiple Cities** - Allow filtering by multiple cities at once

---

## Summary

✅ **Regional Posts** → Shows only user's city posts, hides city dropdown  
✅ **All Posts** → Shows all posts, displays city dropdown with counts  
✅ **Post Counts** → Each city shows number of posts: `Mumbai (12)`  
✅ **Smart UI** → City filter appears/disappears based on selection  
✅ **Auto-Reset** → City selection clears when switching to Regional  
✅ **Better UX** → Contextual interface based on user's choice  
✅ **Efficient** → Optimized with useMemo and Map data structure  
✅ **Scalable** → Works with unlimited number of cities  

The system now provides a clean, intuitive filtering experience that adapts to user needs! 🎯
