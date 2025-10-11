# City Tag Always Visible Update

## Summary

Changed the post display to **always show city tags** regardless of filter selection.

---

## Change Made

### Posts Page (`frontend/app/posts/page.tsx`)

**Before:**
```tsx
<PostDisplay 
    key={post._id} 
    post={post} 
    searchText={searchText} 
    showCityTag={postFilter === 'all'}  // Only showed on "All Posts"
/>
```

**After:**
```tsx
<PostDisplay 
    key={post._id} 
    post={post} 
    searchText={searchText} 
    showCityTag={true}  // ✅ Always show city tags
/>
```

---

## Behavior

### Previous Behavior:
- **"All Posts" filter** → City tags visible ✅
- **"Regional Posts" filter** → City tags hidden ❌

### New Behavior:
- **"All Posts" filter** → City tags visible ✅
- **"Regional Posts" filter** → City tags visible ✅

---

## Visual Result

All posts will now display their city location badge:

```
┌─────────────────────────────────────────────────────────────┐
│ Post Title                                                   │
│ [🤝 Volunteer Experience] [📍 Mumbai]  ← Always visible     │
│ Great volunteering experience at...                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Another Post                                                 │
│ [🌱 Environmental Action] [📍 Delhi]   ← Always visible     │
│ Tree plantation drive was amazing...                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified

- **`frontend/app/posts/page.tsx`**
  - Changed `showCityTag={postFilter === 'all'}` to `showCityTag={true}`

---

## Note

The `PostDisplay` component still supports the `showCityTag` prop for backward compatibility and flexibility. By passing `true`, we ensure city tags are always displayed regardless of the filter selection.

If you want to completely remove the conditional logic in the future, you can:
1. Remove the `showCityTag` prop from `PostDisplay` component
2. Remove the condition from `post-display.tsx`

But keeping it allows for easy toggling in the future if needed.
