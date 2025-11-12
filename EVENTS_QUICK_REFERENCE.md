# Events Feature - Quick Reference Guide

## File Structure

```
web/src/
├── api/
│   └── client.ts              (Already has eventsApi)
├── components/
│   ├── EventCard.tsx          ✅ NEW - Reusable card component
│   ├── Pagination.tsx         ✅ NEW - Reusable pagination
│   ├── ProtectedRoute.tsx     (Already exists)
│   └── PublicRoute.tsx        (Already exists)
├── hooks/
│   ├── useAuth.ts             (Already exists)
│   └── useEvents.ts           ✅ NEW - Events data hook
└── pages/
    ├── Events.tsx             ✅ UPDATED - Main events list
    ├── EventDetail.tsx        ✅ UPDATED - Event details view
    ├── Login.tsx              (Already updated)
    └── Home.tsx               (Already exists)

backend/src/
├── controllers/
│   └── eventController.ts     ✅ UPDATED - getAllEvents optimization
├── routes/
│   └── events.ts              (Already correct)
└── services/
    └── authService.ts         (Already exists)
```

## Component Tree

```
App
├── AuthProvider
│   └── AppContent
│       ├── Header
│       └── Routes
│           ├── Events/         (requires ProtectedRoute)
│           │   └── useEvents
│           │       └── EventCard[]
│           │           └── Pagination
│           ├── EventDetail/    (requires ProtectedRoute)
│           │   └── (direct API call)
│           ├── Login/          (requires PublicRoute)
│           └── Home/           (public)
```

## How It Works

### 1. Events List Flow
```
User navigates to /events
    ↓
ProtectedRoute checks authentication
    ↓
Events component mounts
    ↓
useEvents hook initializes:
  - Fetches all events from API
  - Sets up search and pagination state
    ↓
Component renders:
  - Search bar
  - EventCard components in grid
  - Pagination controls
    ↓
User interactions:
  - Type in search → filtered results
  - Click page → pagination state updates
  - Click event card → navigate to detail
```

### 2. Event Detail Flow
```
User clicks event card
    ↓
Navigate to /events/:id
    ↓
ProtectedRoute checks authentication
    ↓
EventDetail component mounts
    ↓
useEffect fetches event by ID
    ↓
Renders full event details:
  - Stats cards
  - Contestants list
  - Judges list
  - Criteria with progress bars
    ↓
User can:
  - Click back → return to Events
  - Click edit (future)
  - Navigate with browser back
```

## Key Features Implementation

### Search
```typescript
// In useEvents hook
const filtered = data.filter(
  (event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
)
// Reset to page 1 when search changes
setCurrentPage(1)
```

### Pagination
```typescript
// Calculate which events to show
const startIdx = (currentPage - 1) * ITEMS_PER_PAGE  // 6 items per page
const endIdx = startIdx + ITEMS_PER_PAGE
const paginatedEvents = allEvents.slice(startIdx, endIdx)
```

### State Management
```typescript
// useEvents returns all needed state
{
  events: EventCardData[],           // Paginated results
  isLoading: boolean,                 // Fetch status
  error: string | null,               // Error message
  totalPages: number,                 // Calculated from total
  currentPage: number,                // Current page
  searchQuery: string,                // Search text
  setSearchQuery: (q) => void,        // Update search
  goToPage: (p) => void,              // Go to page
  refetch: () => void                 // Manual refetch
}
```

## Configuration

### Items Per Page
File: `web/src/hooks/useEvents.ts`
```typescript
const ITEMS_PER_PAGE = 6  // Change this value
```

### Grid Columns
File: `web/src/pages/Events.tsx`
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                    mobile   tablet      desktop
// Change: grid-cols-1 → grid-cols-2 for more columns on mobile
```

## API Endpoints Used

### List Events
```
GET /api/events
Response: Event[]
- id, name, description
- active, createdAt, updatedAt
- user { id, name, email }
- _count { contestants, judges, criteria }
```

### Get Event Detail
```
GET /api/events/:id
Response: Event
- All of above plus:
- contestants: Array<{ id, name }>
- judges: Array<{ id, name }>
- criteria: Array<{ id, name, percentage }>
```

## Data Types

```typescript
// EventCardData (for list view)
interface EventCardData {
  id: number
  name: string
  description?: string | null
  active: boolean
  createdAt: string
  user?: {
    id: number
    name: string
    email: string
  }
  _count?: {
    contestants: number
    judges: number
    criteria: number
  }
}

// Full Event (for detail view)
interface Event extends EventCardData {
  contestants?: Array<{ id: number; name: string }>
  judges?: Array<{ id: number; name: string }>
  criteria?: Array<{ id: number; name: string; percentage: number }>
}
```

## Common Tasks

### Add Sorting
```typescript
// In useEvents hook, after fetching:
const sorted = filtered.sort((a, b) => {
  // By name
  return a.name.localeCompare(b.name)
  
  // By date (newest first)
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  
  // By active status
  return b.active === a.active ? 0 : b.active ? -1 : 1
})
```

### Change Items Per Page
```typescript
// web/src/hooks/useEvents.ts
const ITEMS_PER_PAGE = 10  // Changed from 6
```

### Add New Card Fields
```typescript
// In EventCard component
export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={...}>
      {/* Add new field display */}
      <p>{event.newField}</p>
    </Link>
  )
}
```

### Handle Search Debounce (Optional Optimization)
```typescript
// Use useEffect with debounce
const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

useEffect(() => {
  const id = setTimeout(() => {
    fetchEvents()
  }, 300) // Wait 300ms after typing stops
  
  setTimeoutId(id)
  
  return () => clearTimeout(id)
}, [searchQuery])
```

## Testing the Implementation

1. **Events List**: Visit `/events` → Should show events in grid
2. **Search**: Type in search box → Results filter in real-time
3. **Pagination**: With 7+ events, pagination should appear
4. **Event Detail**: Click event → Shows full details
5. **Back Navigation**: Click back button → Returns to list

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No events showing | Check API is running, verify authentication token |
| Search not working | Check event names/descriptions in database |
| Pagination not showing | Need more than 6 events to test |
| Detail page 404 | Verify event ID exists in database |
| Styling looks off | Ensure Tailwind CSS is configured correctly |

## Next Steps

1. **Implement Create Event**
   - Add form component
   - Add to API client
   - Add route (POST)

2. **Implement Edit Event**
   - Modify event data
   - Update via API (PUT)

3. **Implement Delete Event**
   - Add confirmation dialog
   - Delete via API
   - Remove from list

4. **Advanced Features**
   - Sorting controls
   - Filter by status
   - Export to CSV
   - Bulk actions

