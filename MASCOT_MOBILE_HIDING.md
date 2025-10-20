# Mascot Videos Mobile Visibility Update

## Summary
All decorative mascot videos have been hidden on mobile devices while keeping loading state mascots visible across all screen sizes.

## Changes Made

### 1. Donate Page (`frontend/app/donate/page.tsx`)
**Decorative Mascots (Now Hidden on Mobile):**
- Top-right: `mascot_holdingmoney_video.gif` - Added `hidden md:block`
- Bottom-right: `mascot_joyDance_video.gif` - Already had `hidden md:block`
- Bottom-left: `mascot_watering_video.gif` - Already had `hidden lg:block`

**Loading Mascots (Kept Visible):**
- Line 737: `mascot_walking_video.gif` with `alt="Loading..."` - Shows when fetching campaigns
- Line 851: `mascot_joyDance_video.gif` with `alt="Loading..."` - Suspense fallback

### 2. Volunteer Page (`frontend/app/volunteer/page.tsx`)
**Decorative Mascots (Now Hidden on Mobile):**
- Top-left: `mascot_joyDance_video.gif` - Added `hidden md:block`
- Bottom-right: `mascot_watering_video.gif` - Added `hidden md:block`

**Loading Mascots (Kept Visible):**
- Line 476: `mascot_walking_video.gif` with `alt="Loading..."` - Shows when fetching events

### 3. Home Page (`frontend/app/page.tsx`)
**Decorative Mascots (Now Hidden on Mobile):**
- Top-left: `mascot_joyDance_video.gif` - Added `hidden md:block`
- Top-right: `mascot_holdingmoney_video.gif` - Added `hidden md:block`
- Bottom-right: `mascot_jumping_video.gif` - Already had `hidden md:block`
- Bottom-left: `mascot_planting_video.gif` - Already had `hidden lg:block` (commented out)

### 4. Pages with Only Loading Mascots (No Changes Needed)
These pages only use mascot videos for loading states, which should remain visible:

- **Donation Detail Page** (`frontend/app/donate/[donationId]/page.tsx`)
  - Line 142: `mascot_walking_video.gif` with `alt="Loading..."` - Loading state

- **Volunteer Detail Page** (`frontend/app/volunteer/[eventId]/page.tsx`)
  - Line 203: `mascot_walking_video.gif` with `alt="Loading..."` - Loading state

- **Posts Page** (`frontend/app/posts/page.tsx`)
  - Line 814: `mascot_walking_video.gif` with `alt="Loading..."` - Loading state
  - Line 1290: `mascot_joyDance_video.gif` with `alt="Loading..."` - Suspense fallback

## Implementation Details

### Responsive Classes Used
- `hidden md:block` - Hidden on mobile (<768px), visible on tablet and above
- `hidden lg:block` - Hidden on mobile and tablet (<1024px), visible on desktop

### What Users See

**Mobile View (< 768px):**
- ✅ Loading mascots are visible (when content is loading)
- ❌ Decorative mascots are hidden (to reduce visual clutter)

**Tablet & Desktop View (≥ 768px):**
- ✅ All mascots are visible (both loading and decorative)

## Benefits
1. **Cleaner Mobile Interface** - Less visual clutter on small screens
2. **Better Performance** - Fewer GIF animations on mobile devices
3. **Improved UX** - Loading indicators remain visible so users know the app is working
4. **Consistent Experience** - Desktop users still enjoy the full animated experience

## Testing Recommendations
1. Test on mobile devices (phone width < 768px)
2. Verify decorative mascots are hidden on mobile
3. Confirm loading mascots still appear during data fetching
4. Check tablet view (≥ 768px) shows all mascots
5. Test desktop view (≥ 1024px) for full mascot visibility

---
**Date:** October 20, 2025
**Status:** ✅ Complete
