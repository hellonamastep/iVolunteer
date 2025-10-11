# Community Post Filters Enhancement

## Summary of Changes

### 1. **Simplified Post View Toggle** 🌍
Added a prominent toggle between two main viewing modes:
- **All Posts**: Shows all posts from everywhere (sets `showAllPosts=true`)
- **Regional Posts**: Shows only posts from user's region (sets `showAllPosts=false`)

### 2. **Dynamic City Filter** 📍
Implemented automatic city dropdown population:

#### How It Works:
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

#### Features:
- **Auto-populating**: Cities are automatically extracted from available posts
- **Dynamic**: Updates whenever new posts are created
- **Sorted**: Cities appear in alphabetical order
- **Excludes global**: Filters out 'global' posts (admin posts)
- **No duplicates**: Uses Set to ensure unique cities only

### 3. **Maintained All Filter Options** ⚙️

#### Desktop Filters (Horizontal Layout):
1. **Post Type Toggle**
   - All Posts button (with Globe icon)
   - Regional Posts button (with MapPin icon)
   - Styled with bg-gray-100 container

2. **City Dropdown**
   - Shows "📍 All Cities" as default
   - Dynamically populated with available cities
   - Icon prefix for visual clarity

3. **Category Dropdown**
   - All 12 categories available
   - "✨" icon prefix
   - Includes: Volunteer Experience, Community Service, etc.

4. **Time Period Dropdown**
   - All Time (default)
   - Last 24 Hours
   - Last 7 Days
   - Last 30 Days
   - "⏰" icon prefix

5. **Sort Buttons**
   - Recent (with Clock icon)
   - Trending (with TrendingUp icon)
   - Different styling for active state

#### Mobile Filters (Vertical Stack):
Same filters but arranged vertically for better mobile UX:
- Post type toggle buttons (full width)
- City dropdown (full width)
- Category dropdown (full width)
- Time dropdown (full width)

### 4. **Location Tags on Posts** 🏷️

Added location display to every post card:

```tsx
{post.city && (
    <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200 font-medium px-2 py-0.5 text-xs"
    >
        <MapPin className="w-3 h-3 inline mr-0.5" />
        {post.city === 'global' ? 'Global' : post.city}
    </Badge>
)}
```

#### Location Badge Features:
- **Beautiful gradient**: Teal to cyan gradient background
- **Icon**: MapPin icon for visual identification
- **Smart display**: Shows "Global" for admin posts, actual city name for user posts
- **Compact**: Small badge that doesn't overwhelm the design
- **Positioned**: Next to category badge for easy scanning
- **Always visible**: Shows on both "All Posts" and "Regional Posts" views

### 5. **Enhanced Filtering Logic** 🔍

Complete filter implementation:

```typescript
const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // Category filter
    if (selectedCategory !== 'All') {
        filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // Time filter
    if (selectedTime !== 'all') {
        const now = new Date();
        let compareDate = null;
        if (selectedTime === '24h') compareDate = subDays(now, 1);
        else if (selectedTime === '7d') compareDate = subDays(now, 7);
        else if (selectedTime === '30d') compareDate = subDays(now, 30);
        if (compareDate) {
            filtered = filtered.filter(post => 
                isAfter(new Date(post.createdAt), compareDate)
            );
        }
    }
    
    // City filter
    if (selectedCity !== 'All') {
        filtered = filtered.filter(post => post.city === selectedCity);
    }
    
    // Search filter
    if (searchText.trim() !== '') {
        const lower = searchText.toLowerCase();
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(lower) ||
            post.description.toLowerCase().includes(lower) ||
            post.city.toLowerCase().includes(lower)
        );
    }
    
    return filtered;
}, [posts, selectedCategory, selectedTime, selectedCity, searchText]);
```

### 6. **Updated Post Interface** 📝

Added city field to Post interface:

```typescript
export interface Post {
    _id: string;
    user: { ... };
    title: string;
    category: string;
    description: string;
    city: string;  // ✅ Added
    imageUrl: string;
    cloudinaryPublicId: string;
    comments: Comment[];
    reactions: Reaction[];
    createdAt: string;
    updatedAt: string;
}
```

---

## User Experience Flow

### Scenario 1: User Wants to See All Posts
1. Click **"All Posts"** button
2. See posts from all regions
3. Each post shows its location badge
4. Can still filter by:
   - Specific city (from dropdown)
   - Category
   - Time period
   - Search keyword

### Scenario 2: User Wants Regional Content
1. Click **"Regional Posts"** button (default)
2. See only posts from their region
3. Each post still shows location badge
4. Can further filter by:
   - Specific city within region
   - Category
   - Time period
   - Search keyword

### Scenario 3: User Wants Mumbai Posts Only
1. Select "📍 Mumbai" from city dropdown
2. See only Mumbai posts
3. Works in both "All Posts" and "Regional Posts" modes
4. Can combine with category and time filters

---

## Visual Design

### Filter Bar Layout (Desktop):
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔧 Filters                                                       │
├─────────────────────────────────────────────────────────────────┤
│ [All Posts | Regional] [📍 Cities▼] [✨ Category▼] [⏰ Time▼]   │
│                                    [Recent] [Trending] ──────────│
└─────────────────────────────────────────────────────────────────┘
```

### Post Card with Location:
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 John Doe                                         ⋮       │
│ 🕐 Dec 15, 2024                                             │
│                                                              │
│ [🤝 Volunteer Experience] [📍 Mumbai]                       │
│                                                              │
│ Tree Plantation Drive at Marine Drive                       │
│ We planted 50 trees today...                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

### For Users:
1. **Easy Discovery**: See where posts are from at a glance
2. **Smart Filtering**: Only see cities that have actual posts
3. **Flexible Views**: Switch between global and local perspectives
4. **Combined Filters**: Mix and match multiple filters
5. **Better Context**: Location badges provide geographic context

### For Platform:
1. **Dynamic**: No manual city list maintenance
2. **Scalable**: Automatically grows with new cities
3. **Clean UX**: Simple two-mode toggle for complexity
4. **Consistent**: Location shown regardless of view mode
5. **Search Enhanced**: Can search by city name too

---

## Technical Details

### State Management:
- `postFilter`: 'all' | 'regional' - Controls API call
- `showAllPosts`: boolean - Passed to API
- `selectedCity`: string - Local filter after fetch
- `selectedCategory`: string - Filters posts by type
- `selectedTime`: string - Filters by date range
- `availableCities`: string[] - Auto-computed from posts

### Filter Priority:
1. **API Level**: showAllPosts (all vs regional)
2. **Client Level**: 
   - City filter
   - Category filter
   - Time filter
   - Search filter

### Performance:
- `useMemo` for city extraction (only recomputes when posts change)
- `useMemo` for filtered posts (efficient dependency tracking)
- Sorted cities for better UX
- Set data structure for deduplication

---

## Example Use Cases

### Use Case 1: Mumbai Volunteer Finding Environmental Posts
- Filter: "Regional Posts" + "📍 Mumbai" + "✨ Environmental Action"
- Result: Only environmental posts from Mumbai

### Use Case 2: Admin Checking All Recent Posts
- Filter: "All Posts" + "⏰ Last 7 Days"
- Result: All posts from everywhere in the last week

### Use Case 3: User Exploring Nearby Healthcare Posts
- Filter: "Regional Posts" + "✨ Healthcare Initiative" + "⏰ Last 24 Hours"
- Result: Recent healthcare posts from their region

---

## Files Modified

1. **frontend/contexts/post-context.tsx**
   - Added `city: string` to Post interface

2. **frontend/app/posts/page.tsx**
   - Added `postFilter` state
   - Added `selectedCity` state
   - Added `availableCities` computed from posts
   - Updated desktop filters layout
   - Updated mobile filters layout
   - Enhanced filtering logic with city filter
   - Integrated location search

3. **frontend/components/post-display.tsx**
   - Added MapPin icon import
   - Added location badge display
   - Styled with gradient teal background
   - Positioned next to category badge

---

## Summary

✅ **All Posts / Regional Posts** toggle for simple view switching
✅ **Dynamic city dropdown** auto-populated from actual posts
✅ **Location badges** displayed on every post
✅ **All filters functional**: Category, Time, City, Search
✅ **Responsive design** for desktop and mobile
✅ **Smart filtering** with multiple criteria combination
✅ **Beautiful UI** with gradients and icons
