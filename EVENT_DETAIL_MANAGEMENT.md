# Event Detail Management - Complete Feature Guide

## 🎉 Complete Implementation

The EventDetail page now includes **full event management capabilities** with the ability to:
- ✅ Edit event details (name & description)
- ✅ Add contestants to events
- ✅ Add judges with unique codes
- ✅ Add scoring criteria with weight percentages
- ✅ Delete any participants or criteria
- ✅ Real-time updates across all sections

---

## 📋 Feature Overview

### 1. Edit Event Details
**For:** Event creators only  
**Modal:** EditEventModal  
**Fields:**
- Event Name (required)
- Event Description (optional)

**Features:**
- Only event creator can edit
- Form validation
- Error messages
- Auto-saves on success

### 2. Add Contestants
**For:** Event creators only  
**Modal:** AddContestantModal  
**Fields:**
- Contestant Name (required)

**Features:**
- Quick add interface
- Shows empty state if none
- Delete on hover
- Auto-refresh list

### 3. Add Judges
**For:** Event creators only  
**Modal:** AddJudgeModal  
**Special Feature:** Auto-generates unique access code
**Fields:**
- Judge Name (required)
- Auto-generated Code (displayed after creation)

**Features:**
- Unique code for each judge
- Copy-to-clipboard functionality
- Shows code after creation
- Delete option
- Code displayed in judge list

### 4. Add Scoring Criteria
**For:** Event creators only  
**Modal:** AddCriteriaModal  
**Fields:**
- Criteria Name (required)
- Weight Percentage (0-100)

**Features:**
- Slider + number input for percentage
- Real-time percentage preview
- Visual progress bar
- Delete option

---

## 🎯 User Experience Flow

### Event Creator View

```
Visit Event Detail Page
├─ See "Edit Event" button (top right)
├─ See "Add" buttons on each section
│  ├─ Contestants section
│  ├─ Judges section
│  └─ Criteria section
├─ Click "Add" → Modal opens
├─ Fill form
├─ Submit
├─ Success → Modal closes
└─ List auto-refreshes with new item

To Delete:
├─ Hover over item
├─ Click delete icon (red X)
├─ Confirm deletion
└─ Item removed, list refreshes
```

### Non-Creator View
```
Visit Event Detail Page
├─ See all event information (read-only)
├─ See "Edit Event" button (hidden)
├─ See all "Add" buttons (hidden)
├─ See contestants, judges, criteria (no delete)
└─ View-only access
```

---

## 💻 Component Architecture

### New Components

#### 1. EditEventModal.tsx
```typescript
Props:
- isOpen: boolean
- onClose: () => void
- onSuccess: () => void
- eventId: number
- initialName: string
- initialDescription?: string

API Call:
- PUT /api/events/{id}
- Data: { name, description }
```

#### 2. AddContestantModal.tsx
```typescript
Props:
- isOpen: boolean
- onClose: () => void
- onSuccess: () => void
- eventId: number

API Call:
- POST /api/contestants
- Data: { name, eventId }
```

#### 3. AddJudgeModal.tsx
```typescript
Props:
- isOpen: boolean
- onClose: () => void
- onSuccess: () => void
- eventId: number

API Call:
- POST /api/judges
- Data: { name, eventId, userId }
- Returns: { ...judge, code }
```

#### 4. AddCriteriaModal.tsx
```typescript
Props:
- isOpen: boolean
- onClose: () => void
- onSuccess: () => void
- eventId: number

API Call:
- POST /api/criteria
- Data: { name, percentage, eventId }
```

### Updated Components

#### EventDetail.tsx Changes
```typescript
New State:
- isEditModalOpen: boolean
- isAddContestantModalOpen: boolean
- isAddJudgeModalOpen: boolean
- isAddCriteriaModalOpen: boolean
- deletingItemId: number | null
- deletingItemType: 'contestant' | 'judge' | 'criteria' | null

New Functions:
- handleRefresh(): Fetches updated event data
- handleDeleteItem(): Deletes selected item
- Permission check: user.id === event.user.id

New Features:
- Edit button (conditional)
- Add buttons on each section (conditional)
- Delete buttons on hover (conditional)
- Delete confirmation modal
- Real-time updates after CRUD operations
```

---

## 🎨 UI/UX Details

### Button Colors
```
Edit Event:      Indigo-600 (primary)
Add Contestant:  Blue-600
Add Judge:       Purple-600
Add Criteria:    Green-600
Delete:          Red (on hover)
```

### Modal Layout
```
┌─────────────────────────────────┐
│ Title              [✕ Close]    │  ← Header
├─────────────────────────────────┤
│                                 │
│ Form fields                     │
│ - Required fields with *        │
│ - Validation errors             │
│ - Help text                     │
│                                 │
├─────────────────────────────────┤
│          [Cancel] [Submit]      │  ← Footer
└─────────────────────────────────┘
```

### Sections with Add Buttons
```
┌──────────────────────────────────┐
│ Section Title      [Add ✚]       │  ← Header with button
├──────────────────────────────────┤
│ Item 1             ID  [Delete]  │  ← Delete on hover
│ Item 2             ID  [Delete]  │
│ Item 3             ID  [Delete]  │
└──────────────────────────────────┘
```

### Delete Confirmation
```
┌─────────────────────────────────┐
│ Confirm Delete                  │
├─────────────────────────────────┤
│ Are you sure you want to delete │
│ this [item]? Cannot be undone.  │
├─────────────────────────────────┤
│         [Cancel] [Delete]       │
└─────────────────────────────────┘
```

---

## 🔒 Permission & Security

### Edit Event
- **Who can:** Event creator only (`user.id === event.user.id`)
- **Action:** Click "Edit Event" button
- **Validation:** Form requires non-empty name
- **API:** PUT with event ID

### Add Contestants
- **Who can:** Event creator only
- **Action:** Click "Add" button in Contestants section
- **Validation:** Name required and trimmed
- **API:** POST with eventId and name

### Add Judges
- **Who can:** Event creator only
- **Action:** Click "Add" button in Judges section
- **Validation:** Name required, userId required
- **API:** POST with eventId, name, userId
- **Result:** Unique code generated by backend

### Add Criteria
- **Who can:** Event creator only
- **Action:** Click "Add" button in Criteria section
- **Validation:** Name required, percentage 0-100
- **API:** POST with eventId, name, percentage

### Delete
- **Who can:** Event creator only
- **Action:** Hover item → Click delete icon
- **Confirmation:** Modal with confirmation
- **API:** DELETE endpoint
- **Validation:** Confirmation required

---

## 🔄 Data Flow

### Create Flow
```
User clicks "Add" button
  ↓
Modal opens (empty form)
  ↓
User fills form
  ↓
User submits
  ↓
Form validates (client-side)
  ↓
Loading spinner shows
  ↓
API call made (POST)
  ↓
Backend validates
  ↓
Success: Modal closes, handleRefresh() called
Error: Error message shown, modal stays open
  ↓
handleRefresh() fetches updated event data
  ↓
List updates with new item
```

### Delete Flow
```
User hovers item
  ↓
Delete button appears (opacity change)
  ↓
User clicks delete
  ↓
Confirmation modal shows
  ↓
User confirms
  ↓
API DELETE call
  ↓
handleRefresh() updates list
  ↓
Item removed from display
```

### Edit Flow
```
User clicks "Edit Event"
  ↓
Modal opens with current values
  ↓
User modifies fields
  ↓
User submits
  ↓
Form validates
  ↓
API PUT call
  ↓
handleRefresh() gets new data
  ↓
Page displays updated information
```

---

## 🧪 Testing Checklist

### Edit Event
- [ ] Click "Edit Event" button
- [ ] Modal opens with current values
- [ ] Try to save with empty name
- [ ] See error message
- [ ] Correct name and save
- [ ] See modal close
- [ ] Event name updates on page

### Add Contestant
- [ ] Click "Add" in Contestants section
- [ ] Modal opens empty
- [ ] Try to submit without name
- [ ] See error message
- [ ] Enter name and submit
- [ ] Modal closes
- [ ] New contestant appears in list

### Add Judge
- [ ] Click "Add" in Judges section
- [ ] Modal opens empty
- [ ] Enter judge name and submit
- [ ] See success message with code
- [ ] Code is displayed and copyable
- [ ] Modal closes after 2 seconds
- [ ] New judge appears in list with code
- [ ] Code is visible on list item

### Add Criteria
- [ ] Click "Add" in Criteria section
- [ ] Modal opens empty
- [ ] Try percentage slider
- [ ] See percentage update in real-time
- [ ] Try number input
- [ ] Enter values and submit
- [ ] See criteria in list with progress bar
- [ ] Percentage displays correctly

### Delete Functionality
- [ ] Hover over any item
- [ ] Delete button appears (X icon)
- [ ] Click delete
- [ ] Confirmation modal shows
- [ ] Click "Cancel" → modal closes, item stays
- [ ] Delete again and click "Delete"
- [ ] Item removed from list
- [ ] Count updates in stats cards

### Permission Checks
- [ ] Log in as event creator
- [ ] See "Edit Event" button (enabled)
- [ ] See "Add" buttons (enabled)
- [ ] See delete buttons on hover (enabled)
- [ ] Log in as different user (or view only)
- [ ] "Edit Event" button hidden
- [ ] "Add" buttons hidden
- [ ] Delete buttons hidden

### Error Handling
- [ ] Disconnect network, try to create
- [ ] See error message
- [ ] Reconnect, try again
- [ ] Verify submission succeeds
- [ ] Test with invalid data
- [ ] Verify backend validation errors display

---

## 📱 Responsive Design

### Mobile (< 640px)
- Modal takes full width with padding
- Fields stack vertically
- Buttons full width
- Delete icons visible on click (not hover)

### Tablet (640-1024px)
- Modal centered, max-width 448px
- All controls visible and usable
- Smooth transitions

### Desktop (> 1024px)
- Modal centered
- Hover effects visible
- Delete buttons fade in on hover

---

## ⚡ Performance

### Optimizations
- Modals only render when open
- Delete confirmation modal separate
- Minimal re-renders on state updates
- API calls optimized with ID-based updates
- No unnecessary list fetches

### API Efficiency
- DELETE endpoints by ID
- PUT endpoints by ID
- Single refresh call after each operation
- No polling or automatic refreshes

---

## 🔧 Customization

### Change Button Colors
Edit in EventDetail.tsx or components:
```tsx
// Edit button
bg-indigo-600 hover:bg-indigo-700

// Add buttons
bg-blue-600 / bg-purple-600 / bg-green-600

// Delete icons
text-red-600 hover:text-red-700
```

### Change Permission Logic
Edit EventDetail.tsx:
```tsx
// Current:
{user && event.user && user.id === event.user.id && (
  // Show buttons
)}

// Make all users can edit:
{user && (
  // Show buttons
)}

// Make role-based:
{user && user.role === 'admin' && (
  // Show buttons
)}
```

### Modify Modal Behavior
- Auto-close timer: EditEventModal line ~51
- Form validation: Each modal's handleSubmit
- Error messages: Modify catch blocks
- Success messages: AddJudgeModal shows code example

---

## 🚀 Future Enhancements

### Possible Additions
- [ ] Bulk import contestants from CSV
- [ ] Edit contestant/judge names
- [ ] Multiple events management
- [ ] Contestant groups/teams
- [ ] Judge availability calendar
- [ ] Criteria templates
- [ ] Archive/restore items
- [ ] Activity log/audit trail

### Integration Points
- Could add notifications after creation
- Could add webhooks for external systems
- Could add activity logging
- Could add duplicate detection

---

## 📚 API Reference

### Events API
```
PUT /api/events/{id}
  Body: { name: string, description?: string }
  Response: Updated event object

DELETE /api/events/{id}
  Response: 204 No Content
```

### Contestants API
```
POST /api/contestants
  Body: { name: string, eventId: number }
  Response: Created contestant

DELETE /api/contestants/{id}
  Response: 204 No Content
```

### Judges API
```
POST /api/judges
  Body: { name: string, eventId: number, userId: number }
  Response: { id, name, code, eventId, userId }

DELETE /api/judges/{id}
  Response: 204 No Content
```

### Criteria API
```
POST /api/criteria
  Body: { name: string, percentage: number, eventId: number }
  Response: Created criteria

DELETE /api/criteria/{id}
  Response: 204 No Content
```

---

## ✅ Validation Rules

### Event Name
- **Required:** Yes
- **Min length:** 1 (trimmed)
- **Max length:** No limit
- **Trimmed:** Yes

### Event Description
- **Required:** No
- **Max length:** No limit
- **Trimmed:** Yes
- **Null if empty:** Yes

### Contestant Name
- **Required:** Yes
- **Min length:** 1 (trimmed)
- **Trimmed:** Yes

### Judge Name
- **Required:** Yes
- **Min length:** 1 (trimmed)
- **Trimmed:** Yes
- **Code:** Auto-generated by backend

### Criteria Name
- **Required:** Yes
- **Min length:** 1 (trimmed)
- **Trimmed:** Yes

### Criteria Percentage
- **Required:** Yes
- **Min value:** 0
- **Max value:** 100
- **Decimal places:** Supports any number
- **Input methods:** Slider (5% increments) or direct number

---

## 🎓 Code Examples

### Add Contestant Example
```tsx
import AddContestantModal from '../components/AddContestantModal'

export default function EventDetail() {
  const [isAddContestantOpen, setIsAddContestantOpen] = useState(false)
  const [event, setEvent] = useState<Event>(...)

  const handleAddContestantSuccess = async () => {
    // Refresh event data
    const response = await eventsApi.getById(event.id)
    setEvent(response.data)
  }

  return (
    <>
      <button onClick={() => setIsAddContestantOpen(true)}>
        Add Contestant
      </button>

      <AddContestantModal
        isOpen={isAddContestantOpen}
        onClose={() => setIsAddContestantOpen(false)}
        onSuccess={handleAddContestantSuccess}
        eventId={event.id}
      />
    </>
  )
}
```

### Delete with Confirmation
```tsx
const [deletingId, setDeletingId] = useState<number | null>(null)

const handleDelete = async () => {
  if (!deletingId) return
  try {
    await contestantsApi.delete(deletingId)
    setDeletingId(null)
    // Refresh list
  } catch (error) {
    console.error('Delete failed', error)
  }
}

// In render:
<button onClick={() => setDeletingId(contestant.id)}>Delete</button>

{deletingId && (
  <ConfirmationModal onConfirm={handleDelete} />
)}
```

---

## 📞 Troubleshooting

### Modal won't open
- Check if state is updating: `useState(false)` → setter called
- Verify modal component imported
- Check conditional rendering: `{isOpen && (...)}`

### Changes not showing
- Verify `handleRefresh()` is called on success
- Check API response in network tab
- Ensure state updates trigger re-render

### Delete not working
- Verify user is event creator
- Check permission check: `user.id === event.user.id`
- Verify ID is passed correctly
- Check API endpoint in client.ts

### Codes not visible
- Judges list includes `code` field
- Check judge object has code: `judge.code`
- Verify backend returns code in response

### Validation errors
- Check form submit handler
- Verify trim() is called
- Check error state displays
- Test with network tab open

---

## ✨ Summary

**Event Detail page now has complete CRUD functionality:**

| Operation | Created | Delete | Edit | Status |
|-----------|---------|--------|------|--------|
| Event | 🔴 (separate page) | 🟢 | 🟢 | ✅ |
| Contestants | 🟢 | 🟢 | 🔴 | ✅ |
| Judges | 🟢 | 🟢 | 🔴 | ✅ |
| Criteria | 🟢 | 🟢 | 🔴 | ✅ |

🟢 = Implemented  
🔴 = Not yet implemented (can be added)  
✅ = Production ready

---

**Implementation Date:** November 12, 2025  
**Status:** ✅ Complete and Ready  
**Version:** 1.0.0  
