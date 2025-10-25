# Event Participants Manager - Implementation Summary

## Overview
A comprehensive system to track and manage event participants data, visible only to event creators, with full database persistence and audit logging.

## Features Implemented

### 1. Frontend Component (`event-participants-manager.tsx`)
Located at: `frontend/components/event-participants-manager.tsx`

**Features:**
- **Visibility Control**: Only visible to the event creator
- **Real-time Data**: Fetches participants from backend API
- **Statistics Dashboard**: Shows total participants, active members, and data records
- **Participant List**: Displays detailed information for each participant:
  - Name, email, contact number
  - Location and user type
  - Points and join date
- **CSV Export**: Download participants data as CSV file
- **Refresh Functionality**: Manual refresh button to get latest data
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Loading States**: Animated loading indicators
- **Error Handling**: User-friendly error messages

### 2. Backend API Endpoint
Route: `GET /v1/event/:eventId/participants`

**Location**: 
- Controller: `backend/src/controllers/ngoEvent.controller.js`
- Route: `backend/src/routes/event.routes.js`

**Features:**
- **Authentication Required**: Uses `authMiddleware`
- **Authorization Check**: Verifies user is the event creator
- **Data Population**: Populates full participant details from User collection
- **Data Formatting**: Returns structured participant data with:
  - User ID, name, email
  - Contact number and location
  - User type and points
  - Join date (from user creation timestamp)

**Response Format:**
```json
{
  "success": true,
  "participants": [
    {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "contactNumber": "+1234567890",
      "location": "New York",
      "userType": "user",
      "points": 150,
      "joinedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. Database Models & Logging

#### Event Model (Existing - Enhanced)
Located at: `backend/src/models/Event.js`
- Stores participant IDs in `participants` array
- References User model with ObjectId

#### EventParticipantLog Model (New)
Located at: `backend/src/models/EventParticipantLog.js`

**Purpose**: Audit trail for all participant activities

**Schema:**
```javascript
{
  eventId: ObjectId (ref: Event),
  participantId: ObjectId (ref: User),
  action: String (joined/left/removed),
  participantData: {
    name, email, contactNumber, location,
    userType, points (snapshot at join time)
  },
  performedBy: ObjectId (ref: User),
  metadata: { ipAddress, userAgent, notes },
  timestamps: true
}
```

**Static Methods:**
- `logJoin()`: Log when a participant joins
- `logLeave()`: Log when a participant leaves
- `logRemoval()`: Log when participant is removed by admin
- `getEventHistory()`: Get all logs for an event
- `getParticipantHistory()`: Get all logs for a participant

### 4. Integration Points

#### ParticipationRequest Model (Updated)
File: `backend/src/models/ParticipationRequest.js`
- Enhanced `accept()` method to log participant join
- Captures participant data snapshot when request is accepted
- Records who performed the action (event creator)

#### NGO Event Service (Updated)
File: `backend/src/services/ngoEvent.service.js`
- Enhanced `leaveEvent()` to log participant departures
- Maintains audit trail of all participant movements

### 5. Event Detail Page Integration
File: `frontend/app/volunteer/[eventId]/page.tsx`

**Changes:**
- Imported `EventParticipantsManager` component
- Added component below event details
- Passes `eventId` and `isCreator` props
- Only renders when user is the event creator

## Data Flow

### When Participant Joins:
1. User requests participation via `ParticipationRequest`
2. Event creator accepts request
3. `ParticipationRequest.accept()` is called:
   - Adds user to `Event.participants` array
   - Creates `EventParticipantLog` entry with action: "joined"
   - Captures participant data snapshot
4. Frontend can now fetch and display participant data

### When Participant Leaves:
1. User leaves event via frontend
2. `leaveEvent()` service is called:
   - Creates `EventParticipantLog` entry with action: "left"
   - Removes user from `Event.participants` array
3. Audit log maintains historical record

### When Creator Views Participants:
1. Frontend component calls `/v1/event/:eventId/participants`
2. Backend verifies creator authorization
3. Populates full participant data from User model
4. Returns formatted data to frontend
5. Component displays in beautiful UI

## Security Features

1. **Authorization**: Only event creator can view participants
2. **Authentication**: Requires valid auth token
3. **Validation**: Validates eventId format
4. **Error Handling**: Graceful error messages
5. **Data Privacy**: Only necessary fields are exposed

## CSV Export Format

Downloaded file includes:
- Name
- Email
- Contact Number
- Location
- User Type
- Joined At
- Points

File naming: `event_{eventId}_participants_{date}.csv`

## Usage Instructions

### For Event Creators:
1. Navigate to any event you created
2. Scroll below the event details
3. View "Event Participants Management" section
4. See participant statistics and full list
5. Click "Download CSV" to export data
6. Click "Refresh" to get latest data

### For Developers:
The component is reusable and can be added to any page:
```tsx
<EventParticipantsManager 
  eventId="event_id_here" 
  isCreator={true} 
/>
```

## Database Collections

### Events
- Already exists
- Stores participant IDs in `participants` array

### EventParticipantLogs (New)
- Created automatically when participants join/leave
- Provides complete audit trail
- Queryable by event or participant
- Includes timestamps for all actions

## Benefits

1. **Transparency**: Event creators see who participates
2. **Data Export**: Easy CSV export for external use
3. **Audit Trail**: Complete history of all participant actions
4. **Compliance**: Meets data tracking requirements
5. **User Privacy**: Respects participant data privacy
6. **Performance**: Efficient queries with proper indexing
7. **Scalability**: Handles large numbers of participants

## Future Enhancements (Optional)

1. Add email notification to participants
2. Add bulk actions (remove multiple participants)
3. Add participant filters and search
4. Add participant analytics and charts
5. Add export in other formats (Excel, PDF)
6. Add participant communication features
7. Add attendance tracking at events
8. Add participant ratings/feedback

## Testing Checklist

- [ ] Only event creator can see the component
- [ ] Participants data loads correctly
- [ ] CSV export works properly
- [ ] Refresh button updates data
- [ ] Loading states display correctly
- [ ] Error messages show for unauthorized access
- [ ] Responsive design works on mobile
- [ ] Participant logs are created on join/leave
- [ ] Authorization checks work correctly
- [ ] API returns proper error codes

## Files Modified/Created

### Created:
1. `frontend/components/event-participants-manager.tsx`
2. `backend/src/models/EventParticipantLog.js`

### Modified:
1. `frontend/app/volunteer/[eventId]/page.tsx`
2. `backend/src/controllers/ngoEvent.controller.js`
3. `backend/src/routes/event.routes.js`
4. `backend/src/models/ParticipationRequest.js`
5. `backend/src/services/ngoEvent.service.js`

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/event/:eventId/participants` | Required | Get all participants for an event (creator only) |

## Dependencies

No new dependencies required. Uses existing packages:
- Frontend: React, TypeScript, Tailwind CSS, lucide-react
- Backend: mongoose, express

---

**Note**: All participant data is stored securely in the database and is only accessible to authorized event creators. The system maintains a complete audit trail of all participant activities for compliance and transparency.
