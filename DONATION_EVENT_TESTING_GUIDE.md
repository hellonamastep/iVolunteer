# Donation Event Form - Testing Guide

## Quick Start Testing

### 1. Backend Setup
```powershell
cd c:\Users\sushi\OneDrive\Desktop\iv\backend
npm install
```

Ensure `.env` has:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:
```powershell
npm run dev
```

### 2. Frontend Setup
```powershell
cd c:\Users\sushi\OneDrive\Desktop\iv\frontend
npm install
npm run dev
```

## Testing Auto-Save Feature

### Test 1: Basic Auto-Save
1. Navigate to `/donationevent-form`
2. Fill in some fields (title, category, goal amount)
3. Wait 2 seconds - you should see "Saved {time}" in the header
4. Refresh the page
5. ✅ Expected: All fields are restored with values

### Test 2: Image Upload & Preview Restore
1. Upload a cover image
2. Wait for preview to appear
3. Wait 2 seconds for auto-save
4. Refresh the page
5. ✅ Expected: Image preview is restored (but file upload needs re-selection)

### Test 3: Multi-Step Progress
1. Fill Step 1 completely
2. Click "Next Step"
3. Fill Step 2 partially
4. Refresh the page
5. ✅ Expected: Step 1 data restored, Step 2 partial data restored

### Test 4: Clear Draft
1. Fill some fields
2. Click "Clear" button in header
3. Confirm the dialog
4. ✅ Expected: Form resets, localStorage cleared, success toast shown

### Test 5: Submit & Clear Storage
1. Fill all required fields
2. Upload all required images
3. Click "Submit" (step 5)
4. ✅ Expected: 
   - Form submits successfully
   - localStorage is cleared
   - Toast shows success
   - Form resets to step 1

## Testing Backend Integration

### Test 6: File Upload to Cloudinary
1. Fill the form with all required fields
2. Upload:
   - Cover image (JPEG/PNG)
   - Government ID (JPEG/PNG/PDF)
   - Proof of need (optional)
   - Supporting media (1-5 files)
3. Submit the form
4. Check backend console for Cloudinary uploads
5. ✅ Expected: 
   - Files uploaded to Cloudinary
   - URLs returned in response
   - Check Cloudinary dashboard for organized folders

### Test 7: MongoDB Storage
1. After submission, check MongoDB:
```javascript
db.donationevents.findOne().pretty()
```
2. ✅ Expected fields present:
   - `title`, `category`, `goalAmount`, `endDate`
   - `coverImage` (Cloudinary URL)
   - `governmentId` (Cloudinary URL)
   - `shortDescription`, `whyRaising`, etc.
   - `trustScore` calculated correctly
   - `approvalStatus: "pending"`
   - `bankAccount` object with account details

### Test 8: Trust Score Calculation
Test different combinations:
1. **Only Govt ID:** trustScore = 50
2. **Govt ID + Proof:** trustScore = 80
3. **Govt ID + Proof + Confirm:** trustScore = 100
4. **No verification:** trustScore = 0

### Test 9: API Response
Use Postman or browser DevTools:
```http
POST http://localhost:5000/v1/donation-event/create-event
Authorization: Bearer {your_token}
Content-Type: multipart/form-data
```

✅ Expected Response:
```json
{
  "success": true,
  "event": {
    "_id": "...",
    "ngoId": "...",
    "title": "Test Campaign",
    "coverImage": "https://res.cloudinary.com/.../image.jpg",
    "governmentId": "https://res.cloudinary.com/.../govt_id.jpg",
    "trustScore": 70,
    "approvalStatus": "pending",
    ...
  }
}
```

## Browser Console Testing

### Check localStorage:
```javascript
// View saved draft
console.log(JSON.parse(localStorage.getItem('donation_event_draft')));

// View saved images
console.log(JSON.parse(localStorage.getItem('donation_event_images')));

// Clear manually
localStorage.removeItem('donation_event_draft');
localStorage.removeItem('donation_event_images');
```

### Monitor auto-save:
1. Open DevTools → Application → Local Storage
2. Fill form fields
3. Watch values update every 1 second after stopping

## Edge Cases to Test

### Test 10: Large Files
1. Upload images > 5MB
2. ✅ Expected: Cloudinary handles compression

### Test 11: Invalid File Types
1. Try uploading .exe or .zip files
2. ✅ Expected: Rejected by Cloudinary config

### Test 12: Network Failure
1. Disconnect internet
2. Fill form (localStorage should still work)
3. Reconnect internet
4. Submit form
5. ✅ Expected: Submission works after reconnection

### Test 13: Multiple Supporting Media
1. Upload 5 supporting media files
2. ✅ Expected: All 5 files uploaded to Cloudinary
3. MongoDB document has array of 5 URLs

### Test 14: Optional Fields
1. Fill only required fields (marked with *)
2. Skip optional fields
3. Submit
4. ✅ Expected: Submission succeeds, optional fields are empty strings or null

### Test 15: Form Validation
1. Try to proceed to Step 2 without filling Step 1 required fields
2. ✅ Expected: Validation errors shown, cannot proceed

## Performance Testing

### Test 16: Auto-Save Performance
1. Open DevTools → Performance
2. Start recording
3. Type rapidly in multiple fields
4. Stop recording after 5 seconds
5. ✅ Expected: Only 1 localStorage write (debounced)

### Test 17: Image Preview Performance
1. Upload very large image (10MB+)
2. Check memory usage
3. ✅ Expected: Preview generated without freezing UI

## Cloudinary Folder Structure Verification

After uploads, check Cloudinary dashboard:

```
iVolunteer_donations/
├── covers/
│   └── coverImage_1697457123456_789012345.jpg
├── verification/
│   ├── govt_id/
│   │   └── governmentId_1697457123456_789012346.jpg
│   └── proof/
│       └── proofOfNeed_1697457123456_789012347.pdf
└── media/
    ├── supportingMedia_1697457123456_789012348.jpg
    ├── supportingMedia_1697457123456_789012349.jpg
    └── supportingMedia_1697457123456_789012350.jpg
```

## Admin Approval Flow Test

### Test 18: Pending Status
1. Create donation event
2. Check MongoDB: `approvalStatus` should be "pending"
3. Event should NOT appear in public listing
4. Admin dashboard should show it in pending queue

### Test 19: Approval Workflow
```http
PATCH http://localhost:5000/v1/donation-event/status/:eventId
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "approved"
}
```

✅ Expected: Event now appears in public listing

## Troubleshooting

### localStorage not saving:
- Check browser console for errors
- Ensure localStorage is not disabled
- Check if running in incognito mode (may have restrictions)

### Images not uploading:
- Verify Cloudinary credentials in `.env`
- Check network tab for 401/403 errors
- Ensure multer middleware is before controller

### Form not restoring:
- Check if localStorage keys exist
- Verify useEffect dependencies
- Check for JSON parsing errors in console

### Trust score not calculating:
- Ensure useEffect has correct dependencies
- Check if file upload state is updating
- Console.log the values being checked

## Success Criteria

✅ All tests pass:
- Auto-save works within 1-2 seconds
- Draft restored on page reload
- Images upload to Cloudinary
- Data saved to MongoDB
- Trust score calculated correctly
- localStorage cleared after submission
- Clear draft button works
- All validation rules enforced
- No console errors
- Admin approval workflow intact

## Next Steps After Testing

1. Test with real NGO user account
2. Verify email notifications (if implemented)
3. Test payment integration with bank details
4. Check mobile responsiveness
5. Performance testing with large datasets
6. Security audit for file uploads
7. Add error boundaries for production
