# Quick Reference - Semantic Class Names

## All Semantic Class Names Added

### 🎯 Page Structure
```
page-container              → Root page wrapper
├── mascot-decoration       → All background mascots
│   ├── mascot-top-left    → Top left mascot
│   ├── mascot-bottom-right → Bottom right mascot
│   ├── mascot-right       → Middle right mascot
│   └── mascot-left        → Lower left mascot
├── navbar                 → Top navigation bar
└── main-content           → Primary content area
```

### 📱 Sections & Components
```
hero-section               → Title, logo, search, buttons
├── search-bar-wrapper    → Search container
│   └── search-input      → Input field
├── create-post-button    → Create post button
└── create-group-button   → Create group button

tabs-section              → Navigation tabs (Posts, Groups, etc.)

desktop-filters           → Desktop filter bar (hidden on mobile)

content-area              → Main content container
├── center-content        → Posts/groups display
│   ├── mobile-filters    → Mobile filters (hidden on desktop) ✅ FIXED
│   └── posts-header      → Post count & refresh
└── right-sidebar         → Sidebar (hidden on mobile/tablet)
    ├── trending-widget   → Trending topics
    └── activity-widget   → Nearby activity
```

### 🔲 Dialogs
```
create-post-dialog        → Post creation modal
create-group-dialog       → Group creation modal
```

---

## Mobile Filters Fix ✅

### What Was Fixed:
```tsx
// BEFORE (Misaligned)
<div className="flex items-center gap-2 mb-3">
    <Image width={32} height={32} />
    <h3>Filters</h3>
</div>

// AFTER (Properly Aligned)
<div className="flex items-center gap-3 mb-4">
    <Image width={28} height={28} className="flex-shrink-0" />
    <Sparkles className="w-5 h-5 text-teal-500 flex-shrink-0" />
    <h3 className="text-base">Filters</h3>
</div>
```

### Changes:
- ✅ `gap-2` → `gap-3` (better spacing)
- ✅ `mb-3` → `mb-4` (more separation)
- ✅ `32x32` → `28x28` (better proportion)
- ✅ Added `Sparkles` icon (visual balance)
- ✅ Added `flex-shrink-0` (prevents squishing)
- ✅ Added `text-base` (consistent sizing)

---

## Usage Examples

### CSS Targeting:
```css
.navbar { /* Custom navbar styles */ }
.mobile-filters { /* Mobile-specific styles */ }
.trending-widget { /* Widget animations */ }
```

### JavaScript Selection:
```javascript
document.querySelector('.create-post-button')
document.querySelector('.search-input')
document.querySelector('.trending-widget')
```

### Automated Testing:
```typescript
cy.get('.mobile-filters').should('be.visible')
cy.get('.create-post-button').click()
cy.get('.create-post-dialog').should('be.visible')
```

---

## ✅ All Tailwind CSS Preserved

Every semantic class name is added **alongside** Tailwind classes:

```tsx
className="navbar fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
          ↑                                                      ↑
    Semantic Name                                    Tailwind Classes
```

**No styles broken. No conflicts. 100% compatible.**

---

## File Modified

**`frontend/app/posts/page.tsx`**
- 18 semantic class names added
- Mobile filters alignment fixed
- All functionality preserved
