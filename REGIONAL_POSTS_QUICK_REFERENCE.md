# Quick Reference - Regional Posts & City Filtering

## 🎯 Key Changes

### 1. Regional Posts Behavior
- **Shows:** Only posts from user's city
- **Hides:** City filter dropdown
- **Requires:** User must have `city` set in profile

### 2. All Posts Behavior
- **Shows:** All posts from all cities
- **Displays:** City filter dropdown with post counts
- **Format:** `📍 Mumbai (12)`

---

## 📋 Filter Visibility Matrix

```
┌─────────────────┬──────────────────┬─────────────┐
│ Filter          │ Regional Posts   │ All Posts   │
├─────────────────┼──────────────────┼─────────────┤
│ Post Type       │ ✅ Visible       │ ✅ Visible  │
│ City Dropdown   │ ❌ Hidden        │ ✅ Visible  │
│ Category        │ ✅ Visible       │ ✅ Visible  │
│ Time Period     │ ✅ Visible       │ ✅ Visible  │
│ Sort            │ ✅ Visible       │ ✅ Visible  │
└─────────────────┴──────────────────┴─────────────┘
```

---

## 🔄 Filtering Flow

### Regional Posts Flow:
```
User Clicks "Regional Posts"
    ↓
System checks user.city
    ↓
Filter posts where post.city === user.city
    ↓
Hide city dropdown
    ↓
Apply other filters (category, time, search)
```

### All Posts Flow:
```
User Clicks "All Posts"
    ↓
Show all posts from all cities
    ↓
Display city dropdown with counts
    ↓
User selects specific city (optional)
    ↓
Filter to selected city (if any)
    ↓
Apply other filters (category, time, search)
```

---

## 💾 Code Snippets

### City List with Counts:
```typescript
const availableCities = useMemo(() => {
    const cityCountMap = new Map<string, number>();
    posts.forEach(post => {
        if (post.city && post.city !== 'global') {
            cityCountMap.set(post.city, (cityCountMap.get(post.city) || 0) + 1);
        }
    });
    return Array.from(cityCountMap.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => a.city.localeCompare(b.city));
}, [posts]);
```

### Filtering Logic:
```typescript
const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // 1. Regional filter (highest priority)
    if (postFilter === 'regional' && user?.city) {
        filtered = filtered.filter(post => post.city === user.city);
    }
    
    // 2. City filter (only for "All Posts")
    if (postFilter === 'all' && selectedCity !== 'All') {
        filtered = filtered.filter(post => post.city === selectedCity);
    }
    
    // 3. Other filters...
    
    return filtered;
}, [posts, postFilter, user?.city, selectedCity, ...]);
```

### Conditional City Dropdown:
```tsx
{postFilter === 'all' && (
    <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
        <option value="All">📍 All Cities</option>
        {availableCities.map(({ city, count }) => (
            <option key={city} value={city}>
                📍 {city} ({count})
            </option>
        ))}
    </select>
)}
```

### Auto-Reset on Mode Switch:
```typescript
useEffect(() => {
    if (postFilter === 'regional') {
        setSelectedCity('All');
    }
}, [postFilter]);
```

---

## 📱 Visual Examples

### Regional Posts (Mumbai User):
```
┌────────────────────────────────────┐
│ [All Posts] [Regional Posts ✓]    │
│                                    │
│ Category: [All ▼]                  │
│ Time: [All Time ▼]                 │
│ ← No City Dropdown                 │
│                                    │
│ Showing: 12 posts from Mumbai     │
└────────────────────────────────────┘
```

### All Posts with City Filter:
```
┌────────────────────────────────────┐
│ [All Posts ✓] [Regional Posts]    │
│                                    │
│ City: [📍 All Cities ▼]           │
│       • All Cities                 │
│       • Delhi (8)                  │
│       • Mumbai (12)                │
│       • Pune (5)                   │
│                                    │
│ Category: [All ▼]                  │
│ Time: [All Time ▼]                 │
│                                    │
│ Showing: All posts                 │
└────────────────────────────────────┘
```

---

## ⚙️ Files Modified

1. **`frontend/contexts/auth-context.tsx`**
   - Added `city?: string` to User interface

2. **`frontend/app/posts/page.tsx`**
   - Updated `availableCities` to return `{ city, count }[]`
   - Enhanced filtering with regional priority
   - Conditional city dropdown rendering
   - Auto-reset city selection
   - Updated dropdown to show counts

---

## ✅ Testing Quick Checklist

### Essential Tests:
- [ ] Regional Posts filters to user's city only
- [ ] All Posts shows all cities
- [ ] City dropdown appears/disappears correctly
- [ ] Post counts are accurate
- [ ] City selection resets on mode switch
- [ ] Works on both desktop and mobile

---

## 🚀 Usage

### As a Mumbai User:
1. **Click "Regional Posts"** → See only Mumbai posts
2. **Click "All Posts"** → See all posts, city dropdown appears
3. **Select "Delhi (8)"** → See only 8 Delhi posts
4. **Select "All Cities"** → See all posts again

### Post Count Format:
```
📍 Ahmedabad (3)    → 3 posts
📍 Mumbai (12)      → 12 posts
📍 Delhi (8)        → 8 posts
```

---

## 🎯 Key Benefits

✅ **Cleaner Interface** - No clutter when not needed  
✅ **Location Context** - See post distribution  
✅ **Regional Focus** - Easy local content access  
✅ **Smart Defaults** - Auto-resets for consistency  
✅ **Scalable** - Works with unlimited cities  
✅ **Transparent** - Show activity levels per city  
