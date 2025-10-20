# Pagination Visual Guide

## How It Works

### Before Pagination
```
┌─────────────────────────────────────┐
│  All Events Page (50 events)        │
├─────────────────────────────────────┤
│  Event 1                             │
│  Event 2                             │
│  Event 3                             │
│  ...                                 │
│  Event 48                            │
│  Event 49                            │
│  Event 50                            │
└─────────────────────────────────────┘
All events loaded at once - slower, cluttered
```

### After Pagination
```
┌─────────────────────────────────────┐
│  All Events Page (50 events)        │
├─────────────────────────────────────┤
│  Event 1                             │
│  Event 2                             │
│  Event 3                             │
│  Event 4                             │
│  Event 5                             │
│  Event 6                             │
│  Event 7                             │
│  Event 8                             │
│  Event 9                             │
│  Event 10                            │
├─────────────────────────────────────┤
│  Showing 1 to 10 of 50 items        │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐  │
│  │<<│< │①│ 2│ 3│...│ 5│ >│>>│     │
│  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘  │
└─────────────────────────────────────┘
Only 10 events per page - faster, cleaner
```

## Pagination Controls Layout

```
┌─────────────────────────────────────────────────────────┐
│                Showing 1 to 10 of 50 items              │
│                                                          │
│  ┌────┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      ┌───┐ ┌───┐ ┌────┐│
│  │ << │ │ < │ │ 1 │ │ 2 │ │ 3 │ ...  │ 5 │ │ > │ │ >> ││
│  └────┘ └───┘ └───┘ └───┘ └───┘      └───┘ └───┘ └────┘│
│   ↑      ↑     ↑     ↑     ↑          ↑     ↑     ↑    │
│   │      │     │     │     │          │     │     │    │
│  First  Prev  Page  Page  Page       Last  Next  Last  │
│                     Numbers                             │
└─────────────────────────────────────────────────────────┘
```

## State Examples

### Page 1 (First Page)
```
Showing 1 to 10 of 50 items

┌────────┬──────┬─────────┬─────┬─────┬───────┬─────┬──────┬──────────┐
│ <<     │  <   │   1     │  2  │  3  │  ...  │  5  │  >   │   >>     │
│(disabled)(disabled)(active)                              (enabled)  │
└────────┴──────┴─────────┴─────┴─────┴───────┴─────┴──────┴──────────┘
```

### Page 3 (Middle Page)
```
Showing 21 to 30 of 50 items

┌─────────┬────────┬─────┬─────┬─────────┬─────┬─────┬────────┬─────────┐
│   <<    │   <    │  1  │  2  │    3    │  4  │  5  │   >    │   >>    │
│(enabled)(enabled)             (active)               (enabled)(enabled)│
└─────────┴────────┴─────┴─────┴─────────┴─────┴─────┴────────┴─────────┘
```

### Page 5 (Last Page)
```
Showing 41 to 50 of 50 items

┌─────────┬────────┬─────┬───────┬─────┬─────┬─────────┬────────┬──────────┐
│   <<    │   <    │  1  │  ...  │  3  │  4  │    5    │   >    │   >>     │
│(enabled)(enabled)                           (active) (disabled)(disabled) │
└─────────┴────────┴─────┴───────┴─────┴─────┴─────────┴────────┴──────────┘
```

## Component Usage

### Import
```typescript
import Pagination from "@/components/Pagination";
```

### Basic Implementation
```typescript
// 1. Add state
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 100;

// 2. Calculate pagination
const totalPages = Math.ceil(items.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentItems = items.slice(startIndex, endIndex);

// 3. Handler function
const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

// 4. Render paginated items
{currentItems.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}

// 5. Render pagination controls
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  itemsPerPage={itemsPerPage}
  totalItems={items.length}
/>
```

## Color States

### Active Page Button
```
┌─────────────┐
│     1       │  ← Blue gradient background (blue-600 to blue-500)
│             │  ← White text
└─────────────┘  ← Shadow effect
```

### Inactive Page Button (Hover)
```
┌─────────────┐
│     2       │  ← Blue-50 background on hover
│             │  ← Gray-700 text, changes to blue-600 on hover
└─────────────┘  ← Scales up 1.1x on hover
```

### Disabled Button
```
┌─────────────┐
│     <<      │  ← Gray-400 text
│             │  ← cursor-not-allowed
└─────────────┘  ← No hover effect
```

## Animation Flow

```
User clicks page 2
       ↓
handlePageChange(2)
       ↓
setCurrentPage(2)
       ↓
Re-calculate currentItems
       ↓
Smooth scroll to top
       ↓
Fade out old items
       ↓
Fade in new items (staggered)
       ↓
Update pagination controls
```

## Responsive Behavior

### Desktop (lg+)
```
┌──────────────────────────────────────────────────────┐
│  Showing 1 to 10 of 50 items                         │
│  << < [1] 2 3 4 ... 10 > >>                          │
└──────────────────────────────────────────────────────┘
Full controls, all buttons visible
```

### Tablet (md)
```
┌─────────────────────────────────┐
│  Showing 1 to 10 of 50 items    │
│  << < [1] 2 ... 10 > >>         │
└─────────────────────────────────┘
Condensed page numbers
```

### Mobile (sm)
```
┌────────────────────────┐
│  1 to 10 of 50         │
│  < [1] 2 3 >           │
└────────────────────────┘
Minimal controls, fewer page numbers
```

## Integration Points

### NGO Events Page
- **File:** `app/allngoevents/page.tsx`
- **Data source:** API fetch from `/v1/event/organization`
- **Items:** Event table rows
- **Location:** Below the events table

### Sponsorship Events Page
- **File:** `app/allsponsorshipevents/page.tsx`
- **Data source:** Corporate context (opportunities)
- **Items:** Event cards (grid or list view)
- **Location:** Below event cards, above results count
- **Special:** Resets to page 1 when filters change

## Benefits

✅ **Performance:** Only render 10 items instead of all
✅ **UX:** Clear navigation, easy to find specific items
✅ **Accessibility:** Proper ARIA labels and keyboard support
✅ **Reusability:** Single component used in multiple pages
✅ **Responsive:** Works on all screen sizes
✅ **Smooth:** Framer Motion animations
✅ **Smart:** Auto-scroll, disabled states, ellipsis for many pages

## Test Scenarios

1. ✅ Navigate to last page → Verify "Next" and ">>" are disabled
2. ✅ Navigate to first page → Verify "Previous" and "<<" are disabled
3. ✅ Click page number directly → Verify correct items shown
4. ✅ Filter results → Verify pagination resets to page 1
5. ✅ Change items count → Verify page numbers update
6. ✅ Less than 10 items → Verify pagination doesn't show
7. ✅ Exactly 10 items → Verify pagination doesn't show
8. ✅ More than 10 items → Verify pagination shows correctly
