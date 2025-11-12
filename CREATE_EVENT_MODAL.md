# Create Event Modal - Feature Documentation

## Overview

A reusable modal component for creating new events in the Events page. Follows the DRY principle and integrates seamlessly with the existing events system.

## Component

### CreateEventModal.tsx
Located: `web/src/components/CreateEventModal.tsx`

**Purpose**: Display a modal dialog for creating new events with validation and error handling.

**Features**:
- ✅ Modal dialog with overlay
- ✅ Form validation
- ✅ Loading state with spinner
- ✅ Error messages
- ✅ Auto-close on success
- ✅ Reset form on close
- ✅ Accessible (ARIA labels)
- ✅ Responsive design

## Props

```typescript
interface CreateEventModalProps {
  isOpen: boolean              // Whether modal is visible
  onClose: () => void          // Called when modal should close
  onSuccess: () => void        // Called when event created successfully
  userId: number               // ID of current user (event creator)
}
```

## Usage

```tsx
import { CreateEventModal } from '../components/CreateEventModal'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'

function MyComponent() {
  const { user } = useAuth()
  const { refetch } = useEvents()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Create Event
      </button>

      {user && (
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            refetch()  // Refresh events list
          }}
          userId={user.id}
        />
      )}
    </>
  )
}
```

## Form Fields

### 1. Event Name (Required)
- Type: Text input
- Placeholder: "e.g., Science Fair 2025"
- Validation: Must not be empty
- Error: Shown if empty

### 2. Event Description (Optional)
- Type: Textarea
- Placeholder: "Brief description of the event..."
- Rows: 4
- Validation: None (optional field)
- Trimmed on submit

## State Management

```typescript
const [name, setName] = useState('')              // Event name
const [description, setDescription] = useState('') // Event description
const [isLoading, setIsLoading] = useState(false)  // Loading state
const [error, setError] = useState<string | null>(null) // Error message
```

## Form Submission

### Validation Steps
1. Prevent default form submission
2. Clear previous errors
3. Validate event name (required)
4. Set loading state
5. Call API to create event
6. On success:
   - Reset form
   - Call `onSuccess()` callback
   - Close modal
7. On error:
   - Display error message
   - Keep modal open

### API Call
```typescript
await eventsApi.create({
  name: name.trim(),
  description: description.trim() || null,
  userId,
})
```

## Styling

### Modal Structure
```
┌────────────────────────────────┐
│ Header (Title + Close button)  │
├────────────────────────────────┤
│ Body (Form)                    │
│ • Error message (if any)       │
│ • Event Name input             │
│ • Description textarea         │
│ • Help text                    │
├────────────────────────────────┤
│ Footer (Cancel + Create buttons)│
└────────────────────────────────┘
```

### CSS Classes
- **Modal**: `fixed inset-0 z-50 flex items-center justify-center`
- **Overlay**: `fixed inset-0 bg-black bg-opacity-50 z-40`
- **Container**: `bg-white rounded-lg shadow-xl max-w-md`
- **Header**: `border-b border-gray-200 px-6 py-4`
- **Title**: `text-xl font-semibold text-gray-900`
- **Body**: `p-6 space-y-4`
- **Inputs**: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500`
- **Buttons**: `px-4 py-2 rounded-lg font-medium transition-colors`

## Accessibility

### Features
- ✅ ARIA labels on buttons
- ✅ Proper heading hierarchy
- ✅ Focus management
- ✅ Keyboard navigation (Escape to close, Tab between inputs)
- ✅ Error announcements
- ✅ Disabled state styling

### Keyboard Shortcuts
- `Tab`: Move between form fields and buttons
- `Shift+Tab`: Move backwards through form fields
- `Enter`: Submit form (when Create button focused)
- `Escape`: Close modal (from any field)

## Error Handling

### Validation Errors
- **Empty name**: "Event name is required"

### API Errors
- Caught from API response: `err.response?.data?.error`
- Fallback: "Failed to create event"
- Displayed in red alert box above form

### Error Display
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
    {error}
  </div>
)}
```

## Loading States

### During submission
- **Form inputs**: Disabled (cursor: not-allowed)
- **All buttons**: Disabled with reduced opacity
- **Create button**: Shows spinner + "Creating..." text
- **User interaction**: Prevented while loading

### Spinner
```tsx
<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
```

## Integration with Events Page

### Events.tsx Integration
```tsx
// State
const { user } = useAuth()
const [isModalOpen, setIsModalOpen] = useState(false)
const { refetch } = useEvents()

// New Event Button
<button onClick={() => setIsModalOpen(true)}>
  New Event
</button>

// Modal Component
{user && (
  <CreateEventModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSuccess={() => refetch()}
    userId={user.id}
  />
)}
```

## Data Flow

```
User clicks "New Event"
    ↓
setIsModalOpen(true)
    ↓
CreateEventModal renders
    ↓
User fills form + clicks Create
    ↓
handleSubmit called
    ↓
Validation check
    ↓
eventsApi.create() called
    ↓
✓ Success: onSuccess() → refetch() → modal closes
✗ Error: Error displayed in modal
```

## API Endpoint

### POST /api/events
**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string | null (optional)",
  "userId": "number (required)"
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "name": "Science Fair 2025",
  "description": "Annual science showcase",
  "userId": 1,
  "active": true,
  "createdAt": "2025-11-12T...",
  "updatedAt": "2025-11-12T...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Customization

### Change maximum width
```tsx
// Current: max-w-md (448px)
// Change to max-w-lg (512px) for larger modal
className="bg-white rounded-lg shadow-xl max-w-lg w-full"
```

### Change loading spinner color
```tsx
// Current: border-white
// Change to border-indigo-600 for different color
border-2 border-indigo-600 border-t-transparent
```

### Add more form fields
1. Add state variable
2. Add input element in form
3. Add validation
4. Include in API call

Example:
```tsx
const [eventType, setEventType] = useState('')

// In form
<select value={eventType} onChange={(e) => setEventType(e.target.value)}>
  <option>Select type...</option>
  <option>Academic</option>
  <option>Sports</option>
  <option>Cultural</option>
</select>

// In API call
await eventsApi.create({
  name: name.trim(),
  description: description.trim() || null,
  eventType: eventType || null,
  userId,
})
```

## Testing

### Unit Tests (Component)
```typescript
// Test modal opens/closes
// Test form validation
// Test error messages
// Test loading state
// Test successful submission
```

### Integration Tests
```typescript
// Test with Events page
// Test API call
// Test refetch after creation
// Test modal closes on success
```

### Manual Testing
1. **Open Modal**: Click "New Event" button
2. **Validation**: Try to create without name
3. **Success**: Fill form and create event
4. **Refetch**: Verify new event appears in list
5. **Error Handling**: Test with invalid API response

## Known Limitations & Future Enhancements

### Current Limitations
- ❌ Only supports basic fields (name, description)
- ❌ Cannot add contestants/judges/criteria in modal
- ❌ No event type selection
- ❌ No date/time picker

### Future Enhancements
- [ ] Multi-step form wizard
- [ ] Add contestants in modal
- [ ] Add judges in modal
- [ ] Event type dropdown
- [ ] Date/time picker for event dates
- [ ] Event location field
- [ ] Rich text editor for description
- [ ] Image upload for event banner
- [ ] Template selection
- [ ] Duplicate event functionality

## Performance

### Optimization
- ✅ Memoization: Form state only in this component
- ✅ Lazy loading: Modal only renders when `isOpen=true`
- ✅ Debounce: Input changes don't trigger API calls
- ✅ Minimal re-renders: Only state changes trigger updates

### Bundle Size Impact
- File size: ~4 KB
- No additional dependencies
- Reuses existing components (buttons, inputs)

## Security

### Input Validation
- ✅ Name required (prevents empty events)
- ✅ Trim whitespace (prevents accidental spaces)
- ✅ React auto-escapes inputs (XSS prevention)

### Authentication
- ✅ Requires userId (prevents anonymous creation)
- ✅ Backend validates user ownership
- ✅ Auth token sent with API call

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal not opening | Check `isOpen` prop is true |
| Modal not closing | Check `onClose()` is called |
| Event not created | Check API is running, verify userId |
| Error message not showing | Check error state is updating |
| Form not resetting | Check reset logic in handleClose |

---

**Version**: 1.0  
**Status**: ✅ Complete  
**Date**: November 12, 2025
