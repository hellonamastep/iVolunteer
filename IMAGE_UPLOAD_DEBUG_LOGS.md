# Image Upload Debug Logs - Volunteer Event

## Summary
Added comprehensive debug logs to trace the image upload flow when creating a volunteer event.

## Issue Found
⚠️ **CRITICAL ISSUE**: The frontend is calling `/v1/upload/single` endpoint which **DOES NOT EXIST** in the backend!

### Frontend Code (add-event/page.tsx line ~361)
```typescript
const response = await api.post(
  "/v1/upload/single",  // ❌ This endpoint doesn't exist!
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
  }
);
```

### What Exists in Backend
The backend has these upload patterns:
- Direct upload with event creation (no separate endpoint)
- Individual route uploads: `/auth/upload-profile-picture`, `/event/upload-event-image`, etc.
- **But NO generic `/v1/upload/single` endpoint**

## Debug Logs Added

### 1. Frontend - Form Submission (add-event/page.tsx)
```typescript
// At start of onSubmit
console.log('🔍 [DEBUG] Form submission started');
console.log('🔍 [DEBUG] eventImage exists:', !!eventImage);
console.log('🔍 [DEBUG] eventImage length:', eventImage?.length);

// Before upload
console.log('📤 [DEBUG] Starting image upload to Cloudinary...');
console.log('📤 [DEBUG] Image file:', {
  name: eventImage[0].name,
  size: eventImage[0].size,
  type: eventImage[0].type
});
console.log('📤 [DEBUG] Sending POST request to /v1/upload/single');

// After upload
console.log('✅ [DEBUG] Image upload successful!');
console.log('✅ [DEBUG] Response data:', imageData);
console.log('✅ [DEBUG] Cloudinary URL:', imageData?.url);
console.log('✅ [DEBUG] Public ID:', imageData?.publicId);

// Before sending to createEvent
console.log('📦 [DEBUG] Formatted data for event creation:', {
  ...formattedData,
  hasImage: !!formattedData.image,
  imageUrl: formattedData.image?.url,
  imagePublicId: formattedData.image?.publicId
});

console.log('🚀 [DEBUG] Calling createEvent API...');
console.log('✅ [DEBUG] Event created successfully!');
```

### 2. Frontend - NGO Context (ngo-context.tsx)
```typescript
console.log('🌐 [NGO Context] createEvent called');
console.log('🌐 [NGO Context] Event data:', {
  ...eventData,
  hasImage: !!eventData.image,
  imageUrl: eventData.image?.url,
  imagePublicId: eventData.image?.publicId
});

console.log('🌐 [NGO Context] Sending POST to /v1/event/add-event');
console.log('🌐 [NGO Context] Response received:', {
  success: res.data.success,
  hasEvent: !!(res.data as any).event,
  eventImage: (res.data as any).event?.image
});

console.error('❌ [NGO Context] Error creating event:', err);
console.error('❌ [NGO Context] Error response:', err.response?.data);
```

### 3. Backend - Controller (ngoEvent.controller.js)
```javascript
console.log('\n🔵 [BACKEND Controller] addEvent called');
console.log('🔵 [BACKEND Controller] Request body:', {
  ...req.body,
  hasImage: !!req.body.image,
  imageUrl: req.body.image?.url,
  imagePublicId: req.body.image?.publicId
});

console.log('🔵 [BACKEND Controller] Event data before service:', {
  ...eventData,
  hasImage: !!eventData.image,
  imageUrl: eventData.image?.url,
  imagePublicId: eventData.image?.publicId
});

console.log('🔵 [BACKEND Controller] Event created:', {
  _id: event._id,
  title: event.title,
  hasImage: !!event.image,
  imageUrl: event.image?.url,
  imagePublicId: event.image?.publicId
});
```

### 4. Backend - Service (ngoEvent.service.js)
```javascript
console.log('\n🟢 [BACKEND Service] createEvent called');
console.log('🟢 [BACKEND Service] Input data:', {
  ...data,
  hasImage: !!data.image,
  imageUrl: data.image?.url,
  imagePublicId: data.image?.publicId
});

console.log('🟢 [BACKEND Service] Extracted image:', {
  hasImage: !!image,
  imageUrl: image?.url,
  imagePublicId: image?.publicId
});

console.log('🟢 [BACKEND Service] Event object before save:', {
  title: event.title,
  hasImage: !!event.image,
  imageUrl: event.image?.url,
  imagePublicId: event.image?.publicId
});

console.log('🟢 [BACKEND Service] Event saved successfully:', {
  _id: savedEvent._id,
  title: savedEvent.title,
  hasImage: !!savedEvent.image,
  imageUrl: savedEvent.image?.url,
  imagePublicId: savedEvent.image?.publicId
});

console.error('❌ [BACKEND Service] Error saving event:', error);
```

## Type Update
Updated `EventData` type in `ngo-context.tsx` to include `publicId`:
```typescript
image?: { url: string; caption: string; publicId?: string };
```

## How to Test

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create a volunteer event with an image:**
   - Navigate to the add event page
   - Fill in all required fields
   - **Select an image file**
   - Click submit

4. **Check the console logs:**
   - **Frontend**: Open browser DevTools console (F12)
   - **Backend**: Check terminal/console output

## Expected Log Flow (if working correctly)

```
Frontend:
🔍 [DEBUG] Form submission started
🔍 [DEBUG] eventImage exists: true
🔍 [DEBUG] eventImage length: 1
📤 [DEBUG] Starting image upload to Cloudinary...
📤 [DEBUG] Image file: { name: "...", size: ..., type: "..." }
📤 [DEBUG] Sending POST request to /v1/upload/single
❌ ERROR: 404 Not Found (endpoint doesn't exist)

Backend:
(No logs for /v1/upload/single - endpoint doesn't exist)
```

## Recommended Fix

**Option 1**: Create the missing `/v1/upload/single` endpoint
**Option 2**: Use the existing event image upload endpoint
**Option 3**: Pass the image file directly with the event creation (requires multipart/form-data)

## Next Steps

1. Run the test to see the actual error
2. Review which approach matches your architecture
3. Implement the appropriate fix
4. Remove debug logs after confirming the fix works
