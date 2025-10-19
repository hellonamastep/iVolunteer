# Address Field Validation Error Display Fix

## Issue
In Step 4 of NGO signup (Additional Details), when address fields had validation errors, the error summary banner at the top showed "Please correct the following errors:" but displayed nothing in the list below it.

## Root Cause
The `getCurrentStepErrors()` function was not properly handling the `address` field. Step 4's field list includes `"address"` as a single field, but the actual validation errors are nested under:
- `address.street`
- `address.city`
- `address.state`
- `address.zip`
- `address.country`

The function needed special logic to iterate through all nested address fields when it encounters the parent `"address"` field.

## Solution
Added special handling in the `getCurrentStepErrors()` function to:
1. Detect when the field is `"address"`
2. Check all nested address fields (street, city, state, zip, country)
3. Extract error messages from each nested field
4. Add them to the error summary list

## Code Changes
```typescript
if (field === 'address') {
  // Special handling for address field - check all nested address fields
  const addressError = errors.address;
  if (addressError && typeof addressError === 'object') {
    const addressFields = ['street', 'city', 'state', 'zip', 'country'];
    addressFields.forEach((addressField) => {
      const fieldError = (addressError as any)[addressField];
      if (fieldError?.message && typeof fieldError.message === 'string') {
        stepErrors.push(fieldError.message);
      }
    });
  }
}
```

## Expected Behavior After Fix
When a user tries to proceed from Step 4 without filling address fields, they will now see:

**Error Summary Banner:**
```
⚠ Please correct the following errors:
• Street address is required
• City is required
• State is required
• ZIP code is required
• Country is required
```

## Testing
To verify the fix works:
1. Go to NGO signup flow
2. Complete Steps 1, 2, and 3
3. In Step 4, leave all address fields empty
4. Try to click "Continue"
5. Verify that the error banner now shows all 5 address field errors
6. Fill in one field (e.g., street)
7. Try to continue again
8. Verify that only the remaining 4 errors are shown

## Files Modified
- `frontend/app/signup/page.tsx` - Updated `getCurrentStepErrors()` function
