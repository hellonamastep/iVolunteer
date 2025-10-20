# NGO Event Table & Event Form Updates

## Summary
Implemented three key improvements to the NGO event management system:

1. **Fixed pagination scroll behavior** - Table now scrolls to view when changing pages
2. **Added donation event status display** - NGO event table now shows both volunteer and donation events with proper labeling
3. **Updated event form validation** - Made detailed address mandatory and requirements optional

## Changes Made

### 1. Pagination Scroll Fix (`Ngoeventtable.tsx`)

**Problem**: When switching between pages in the NGO event table, the screen scrolled to the top of the page instead of keeping the table in view.

**Solution**: Added automatic scroll to table when pagination changes.

**Implementation**:
```tsx
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  // Scroll to table when page changes
  scrollToTable();
};

const scrollToTable = () => {
  if (tableRef.current) {
    tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
```

**Benefits**:
- Better user experience when navigating through multiple pages
- Keeps table in view for easier navigation
- Smooth scrolling animation

---

### 2. Donation Event Status Display (`Ngoeventtable.tsx`)

**Problem**: The NGO event table only showed volunteer events, not donation events.

**Solution**: Updated table to fetch and display both volunteer and donation events with clear visual distinction.

#### Interface Updates
Added new fields to `EventItem` interface:
```tsx
isDonationEvent?: boolean;
goalAmount?: number;
collectedAmount?: number;
```

#### Data Fetching
Updated to fetch both event types:
```tsx
// Fetch both volunteer events and donation events
const [volunteerRes, donationRes] = await Promise.all([
  api.get(`/v1/event/organization?_t=${timestamp}`, {...}),
  api.get(`/v1/donation-event/organization?_t=${timestamp}`, {...})
]);
```

#### Visual Display
**Donation Event Badge in Table**:
```tsx
<td className="p-4">
  <div className="flex flex-col gap-1">
    <span className="font-semibold text-gray-900">{event.title}</span>
    {event.isDonationEvent && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white w-fit">
        💝 Donation Event
      </span>
    )}
  </div>
</td>
```

**Updated Progress Display**:
- Volunteer events show participant count: `5/20`
- Donation events show monetary progress: `₹50,000/₹100,000`

#### Status Banner Updates
Updated pending events banner to distinguish between event types:
```tsx
You have X events pending admin approval 
(Y volunteer events, Z donation events)
```

Shows breakdown when both types are present:
- "3 events (2 volunteer events, 1 donation event)"
- "2 events (volunteer events)" - when only volunteer events
- "1 event (donation event)" - when only donation events

#### Mapping Logic
**Donation Events**:
- Uses `startDate` as the main date
- Progress calculated as: `(collectedAmount / goalAmount) * 100`
- Display status logic:
  - `"Full"` - Goal achieved (collected >= goal)
  - `"Ongoing"` - Past end date but not fully funded
  - `"Open"` - Active and accepting donations

**Features**:
- Graceful fallback if donation endpoint doesn't exist
- Combined display of both event types in single table
- Clear visual distinction with badge
- Proper sorting and filtering for both types

---

### 3. Event Form Validation Updates (`add-event/page.tsx`)

**Problem**: Requirements field was mandatory and detailed address was optional.

**Solution**: Reversed the validation - made detailed address mandatory and requirements optional.

#### Detailed Address - Now Mandatory
**Before**:
```tsx
<label>Detailed Address</label>
<textarea {...register("detailedAddress")} />
```

**After**:
```tsx
<label>
  Detailed Address <span className="text-red-500">*</span>
</label>
<textarea
  {...register("detailedAddress", {
    required: "Detailed address is required"
  })}
/>
{errors.detailedAddress && <p className="text-red-500 text-xs mt-1">{errors.detailedAddress.message}</p>}
```

**Validation Update**:
```tsx
// Step 2 validation includes detailedAddress
fieldsToValidate = ["duration", "eventType", "eventStatus", "detailedAddress"];
```

#### Requirements - Now Optional
**Before**:
```tsx
<label>
  Requirements <span className="text-red-500">*</span>
</label>
<input
  {...register("requirements", {
    validate: () => requirementInputs.some(req => req.trim() !== "") || "At least one requirement is needed"
  })}
/>
{errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>}
```

**After**:
```tsx
<label>
  Requirements <span className="text-gray-400 text-xs">(Optional)</span>
</label>
<input {...register("requirements")} />
// Removed validation and error display
```

**Validation Update**:
```tsx
// Step 3 validation removes requirements
fieldsToValidate = ["maxParticipants"]; // requirements removed
```

**Benefits**:
- Detailed address ensures volunteers know exactly where to go
- Requirements can be added if needed but not forced
- Clearer form validation with proper error messages
- Better user experience with appropriate field priorities

---

## Files Modified

1. **`frontend/components/Ngoeventtable.tsx`**
   - Added donation event interface fields
   - Updated fetch to get both volunteer and donation events
   - Added visual distinction for donation events
   - Fixed pagination scroll behavior
   - Updated status banners

2. **`frontend/app/add-event/page.tsx`**
   - Made detailed address mandatory
   - Made requirements optional
   - Updated validation logic

---

## Testing Recommendations

### Pagination Scroll
1. Navigate to NGO event table with multiple pages
2. Click to page 2, 3, etc.
3. Verify table scrolls into view smoothly
4. Check it works on different screen sizes

### Donation Events Display
1. Create a donation event via NGO dashboard
2. Check it appears in the NGO event table with badge
3. Verify progress shows as currency (₹X/₹Y)
4. Check status banners show correct counts
5. Test filtering with both event types
6. Verify sorting works correctly

### Form Validation
1. Create new event
2. Try to submit Step 2 without detailed address - should show error
3. Complete Step 2 with detailed address
4. In Step 3, leave requirements empty - should proceed without error
5. Optionally add requirements - should work
6. Complete event creation successfully

---

## Benefits

### User Experience
- **Better Navigation**: Pagination keeps table in view
- **Clear Distinction**: Easy to identify donation vs volunteer events
- **Proper Validation**: Important fields are mandatory, optional fields are flexible

### NGO Management
- **Unified View**: See all events (volunteer + donation) in one place
- **Better Status Tracking**: Know what's pending for each event type
- **Efficient Workflow**: Proper form validation reduces errors

### Visual Design
- **Consistent Branding**: Uses brand colors for donation badge
- **Professional Look**: Clear badges and status indicators
- **Responsive**: Works on all screen sizes

---

## Technical Notes

- Donation event fetching includes error handling (graceful fallback)
- Scroll behavior uses smooth animation for better UX
- Interface is backward compatible (optional fields)
- No breaking changes to existing functionality
- Validation messages are user-friendly

---

## Future Enhancements

Potential improvements:
1. Add separate tabs for volunteer vs donation events
2. Add donation-specific filters (by goal amount, completion %)
3. Show donation statistics in dashboard
4. Add bulk operations for events
5. Export event data to CSV/Excel
