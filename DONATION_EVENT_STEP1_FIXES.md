# Donation Event Form - Step 1 Fixes

## Issues Fixed

### 1. Custom Category Input for "Other" Selection
**Problem:** When users selected "Other" in the category dropdown, they couldn't specify what category they meant.

**Solution:**
- Added `customCategory` field to the `EventFormValues` interface
- Added conditional rendering of a text input field that appears when "Other" is selected
- Added validation requiring users to specify the category (minimum 3 characters)
- Updated form submission to use the custom category value when "Other" is selected
- Updated validation logic in `handleNext` to check for `customCategory` when "Other" is selected

**Changes Made:**
- Added `customCategory?: string;` to interface
- Added `selectedCategory` watch variable to track category selection
- Added conditional input field below category dropdown
- Updated `handleNext` validation to include `customCategory` when needed
- Modified form submission to use custom category: `data.category === "Other" && data.customCategory ? data.customCategory : data.category`

### 2. Campaign End Date - Prevent Past Dates
**Problem:** The date picker was showing all dates including past dates that shouldn't be selectable.

**Solution:**
- Added `min` attribute to the date input with today's date
- This prevents users from selecting dates in the past from the calendar picker

**Changes Made:**
- Added `min={new Date().toISOString().split('T')[0]}` to the date input
- This generates today's date in YYYY-MM-DD format and sets it as the minimum selectable date

### 3. Cover Image Validation Issue When Navigating Back
**Problem:** When users uploaded a cover image and navigated from Step 1 → Step 2 → Back to Step 1, the image preview was visible but still showed "Cover image is required" error.

**Solution:**
- Modified cover image validation to check for both uploaded file AND existing preview
- Updated the validation logic in `handleNext` to skip cover image validation if preview exists
- Modified the register validation to accept the field as valid if `coverImagePreview` exists
- Updated error message display to only show if there's an error AND no preview

**Changes Made:**
- Updated `coverImage` registration: `required: !coverImagePreview ? "Cover image is required" : false`
- Modified error display: `{errors.coverImage && !coverImagePreview && ...}`
- Updated `handleNext` logic to only validate coverImage if both file and preview are missing:
```javascript
if (!coverImage || coverImage.length === 0) {
  if (!coverImagePreview) {
    fieldsToValidate.push("coverImage");
  }
}
```

## Testing Guidelines

### Test Case 1: Custom Category
1. Navigate to donation event form
2. Select "Other" from category dropdown
3. Verify that a text input appears asking to specify the category
4. Try to proceed without entering custom category - should show validation error
5. Enter a custom category (e.g., "Technology")
6. Verify that you can proceed to next step
7. Complete the form and submit - verify custom category is saved

### Test Case 2: End Date Calendar
1. Navigate to donation event form Step 1
2. Click on the "Campaign End Date" field
3. Verify that past dates are grayed out/disabled
4. Verify you can only select today or future dates
5. Try selecting a future date - should work correctly

### Test Case 3: Cover Image Navigation
1. Navigate to donation event form Step 1
2. Upload a cover image
3. Verify image preview appears
4. Click "Next" to go to Step 2
5. Click "Previous" to return to Step 1
6. Verify:
   - Image preview is still visible
   - No "Cover image is required" error is shown
   - You can proceed to Step 2 again without re-uploading

## Technical Details

**Files Modified:**
- `frontend/app/donationevent-form/page.tsx`

**Key Changes:**
1. Interface updated to include `customCategory` field
2. Added watch for `selectedCategory` to enable conditional rendering
3. Modified validation logic to be context-aware (checks both file and preview state)
4. Added date constraints to date picker
5. Enhanced form submission to handle custom category values

## Browser Compatibility
- Date input with `min` attribute is supported in all modern browsers
- Fallback validation still exists via the `validate` function for older browsers
