# Image Upload Fix - Volunteer Event

## Problem Identified

The issue was that the `FileList` object was being lost after the image was selected. Here's what was happening:

1. User selects an image file
2. `handleImageUpload` is called with `e.target.files` containing the file
3. The file is read for preview using `FileReader`
4. **BUT** the FileList object is a "live" object that gets cleared when the input element changes or re-renders
5. When form submission happens, `eventImage` (from `watch("eventImage")`) has `length: 0`
6. No image gets uploaded to Cloudinary

### Debug Logs Showed:
```
📸 [DEBUG] File selected: env4.jpg
📸 [DEBUG] File size: 89128
📸 [DEBUG] e.target.files: FileList {0: File, length: 1}
📸 [DEBUG] Setting eventImage value in form
📸 [DEBUG] Form eventImage value after set: FileList {length: 0}  ← ❌ Empty!
```

## Root Cause

**FileList objects are immutable and "live"** - they maintain a reference to the DOM input element. When the input is cleared, modified, or the component re-renders, the FileList becomes empty even if you stored a reference to it. This is a known browser behavior.

## Solution Implemented

✅ **Store the actual File object in React state** instead of relying on the FileList from react-hook-form.

### Changes Made:

#### 1. Added File State (line ~72)
```typescript
const [eventImageFile, setEventImageFile] = useState<File | null>(null);
```

#### 2. Updated handleImageUpload (line ~332)
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Store the actual File object in state ← KEY FIX
    setEventImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEventImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Error processing image:", error);
    toast.error("Failed to process image");
  }
};
```

#### 3. Updated onSubmit (line ~367)
```typescript
const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
  try {
    let imageData: any = null;

    // Use eventImageFile state instead of eventImage from form ← KEY FIX
    if (eventImageFile) {
      const formData = new FormData();
      formData.append("image", eventImageFile);

      const response = await api.post("/v1/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      imageData = response.data;
    }
    // ... rest of the code
  }
};
```

#### 4. Updated Cleanup Functions
```typescript
const removeImage = () => {
  setEventImagePreview(null);
  setEventImageFile(null); // ← Clear the file state
  setValue("eventImage", undefined as any);
};

// In onSubmit after success
reset();
setEventImagePreview(null);
setEventImageFile(null); // ← Clear the file state

// In clearDraft
reset();
setEventImagePreview(null);
setEventImageFile(null); // ← Clear the file state
```

## Next Issue to Address

⚠️ **The `/v1/upload/single` endpoint doesn't exist in the backend!**

When you test now, the file will be properly captured, but you'll get a 404 error when trying to upload.

### You have 3 options:

**Option 1: Create the `/v1/upload/single` endpoint (RECOMMENDED)**
- Create a generic upload controller
- Add the route to your backend
- Handle single file uploads to Cloudinary

**Option 2: Use existing event image upload endpoint**
- Change frontend to use `/v1/event/upload-event-image`
- May need to adjust the endpoint to return the format you need

**Option 3: Send image with event creation in one request**
- Change `/v1/event/add-event` to accept multipart/form-data
- Handle file upload in the event creation endpoint directly

## Testing

1. Start your servers:
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend  
   cd frontend
   npm run dev
   ```

2. Create a volunteer event with an image

3. Check console logs - you should now see:
   ```
   📸 [DEBUG] File selected: filename.jpg
   📸 [DEBUG] Stored file in eventImageFile state
   🔍 [DEBUG] eventImageFile exists: true
   📤 [DEBUG] Starting image upload to Cloudinary...
   ❌ ERROR: 404 Not Found (endpoint doesn't exist)
   ```

## Debug Logs Added

All debug logs are clearly marked with emojis for easy tracking:
- 📸 = Image handling
- 🔍 = Form submission
- 📤 = Upload attempt
- ✅ = Success
- ❌ = Error
- 🗑️ = Image removal
- 🌐 = NGO Context
- 🔵 = Backend Controller
- 🟢 = Backend Service

## Summary

✅ **Fixed**: File is now properly stored and available at form submission
⚠️ **Next**: Need to create the `/v1/upload/single` endpoint in backend

Would you like me to create the missing upload endpoint?
