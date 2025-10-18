# Donation Event Form - Auto-Save & Database Integration

## Overview
Implemented comprehensive auto-save functionality with localStorage and full backend integration for donation event creation, including Cloudinary image uploads.

## Features Implemented

### 1. Frontend Auto-Save (localStorage)
- **Auto-save every 1 second** after user stops typing
- **Draft restoration** on page reload
- **Image preview persistence** across sessions
- **Visual indicators** showing last saved time
- **Clear draft button** to reset form

#### Key Components Added:
```typescript
const STORAGE_KEY = "donation_event_draft";
const IMAGES_STORAGE_KEY = "donation_event_images";
```

#### Auto-Save Logic:
- Saves all form fields (excluding FileList objects)
- Saves image preview URLs separately
- Debounced by 1 second to avoid excessive writes
- Timestamps each save operation

#### Draft Restoration:
- Runs on component mount
- Restores all text fields
- Restores image previews
- Shows toast notification when draft loaded

### 2. Backend Database Integration

#### Updated Model: `DonationEvent.js`
Added comprehensive fields matching the form:

**Basic Info:**
- `title` - Campaign title
- `category` - Event category
- `goalAmount` - Fundraising goal
- `endDate` - Campaign end date
- `coverImage` - Cloudinary URL for cover image
- `shortDescription` - Brief description

**Story Section:**
- `whyRaising` - Reason for fundraising
- `whoBenefits` - Beneficiary information
- `howFundsUsed` - Fund usage details
- `supportingMedia` - Array of Cloudinary URLs

**Verification:**
- `governmentId` - Cloudinary URL for govt ID
- `proofOfNeed` - Cloudinary URL for proof documents
- `trustScore` - Calculated trust score (0-100)

**Settings:**
- `displayRaisedAmount` - Boolean
- `allowAnonymous` - Boolean
- `enableComments` - Boolean
- `minimumDonation` - Number
- `socialShareMessage` - String
- `hashtags` - String
- `location` - String

**Payment Details:**
- `bankAccount` - Account number, IFSC, holder name
- `paymentMethods` - Array of payment methods

### 3. Cloudinary Integration

#### Updated `cloudinary.js` Configuration:
- **Dynamic folder routing** based on field name
- **Organized storage structure:**
  - `iVolunteer_donations/covers` - Cover images
  - `iVolunteer_donations/verification/govt_id` - Government IDs
  - `iVolunteer_donations/verification/proof` - Proof documents
  - `iVolunteer_donations/media` - Supporting media

#### Features:
- Automatic image optimization (max width: 1000px)
- Support for JPG, JPEG, PNG, GIF, PDF
- Unique file naming: `{fieldname}_{timestamp}_{random}`

### 4. Backend Routes & Controllers

#### Updated Route: `/v1/donation-event/create-event`
- **Method:** POST
- **Authentication:** Required (authMiddleware)
- **File Upload:** Supports multiple files via multer
  - `coverImage` - Max 1 file
  - `governmentId` - Max 1 file
  - `proofOfNeed` - Max 1 file
  - `supportingMedia` - Max 5 files

#### Controller Updates:
```javascript
export const createEvent = async (req, res) => {
  // Handles req.files from multer
  // Maps file uploads to Cloudinary URLs
  // Saves to MongoDB with all form data
}
```

### 5. Form Submission Flow

#### Frontend (page.tsx):
1. User fills form → Auto-saves to localStorage
2. User clicks "Submit" → Creates FormData object
3. Appends all text fields and file uploads
4. Calculates trust score based on verification
5. Sends to API endpoint

#### Backend Flow:
1. Multer intercepts multipart/form-data
2. Uploads files to Cloudinary
3. Receives Cloudinary URLs
4. Saves document to MongoDB with:
   - All form fields
   - Cloudinary URLs for images
   - `approvalStatus: "pending"`
5. Returns created event

#### Post-Submission:
- Clears localStorage draft
- Resets form to step 1
- Shows success toast
- Waits for admin approval

## Trust Score Calculation

```typescript
let trustScore = 0;
if (governmentId uploaded) trustScore += 50;
if (proofOfNeed uploaded) trustScore += 30;
if (confirmCheckbox checked) trustScore += 20;
// Max: 100%
```

## UI Improvements

### Header Bar:
- **Left:** Empty space
- **Center:** Page title
- **Right:** 
  - 🟢 Auto-save indicator with timestamp
  - 🔴 Clear draft button

### Visual Feedback:
- Green badge shows "Saved {time}"
- Red button to clear draft with confirmation
- Toast notifications for restore/clear actions

## Testing Checklist

### Frontend:
- [ ] Fill form partially → Refresh page → Data restored
- [ ] Upload images → Refresh page → Previews restored
- [ ] Submit form → localStorage cleared
- [ ] Clear draft button → Confirms before clearing
- [ ] Auto-save indicator updates

### Backend:
- [ ] Single file upload (coverImage) works
- [ ] Multiple files upload (supportingMedia) works
- [ ] Files stored in correct Cloudinary folders
- [ ] MongoDB document includes all fields
- [ ] Trust score calculated correctly
- [ ] Admin approval workflow intact

## API Example

### Request:
```http
POST /v1/donation-event/create-event
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  title: "Help Fund Medical Treatment",
  category: "Medical",
  goalAmount: 50000,
  endDate: "2025-12-31",
  coverImage: [File],
  shortDescription: "Need urgent help...",
  governmentId: [File],
  trustScore: 70,
  bankAccount[accountNumber]: "123456789",
  bankAccount[ifsc]: "ABCD0001234",
  bankAccount[accountHolder]: "John Doe"
}
```

### Response:
```json
{
  "success": true,
  "event": {
    "_id": "...",
    "ngoId": "...",
    "title": "Help Fund Medical Treatment",
    "category": "Medical",
    "goalAmount": 50000,
    "coverImage": "https://res.cloudinary.com/...",
    "governmentId": "https://res.cloudinary.com/...",
    "trustScore": 70,
    "approvalStatus": "pending",
    "createdAt": "2025-10-15T...",
    ...
  }
}
```

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.js (Updated)
│   ├── controllers/
│   │   └── donationEvent.controller.js (Updated)
│   ├── models/
│   │   └── DonationEvent.js (Updated)
│   ├── routes/
│   │   └── donationEvent.routes.js (Updated)
│   └── services/
│       └── donationEvent.service.js (No changes needed)

frontend/
├── app/
│   └── donationevent-form/
│       └── page.tsx (Updated - Auto-save + FormData)
├── contexts/
│   └── donationevents-context.tsx (Updated - FormData support)
```

## Browser Storage

### localStorage Keys:
1. **`donation_event_draft`** - Form field values
2. **`donation_event_images`** - Image preview data URLs

### Storage Example:
```json
// donation_event_draft
{
  "title": "Medical Help",
  "category": "Medical",
  "goalAmount": 50000,
  "shortDescription": "...",
  "_savedAt": "2025-10-15T10:30:45.123Z"
}

// donation_event_images
{
  "coverImage": "data:image/jpeg;base64,...",
  "governmentId": "data:image/jpeg;base64,...",
  "proofOfNeed": null
}
```

## Notes

1. **File Size Limits:** Cloudinary applies default limits. Configure as needed.
2. **Image Optimization:** All images resized to max 1000px width
3. **PDF Support:** Allowed for government ID and proof documents
4. **Security:** 
   - Authentication required for event creation
   - Files stored in organized Cloudinary folders
   - Admin approval required before event goes live
5. **Performance:**
   - Debounced auto-save prevents excessive writes
   - Image previews stored separately from form data
   - FormData used for efficient file uploads

## Future Enhancements

- [ ] Add draft expiration (e.g., 7 days)
- [ ] Support draft sync across devices (backend storage)
- [ ] Image compression before upload
- [ ] Progress indicators for file uploads
- [ ] Multiple draft support (save/load by name)
- [ ] Offline support with service workers
