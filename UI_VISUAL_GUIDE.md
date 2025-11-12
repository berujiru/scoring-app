# Events Feature - Visual UI Guide

## Page Layouts

### 1. Events List Page (`/events`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    Events List Page                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Events                          [New Event Button]    │
│  Showing 6 of ... events                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ 🔍 Search events by name or description  │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────┐│
│  │   Event Card 1   │  │   Event Card 2   │  │ Card ││
│  │ ────────────────│  │ ────────────────│  │ 3   ││
│  │ Name: Science..│  │ Name: Art...    │  │     ││
│  │ Desc: Lorem... │  │ Desc: Lorem...  │  │     ││
│  │ ⭐ Active      │  │                 │  │     ││
│  │ By: John       │  │ By: Jane        │  │ By: ││
│  │ Date: Nov 12   │  │ Date: Nov 11    │  │ Date││
│  │ Contestants: 5 │  │ Contestants: 8  │  │ Con││
│  │ Judges: 3      │  │ Judges: 2       │  │ Jud││
│  │ Criteria: 4    │  │ Criteria: 5     │  │ Cri││
│  └──────────────────┘  └──────────────────┘  └──────┘│
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────┐│
│  │   Event Card 4   │  │   Event Card 5   │  │ Card ││
│  │ ...             │  │ ...             │  │ 6   ││
│  └──────────────────┘  └──────────────────┘  └──────┘│
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Prev] [1] [2] [3] [4] [5] [Next]                    │
│      ▲ Currently on page 1                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Event Card Detail View

```
┌──────────────────────────────────────────┐
│  Science Fair 2025               ⭐Active│
│  ─────────────────────────────────────── │
│  A showcase of science projects from...  │
│  local schools demonstrating innovation │
│                                          │
│  Created by John Doe                     │
│  john@example.com                        │
│                                          │
│  Nov 12, 2025                            │
│  ─────────────────────────────────────── │
│  Contestants: 5  │ Judges: 3 │ Criteria: 4
└──────────────────────────────────────────┘
```

---

### 2. Event Detail Page (`/events/:id`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ← Back to Events                                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Science Fair 2025                   ⭐ [Edit Button] │
│  ─────────────────────────────────────────────────────│
│  A showcase of science projects from local schools     │
│  demonstrating innovation and scientific thinking.    │
│                                                         │
│  Created by John Doe (john@example.com)               │
│  Created on: November 12, 2025 at 10:30 AM           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Stats Cards Row:                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 👥          │  │ ✓            │  │ 📊          │ │
│  │ Contestants │  │ Judges       │  │ Criteria    │ │
│  │ 5           │  │ 3            │  │ 4           │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Contestants Section    │  Judges Section             │
│  ─────────────────────  │  ─────────────────────     │
│  • Alice Smith    ID:1  │  • Dr. Wilson   ID:10     │
│  • Bob Johnson    ID:2  │  • Prof. Kumar  ID:11     │
│  • Carol White    ID:3  │  • Ms. Chen     ID:12     │
│  • David Lee      ID:4  │                           │
│  • Emma Brown     ID:5  │                           │
│                        │                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Scoring Criteria                                     │
│  ─────────────────────────────────────────────────── │
│  • Creativity          30% ███████░░░░░░░░░░░░░  30% │
│  • Scientific Method   25% ██████░░░░░░░░░░░░░░  25% │
│  • Presentation        25% ██████░░░░░░░░░░░░░░  25% │
│  • Innovation          20% █████░░░░░░░░░░░░░░░  20% │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Structure

### EventCard Component

```
<EventCard event={eventData}>
  ┌─────────────────────────────────────────┐
  │ Link to /events/:id                     │
  │ ┌───────────────────────────────────────┤
  │ │ Event Name              ⭐ Active     │
  │ ├───────────────────────────────────────┤
  │ │ Event description preview (2 lines)   │
  │ │                                       │
  │ │ Created by: John Doe                 │
  │ │ Date: Nov 12, 2025                   │
  │ ├───────────────────────────────────────┤
  │ │ Contestants: 5 │ Judges: 3 │ Cri: 4  │
  │ └───────────────────────────────────────┘
  └─────────────────────────────────────────┘
```

### Pagination Component

```
<Pagination currentPage={1} totalPages={5}>
  
  [Previous] [1] [2] [3] [4] [5] [Next]
      ▲                    ▲
   Disabled when          Highlighted
   on page 1              current page
   
  - Shows max 5 page numbers
  - Hides if totalPages ≤ 1
  - Smart ellipsis for large page counts
  
  Example with 10 pages:
  [Previous] [1] ... [5] [6] [7] [8] ... [10] [Next]
```

---

## States & Variations

### Loading State
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           ⊙    (spinning)                             │
│                                                         │
│           Loading events...                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Error loading events                             │
│  ──────────────────────────────────────────────────── │
│  Failed to fetch events: Network error               │
│                                                         │
│  [Retry Button]                                        │
└─────────────────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           📄 (document icon)                          │
│                                                         │
│           No events found                              │
│                                                         │
│           Try adjusting your search criteria           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
Single Column Grid    Events Stack Vertically
┌──────────┐          ┌───────────────────┐
│ Event 1  │          │ Header + Button   │
└──────────┘          ├───────────────────┤
┌──────────┐          │ Search Bar        │
│ Event 2  │          ├───────────────────┤
└──────────┘          │ Event 1           │
┌──────────┐          ├───────────────────┤
│ Event 3  │          │ Event 2           │
└──────────┘          ├───────────────────┤
                      │ Pagination        │
                      └───────────────────┘
```

### Tablet (640px - 1024px)
```
Two Column Grid

┌──────────────┐  ┌──────────────┐
│ Event 1      │  │ Event 2      │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ Event 3      │  │ Event 4      │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ Event 5      │  │ Event 6      │
└──────────────┘  └──────────────┘
```

### Desktop (> 1024px)
```
Three Column Grid

┌────────────┐  ┌────────────┐  ┌────────────┐
│ Event 1    │  │ Event 2    │  │ Event 3    │
└────────────┘  └────────────┘  └────────────┘
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Event 4    │  │ Event 5    │  │ Event 6    │
└────────────┘  └────────────┘  └────────────┘
```

---

## Color & Styling Reference

### Colors Used
```
Primary:     Indigo-600  (#4F46E5)  - Buttons, highlights
Secondary:   Gray-900   (#111827)  - Text
Neutral:     Gray-600   (#4B5563)  - Secondary text
Background:  White      (#FFFFFF)  - Cards, sections
Border:      Gray-200   (#E5E7EB)  - Dividers
Success:     Green-100  (#DCFCE7)  - Status badges
Error:       Red-50     (#FEF2F2)  - Error messages

Status Badge: Green-100 background, Green-800 text
Active Event: Green badge with checkmark
```

### Typography
```
Page Title:        24px, Bold       (font-semibold)
Section Title:     20px, Bold       (font-semibold)
Card Title:        18px, Bold       (font-semibold)
Body Text:         14px, Regular    (text-sm)
Small Text:        12px, Regular    (text-xs)
```

### Spacing
```
Page Container:    px-4 (mobile), max-w-3xl (desktop)
Section Gap:       24px (space-y-6)
Card Grid Gap:     16px (gap-4)
Card Padding:      24px (p-6)
Input Padding:     8px 16px (py-2 px-4)
Button Padding:    12px 16px (py-3 px-4)
```

---

## Interaction Patterns

### Search Interaction
```
User Types → Real-time Filtering → Results Update
     ↓              ↓                   ↓
  onChange    Filter logic      Grid re-renders
             (client-side)      Pagination resets
```

### Pagination Interaction
```
User Clicks Page → State Updates → URL Changes (optional)
        ↓               ↓                    ↓
  onClick event   setCurrentPage    Grid re-renders
                                    with new slice
```

### Card Click Interaction
```
User Clicks Card → Navigate to Detail → New Page Loads
        ↓               ↓                     ↓
   onClick()    history.push()         API fetch
               /events/:id            useEffect
```

---

## Accessibility Features

```
✅ Semantic HTML
   <Link>, <button>, <input>, <section>

✅ ARIA Labels
   aria-label on search icon
   role="status" on loading spinner

✅ Keyboard Navigation
   Tab through buttons
   Enter to submit search
   Enter to navigate links

✅ Screen Reader Support
   Alt text on icons (via aria-label)
   Form labels associated with inputs
   Status messages announced

✅ Color Contrast
   All text meets WCAG AA standards
   Not relying on color alone for status
```

---

## Animation Reference

### Spinner Animation
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
animation: spin 1s linear infinite;
```

### Hover Effects
```css
EventCard:
  box-shadow: sm → md transition
  border-color: gray-200 → indigo-300 transition
  cursor: pointer

Button:
  background: indigo-600 → indigo-700 transition
  opacity: 100% → 50% when disabled
```

### Loading State
```
Show immediately when loading
Disable interactions during load
Show success state when complete
Persist or dismiss based on state
```

---

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Grid Layout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ | ✅ |
| CSS Animation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responsive | ✅ | ✅ | ✅ | ✅ | ✅ |
| React 18 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tailwind CSS | ✅ | ✅ | ✅ | ✅ | ✅ |

---

**Visual Guide Version**: 1.0  
**Last Updated**: November 12, 2025
