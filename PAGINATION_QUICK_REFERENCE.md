# Quick Reference: Adding Pagination to Any Page

This guide shows you how to quickly add pagination to any page using the reusable Pagination component.

## Step-by-Step Guide

### Step 1: Import the Pagination Component
```typescript
import Pagination from "@/components/Pagination";
```

### Step 2: Add State Variables
```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 80; // Adjust as needed (10, 20, 25, etc.)
```

### Step 3: Calculate Pagination Values
```typescript
// Calculate total pages
const totalPages = Math.ceil(yourItems.length / itemsPerPage);

// Calculate slice indices
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

// Get current page items
const currentItems = yourItems.slice(startIndex, endIndex);
```

### Step 4: Create Page Change Handler
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page);
};
```

### Step 5: Update Your Render Logic
Replace your items mapping:
```typescript
// OLD: Render all items
{yourItems.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}

// NEW: Render only current page items
{currentItems.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}
```

### Step 6: Add Pagination Component
```typescript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={itemsPerPage}
  totalItems={yourItems.length}
/>
```

### Step 7 (Optional): Reset on Filter/Search Changes
If your page has filters or search, reset to page 1 when they change:
```typescript
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, selectedFilter, sortBy]);
```

## Complete Example

```typescript
"use client";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

const YourPage = () => {
  // Your existing state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 80;

  // Fetch your data
  useEffect(() => {
    fetchItems();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Your page header */}
      <h1>Your Page</h1>

      {/* Render current items */}
      <div className="items-container">
        {currentItems.map((item) => (
          <div key={item.id}>
            {/* Your item component */}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={items.length}
      />
    </div>
  );
};

export default YourPage;
```

## With Filters/Search Example

```typescript
"use client";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

const YourPageWithFilters = () => {
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 80;

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination on filtered items
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Search and filters */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="all">All Categories</option>
        {/* Your categories */}
      </select>

      {/* Render filtered items */}
      <div>
        {currentItems.map((item) => (
          <div key={item.id}>{/* Your item */}</div>
        ))}
      </div>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredItems.length}
        />
      )}
    </div>
  );
};

export default YourPageWithFilters;
```

## Customization Options

### Change Items Per Page
```typescript
const itemsPerPage = 80; // Show 20 items per page
```

### Hide Item Count
```typescript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  // Don't pass itemsPerPage and totalItems
/>
```

### Different Styling
The component uses Tailwind classes. You can:
1. Modify the component directly in `components/Pagination.tsx`
2. Override classes using CSS modules
3. Wrap it in a styled component

### Custom Scroll Behavior
Edit the `handlePageChange` function in `Pagination.tsx`:
```typescript
// Default: Smooth scroll to top
window.scrollTo({ top: 0, behavior: "smooth" });

// Instant scroll
window.scrollTo({ top: 0, behavior: "auto" });

// Scroll to specific element
document.getElementById("content")?.scrollIntoView({ behavior: "smooth" });

// No scroll
// Remove the window.scrollTo line
```

## Common Use Cases

### 1. Table Pagination (like NGO Events)
```typescript
<table>
  <thead>{/* Headers */}</thead>
  <tbody>
    {currentItems.map(item => (
      <tr key={item.id}>{/* Row */}</tr>
    ))}
  </tbody>
</table>
<Pagination {...paginationProps} />
```

### 2. Card Grid Pagination (like Sponsorship Events)
```typescript
<div className="grid grid-cols-3 gap-4">
  {currentItems.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
<Pagination {...paginationProps} />
```

### 3. List Pagination
```typescript
<ul>
  {currentItems.map(item => (
    <li key={item.id}>{/* List item */}</li>
  ))}
</ul>
<Pagination {...paginationProps} />
```

### 4. Blog Posts Pagination
```typescript
<div className="space-y-8">
  {currentItems.map(post => (
    <BlogPost key={post.id} {...post} />
  ))}
</div>
<Pagination {...paginationProps} />
```

## TypeScript Types

```typescript
interface PaginationProps {
  currentPage: number;         // Required: Current page number (1-based)
  totalPages: number;          // Required: Total number of pages
  onPageChange: (page: number) => void;  // Required: Callback function
  itemsPerPage?: number;       // Optional: Items per page for display
  totalItems?: number;         // Optional: Total items count for display
}
```

## Troubleshooting

### Pagination Not Showing
- Check if `totalPages > 1`
- Component only renders when there's more than 1 page

### Wrong Items Displayed
- Verify `startIndex` and `endIndex` calculations
- Check if you're using `currentItems` instead of `allItems`

### Page Reset Not Working
- Ensure `useEffect` dependency array includes all filter/search variables
- Check `setCurrentPage(1)` is called when filters change

### Buttons Not Working
- Verify `handlePageChange` is passed to `onPageChange` prop
- Check console for errors
- Ensure `currentPage` state is updating

### Styling Issues
- Check Tailwind CSS is properly configured
- Verify Framer Motion is installed
- Check for conflicting CSS classes

## Performance Tips

1. **Memoize calculations** for large datasets:
   ```typescript
   const currentItems = useMemo(() => {
     const start = (currentPage - 1) * itemsPerPage;
     return items.slice(start, start + itemsPerPage);
   }, [items, currentPage, itemsPerPage]);
   ```

2. **Debounce search** to prevent unnecessary re-renders:
   ```typescript
   const debouncedSearch = useDebounce(searchQuery, 300);
   ```

3. **Virtual scrolling** for very large lists (consider `react-virtual`)

## Checklist

- [ ] Import Pagination component
- [ ] Add currentPage state
- [ ] Set itemsPerPage constant
- [ ] Calculate totalPages
- [ ] Calculate currentItems slice
- [ ] Create handlePageChange function
- [ ] Replace items.map with currentItems.map
- [ ] Add <Pagination /> component
- [ ] (Optional) Add filter reset useEffect
- [ ] Test all pagination controls
- [ ] Test with different data sizes
- [ ] Test responsive behavior

## Need Help?

Refer to these files for working examples:
- `frontend/components/Pagination.tsx` - Component code
- `frontend/app/allngoevents/page.tsx` - Table pagination example
- `frontend/app/allsponsorshipevents/page.tsx` - Card grid pagination with filters
