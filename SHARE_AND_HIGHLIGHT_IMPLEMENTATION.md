# Share Functionality and URL Highlighting Implementation

## Overview
Implemented comprehensive share functionality with URL parameter handling and visual highlighting for posts, groups, events, and donation events. When users share a link and someone clicks it, the specific item scrolls into view and gets highlighted.

## Features Implemented

### 1. Posts Sharing and Highlighting ✅
**File:** `frontend/app/posts/page.tsx`

#### Features:
- Share button already existed in PostDisplay component
- Added URL parameter handling for `postId`
- Automatic scrolling to shared post
- Visual highlight with blue ring for 3 seconds
- Switches to posts tab automatically if needed

#### Implementation Details:
```typescript
// Added imports
import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// Added state
const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());

// URL parameter handling
useEffect(() => {
  const postId = searchParams.get('postId');
  if (postId) {
    setActiveTab('posts');
    setHighlightedPostId(postId);
    // Scroll and highlight logic
  }
}, [searchParams, posts.length]);
```

#### Visual Enhancement:
- Blue ring: `ring-4 ring-blue-500 ring-offset-2 rounded-xl shadow-2xl`
- Smooth scroll: `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Auto-dismiss: Highlight removes after 3 seconds

---

### 2. Groups Sharing and Highlighting ✅
**File:** `frontend/components/group-display.tsx` (already implemented)

#### Features:
- Share icon button on all group cards
- URL format: `/posts?groupId={groupId}`
- Copies link to clipboard with toast notification
- Handles both member and non-member cards

#### Implementation:
```typescript
const handleShare = async () => {
  try {
    const groupUrl = `${window.location.origin}/posts?groupId=${group._id}`;
    await navigator.clipboard.writeText(groupUrl);
    toast({
      title: 'Link copied!',
      description: 'Group link copied to clipboard',
    });
  } catch (error) {
    toast({
      title: 'Failed to copy link',
      description: 'Please try again',
      variant: 'destructive'
    });
  }
};
```

---

### 3. Events Sharing and Highlighting ✅
**File:** `frontend/app/volunteer/page.tsx`

#### Features Added:
- **Share Icon**: Added Share2 icon button to each event card header
- **URL Handling**: Detects `eventId` parameter in URL
- **Auto Tab Switching**: Determines event type and switches to correct tab (virtual/in-person/community)
- **Visual Highlight**: Blue ring around highlighted event
- **Smooth Scrolling**: Automatically scrolls to shared event

#### Implementation:
```typescript
// Added imports
import { Share2 } from 'lucide-react';
import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Share function
const handleShare = async (event: any, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent card click
  try {
    const eventUrl = `${window.location.origin}/volunteer?eventId=${event._id}`;
    await navigator.clipboard.writeText(eventUrl);
    toast({
      title: 'Link copied!',
      description: 'Event link copied to clipboard',
    });
  } catch (error) {
    toast({
      title: 'Failed to copy link',
      description: 'Please try again',
      variant: 'destructive'
    });
  }
};

// URL handling with tab detection
useEffect(() => {
  const eventId = searchParams.get('eventId');
  if (eventId && events.length > 0) {
    const targetEvent = events.find(e => e._id === eventId);
    if (targetEvent) {
      const eventType = targetEvent.eventType?.toLowerCase() || 'community';
      setActiveTab(eventType as 'virtual' | 'in-person' | 'community');
    }
    setHighlightedEventId(eventId);
    // Scroll logic...
  }
}, [searchParams, events.length]);
```

#### UI Changes:
- Share button positioned in top-right of card header
- Icon-only button with hover state
- Doesn't interfere with card click functionality
- Title padding adjusted: `pr-16` to prevent overlap

---

### 4. Donation Events Sharing and Highlighting ✅
**File:** `frontend/app/donate/page.tsx`

#### Features Added:
- **Share Icon**: Added Share2 icon next to status badge
- **URL Handling**: Detects `donationId` parameter
- **Visual Highlight**: Blue ring around highlighted donation card
- **Smooth Scrolling**: Automatically scrolls to shared donation

#### Implementation:
```typescript
// Added imports
import { Share2 } from 'lucide-react';
import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast as shadToast } from '@/hooks/use-toast';

// Share function
const handleShare = async (event: DonationEvent, e: React.MouseEvent) => {
  e.stopPropagation();
  try {
    const donationUrl = `${window.location.origin}/donate?donationId=${event._id}`;
    await navigator.clipboard.writeText(donationUrl);
    shadToast({
      title: 'Link copied!',
      description: 'Donation event link copied to clipboard',
    });
  } catch (error) {
    shadToast({
      title: 'Failed to copy link',
      description: 'Please try again',
      variant: 'destructive'
    });
  }
};

// URL handling
useEffect(() => {
  const donationId = searchParams.get('donationId');
  if (donationId && events.length > 0) {
    setHighlightedDonationId(donationId);
    setTimeout(() => {
      const donationElement = donationRefs.current.get(donationId);
      if (donationElement) {
        donationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setTimeout(() => setHighlightedDonationId(null), 3000);
      }
    }, 500);
  }
}, [searchParams, events.length]);
```

#### UI Integration:
- Share button next to status badge in card header
- Wrapped each Card in a div with ref for scrolling
- Highlight applied to wrapper div
- Maintains existing hover effects

---

## URL Formats

| Feature | URL Format | Example |
|---------|-----------|---------|
| **Posts** | `/posts?postId={id}` | `/posts?postId=68e9eb7179ccd6d2f52f3522` |
| **Groups** | `/posts?groupId={id}` | `/posts?groupId=abc123def456` |
| **Events** | `/volunteer?eventId={id}` | `/volunteer?eventId=event789xyz` |
| **Donations** | `/donate?donationId={id}` | `/donate?donationId=donation456abc` |

---

## Technical Implementation

### Scroll and Highlight Pattern
```typescript
// 1. Setup refs map
const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

// 2. Handle URL parameter
useEffect(() => {
  const itemId = searchParams.get('paramName');
  if (itemId && items.length > 0) {
    setHighlightedId(itemId);
    
    setTimeout(() => {
      const element = itemRefs.current.get(itemId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    }, 500);
  }
}, [searchParams, items.length]);

// 3. Apply ref to rendered items
<div
  ref={(el) => {
    if (el && item._id) {
      itemRefs.current.set(item._id, el);
    } else if (item._id) {
      itemRefs.current.delete(item._id);
    }
  }}
  className={`${
    highlightedId === item._id 
      ? 'ring-4 ring-blue-500 ring-offset-2 shadow-2xl' 
      : ''
  }`}
>
  {/* Item content */}
</div>
```

### Share Function Pattern
```typescript
const handleShare = async (item: any, e: React.MouseEvent) => {
  e.stopPropagation(); // Important!
  
  try {
    const url = `${window.location.origin}/path?paramId=${item._id}`;
    await navigator.clipboard.writeText(url);
    
    toast({
      title: 'Link copied!',
      description: 'Item link copied to clipboard',
    });
  } catch (error) {
    toast({
      title: 'Failed to copy link',
      description: 'Please try again',
      variant: 'destructive'
    });
  }
};
```

---

## Visual Design

### Highlight Styling
```css
ring-4           /* 4px ring width */
ring-blue-500    /* Blue color */
ring-offset-2    /* 2px spacing from element */
rounded-xl       /* Rounded corners */
shadow-2xl       /* Enhanced shadow */
```

### Share Button Styling
```css
/* Icon button */
p-2                        /* Padding */
hover:bg-gray-100         /* Hover background */
rounded-lg                /* Rounded corners */
transition-colors         /* Smooth transition */
```

### Icon Size
```tsx
<Share2 className="w-4 h-4 text-gray-600" />
```

---

## User Experience Flow

### Sharing Flow:
1. User clicks share button (Share2 icon)
2. URL copied to clipboard
3. Toast notification confirms success
4. User can paste link anywhere

### Opening Shared Link Flow:
1. User clicks shared link
2. Page loads with parameter in URL
3. Component detects parameter
4. (For events) Switches to correct tab if needed
5. Scrolls smoothly to target item (500ms delay)
6. Item highlighted with blue ring
7. Highlight fades after 3 seconds

---

## Browser Compatibility

### Clipboard API
- **Modern Browsers**: Full support
- **HTTPS Required**: Clipboard API requires secure context
- **Fallback**: Shows error toast if clipboard access denied

### Scroll Behavior
- **Smooth Scroll**: Supported in all modern browsers
- **Fallback**: Instant scroll in older browsers
- **Mobile**: Works on all mobile browsers

---

## Testing Checklist

### Posts
- [x] Share button copies correct URL
- [x] URL with postId loads and highlights post
- [x] Switches to posts tab if on different tab
- [x] Scrolls to post position
- [x] Highlight removes after 3 seconds
- [x] Works with filtered/searched posts

### Groups  
- [x] Share button on member cards works
- [x] Share button on non-member cards works
- [x] URL with groupId opens group details
- [x] Toast notification shows success

### Events
- [x] Share button added to all event cards
- [x] Share button doesn't trigger card click
- [x] URL with eventId loads correct tab
- [x] Scrolls to event in correct tab
- [x] Highlight works on virtual events
- [x] Highlight works on in-person events
- [x] Highlight works on community events

### Donation Events
- [x] Share button added next to badge
- [x] Share button visible on all cards
- [x] URL with donationId highlights card
- [x] Scrolls to donation event
- [x] Works with active/completed filters

---

## Edge Cases Handled

1. **Item Not Found**: No error, just no highlight
2. **Multiple Clicks**: Each click copies fresh URL
3. **Clipboard Denied**: Shows error toast
4. **Slow Loading**: 500ms delay ensures DOM is ready
5. **Tab Switching**: Events detect tab from event type
6. **Card Clicks**: `e.stopPropagation()` prevents conflicts
7. **Mobile**: Touch-friendly button size

---

## Performance Considerations

- **Refs Map**: Efficient O(1) lookup
- **Cleanup**: Refs removed when components unmount
- **Debounced Scroll**: 500ms delay prevents race conditions
- **Auto Cleanup**: Highlight state clears after 3 seconds
- **Memoization**: No performance impact on list rendering

---

## Files Modified

1. **frontend/app/posts/page.tsx**
   - Added useRef and useSearchParams imports
   - Added highlightedPostId state
   - Added postRefs map
   - Added useEffect for postId handling
   - Added highlight styling to post wrapper

2. **frontend/components/group-display.tsx**
   - Already had share functionality implemented
   - No changes needed

3. **frontend/app/volunteer/page.tsx**
   - Added Share2 icon import
   - Added useRef and useSearchParams imports
   - Added toast import
   - Added highlightedEventId state
   - Added eventRefs map
   - Added handleShare function
   - Added useEffect for eventId handling with tab detection
   - Added share button to event card header
   - Added highlight styling to event card

4. **frontend/app/donate/page.tsx**
   - Added Share2 icon import
   - Added useRef and useSearchParams imports
   - Added shadToast import (to avoid conflict with react-toastify)
   - Added highlightedDonationId state
   - Added donationRefs map
   - Added handleShare function
   - Added useEffect for donationId handling
   - Wrapped Card in div with ref
   - Added share button next to badge
   - Added highlight styling to wrapper div

---

## Future Enhancements

1. **Social Sharing**: Add native share API for mobile
2. **Preview Cards**: OpenGraph meta tags for rich previews
3. **Analytics**: Track share button usage
4. **Deep Linking**: Support for app deep links
5. **QR Codes**: Generate QR codes for events
6. **Share Count**: Display how many times shared
7. **Multiple Highlights**: Support highlighting multiple items
8. **Persistent Highlight**: Option to keep highlight until user interacts

---

## Notes

- All share functions use Clipboard API (requires HTTPS in production)
- Highlight timing (3 seconds) can be adjusted in code
- Scroll delay (500ms) can be tuned based on performance
- Blue ring color can be customized via Tailwind classes
- Share icon is consistent across all features (Share2 from lucide-react)
- Toast notifications use shadcn/ui toast component for consistency

---

## Success Criteria ✅

- ✅ Posts: Share and highlight working
- ✅ Groups: Share and highlight working (already implemented)
- ✅ Events: Share icon added, URL handling implemented, tab switching works
- ✅ Donation Events: Share icon added, URL handling implemented
- ✅ All features use consistent UI/UX
- ✅ No TypeScript errors
- ✅ Smooth scroll behavior
- ✅ Visual feedback on all actions
- ✅ Mobile-friendly touch targets
- ✅ Error handling for clipboard failures
