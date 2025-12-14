# iVolunteer Routes Mapping & Access Guide

## 📋 Complete Route Inventory

### ✅ PUBLIC ROUTES (Accessible without login)

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/` | Home/Landing page with role-based dashboards | Direct URL or logo click | ✅ Active |
| `/aboutus` | About Us page | Header menu or footer | ✅ Active |
| `/volunteer` | Browse volunteer opportunities | Navigation bar | ✅ Active |
| `/donate` | Donation page | Navigation bar or CTA buttons | ✅ Active |
| `/blogs` | Blog listings | Header menu or footer | ✅ Active |
| `/contactus` | Contact form | Header menu or footer | ✅ Active |
| `/privacypolicy` | Privacy policy | Footer link | ✅ Active |
| `/termsofservice` | Terms of service | Footer link | ✅ Active |
| `/sitemap` | Site navigation map | Direct URL | ✅ Active |

### 🔐 AUTHENTICATION ROUTES

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/login` | User login page | Header "Login" button | ✅ Active |
| `/signup` | Volunteer signup | Header "Sign Up" button | ✅ Active |
| `/adminsignup` | Admin registration | Direct URL (restricted) | ✅ Active |
| `/forgot-password` | Password reset | Login page link | ✅ Active |
| `/verify-email` | Email verification | Email link after signup | ✅ Active |
| `/callback` | OAuth callback handler | Google OAuth redirect | ✅ Active |

### 👤 VOLUNTEER ROUTES (Role: user)

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/profile` | User profile & settings | Navigation bar or dashboard | ✅ Active |
| `/badges` | View earned badges | Dashboard widget | ✅ Active |
| `/rewards` | Rewards store | Navigation bar or dashboard | ✅ Active |
| `/posts` | Community posts/feed | Navigation bar | ✅ Active |
| `/volunteer/my-events` | My volunteering events | Profile section | ⚠️ Check if used |

### 🤝 NGO ROUTES (Role: ngo)

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/add-event` | Create volunteer event | Dashboard "Add Event" button | ✅ Active |
| `/donationevent-form` | Create donation event | Dashboard button | ✅ Active |
| `/add-corporate-event` | Create corporate event | Dashboard button | ✅ Active |
| `/addblog` | Create blog post | Admin dashboard CTA | ✅ Active |
| `/manageblogs` | Manage all blogs | Admin dashboard CTA | ✅ Active |
| `/managecopertaeevent` | Manage corporate events | Admin dashboard CTA | ✅ Active |
| `/allngoevents` | View all NGO events | Dashboard event table | ✅ Active |
| `/archived-events` | View archived events | Dashboard CTA | ✅ Active |
| `/corporate-interests` | Corporate interest requests | Dashboard section | ✅ Active |

### 👔 CORPORATE ROUTES (Role: corporate)

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/allcorporateevents` | Browse corporate CSR events | Corporate dashboard | ✅ Active |

### 🛡️ ADMIN ROUTES (Role: admin)

| Route | Purpose | How to Access | Status |
|-------|---------|---------------|--------|
| `/pendingrequest` | Approve user registrations | Admin dashboard CTA | ✅ Active |
| `/pendingcorporateevent` | Approve corporate events | Admin dashboard CTA | ✅ Active |
| `/pendinggrouprequest` | Approve group requests | Admin dashboard CTA | ✅ Active |
| `/donationpendingreq` | Approve donation events | Admin dashboard CTA | ✅ Active |
| `/eventendingreq` | Event completion requests | Admin dashboard CTA | ✅ Active |

---

## ✅ REMOVED DUPLICATE/UNUSED ROUTES

The following routes have been removed as they were duplicates or unused:

| Removed Route | Reason | Replaced By |
|---------------|--------|-------------|
| `/dashboard` | Duplicate - all dashboards now on `/` | `/` |
| `/ngo-dashboard` | Duplicate of main page for NGO role | `/` |
| `/admin` | Duplicate of main page for admin role | `/` |
| `/activities` | Unused page | `/volunteer` |
| `/addcorporateevent` | Duplicate with different naming | `/add-corporate-event` |
| `/endeventarchive` | Duplicate functionality | `/archived-events` |
| `/allsponsorshipevents` | Unused/outdated | `/allcorporateevents` |

---

## 🔍 NOTES

### Dashboard Access by Role
All user dashboards are now consolidated on the main `/` route:
- **Volunteers** see: Welcome message, points display, analytics, daily quote, activities, rewards
- **NGOs** see: Analytics, participation requests, corporate interests, event management
- **Corporates** see: Hero section, services, events list, impact stories, NGO partners
- **Admins** see: Stats, user management, approval queues

### Navigation Bar Behavior
- NGO users: "Dashboard" link → `/` (home)
- Admin users: "Admin" link → `/` (home)
- All users see role-appropriate dashboard content on `/`

---

## 📝 RECENT UPDATES (December 14, 2025)

**Cleaned up duplicate and unused routes:**
- ✅ Removed `/dashboard` folder
- ✅ Removed `/ngo-dashboard` folder
- ✅ Removed `/admin` folder
- ✅ Removed `/activities` folder
- ✅ Removed `/addcorporateevent` folder
- ✅ Removed `/endeventarchive` folder  
- ✅ Removed `/allsponsorshipevents` folder
- ✅ Updated all references to point to correct routes
- ✅ Updated backend notification actionUrls
- ✅ Updated navigation bar to use `/` for role-based dashboards

**Admin login issue fixed:**
- The `/admin` route was causing redirect loops
- Now admins access their dashboard via `/` (home page)
- Role-based rendering shows appropriate content for each user type

---

## 🧪 HOW TO TEST EACH ROUTE

### Method 1: Direct URL Test
```
1. Open browser
2. Navigate to: http://localhost:3000/[route-name]
3. Check if page loads correctly
4. Note any errors or redirects
```

### Method 2: Check References
Run this command to see where each route is referenced:
```powershell
# In PowerShell (run from frontend folder)
Get-ChildItem -Path . -Recurse -Include *.tsx,*.ts -Exclude node_modules | 
Select-String -Pattern 'href="/route-name"' | 
Select-Object Path, LineNumber
```

### Method 3: Check for Unused Routes
Routes with **no references** in the codebase (except their own page.tsx) are likely unused and can be removed.

---

## 📝 RECOMMENDED CLEANUP ACTIONS

---

## 🚀 ALL ROUTES NOW CLEAN AND CONSOLIDATED

All duplicate routes have been removed. The application now uses:
- **`/`** - Main landing page with role-based dashboards (volunteer, NGO, corporate, admin)
- **Specific action routes** - For creating events, managing content, etc.
- **No duplicate dashboard routes** - Everything consolidated to the main page

The navigation and notifications now correctly point to `/` for all dashboard-related actions.
