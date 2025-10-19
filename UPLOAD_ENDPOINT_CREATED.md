# Upload Endpoint Created + Additional Debug Logs

## ✅ Created Backend Upload Endpoint

### Files Created:

#### 1. `backend/src/controllers/upload.controller.js`
- Handles single image upload to Cloudinary
- Returns image URL, publicId, and metadata
- Includes debug logs

#### 2. `backend/src/routes/upload.routes.js`
- POST `/api/v1/upload/single` endpoint
- Uses Cloudinary upload middleware
- Requires authentication

#### 3. Updated `backend/src/app.js`
- Imported upload router
- Registered route at `/api/v1/upload`

## 🔧 Frontend Fixes

### Fixed File Input Registration Issue
**Problem**: The `{...register("eventImage")}` was conflicting with the custom `onChange` handler.

**Solution**: Removed `register()` from the file input since we're managing the file in component state.

```typescript
// Before (conflicting)
<input
  type="file"
  {...register("eventImage")}  // ❌ Conflicts with custom onChange
  onChange={handleImageUpload}
  accept="image/*"
  className="hidden"
/>

// After (fixed)
<input
  type="file"
  onChange={handleImageUpload}  // ✅ Uses component state only
  accept="image/*"
  className="hidden"
/>
```

### Added State Monitoring
Added a `useEffect` to monitor when `eventImageFile` state changes:

```typescript
useEffect(() => {
  console.log('🔄 [DEBUG] eventImageFile state changed:', eventImageFile ? {
    name: eventImageFile.name,
    size: eventImageFile.size,
    type: eventImageFile.type
  } : null);
}, [eventImageFile]);
```

This will log every time the file state updates, helping us track if the state is being set and if it's being cleared unexpectedly.

## 🧪 Testing Instructions

1. **Restart Backend Server** (if not already running)
   ```bash
   cd backend
   npm start
   ```

2. **Make sure Frontend is Running**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Image Upload**
   - Go to create volunteer event page
   - Select an image file
   - Watch browser console for these logs:
     ```
     📸 [DEBUG] handleImageUpload called
     📸 [DEBUG] File selected: filename.jpg
     📸 [DEBUG] File size: 12345
     📸 [DEBUG] Stored file in eventImageFile state
     🔄 [DEBUG] eventImageFile state changed: {name: "...", size: ..., type: "..."}
     📸 [DEBUG] Image preview set
     ```
   
   - Click Submit
   - Should see:
     ```
     🔍 [DEBUG] eventImageFile exists: true
     📤 [DEBUG] Starting image upload to Cloudinary...
     ✅ [DEBUG] Image upload successful!
     ✅ [DEBUG] Cloudinary URL: https://...
     ```

## Expected Flow

### Success Path:
1. ✅ File selected → `handleImageUpload` called
2. ✅ File stored in `eventImageFile` state
3. ✅ State change detected by useEffect
4. ✅ Preview created
5. ✅ Form submitted
6. ✅ File sent to `/api/v1/upload/single`
7. ✅ Cloudinary uploads image
8. ✅ Image URL returned
9. ✅ Event created with image data

### Debug Checkpoints:
- 📸 = File handling
- 🔄 = State monitoring
- 🔍 = Form submission
- 📤 = Upload API call
- ✅ = Success
- ❌ = Error
- 🟣 = Backend upload controller

## Troubleshooting

### If eventImageFile is still null:
1. Check if `🔄 [DEBUG] eventImageFile state changed` appears
2. If it doesn't appear → state setter isn't being called
3. If it appears with `null` → state is being cleared somewhere

### If upload fails:
1. Check backend terminal for `🟣 [UPLOAD Controller]` logs
2. Verify Cloudinary config is correct
3. Check network tab for actual request/response

## Next Steps After Testing

Once image upload works:
1. ✅ Verify image appears in Cloudinary dashboard
2. ✅ Verify event is created with image URL
3. ✅ Verify image displays on event card
4. 🧹 Remove debug logs (optional - keep them for future debugging)
5. 📝 Update documentation

## Files Modified

### Backend:
- ✅ `backend/src/controllers/upload.controller.js` (created)
- ✅ `backend/src/routes/upload.routes.js` (created)
- ✅ `backend/src/app.js` (updated)

### Frontend:
- ✅ `frontend/app/add-event/page.tsx` (updated)
  - Removed conflicting register()
  - Added state monitoring useEffect
  - Enhanced debug logs
