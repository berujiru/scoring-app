## Testing the Events Feature

### Prerequisites
- Backend server running on `http://localhost:3000`
- Frontend development server running
- User must be authenticated (login required)

### Test Scenarios

#### 1. Events List Page
```
✅ Navigate to /events
✅ Should see "Events" header with "New Event" button
✅ Should see search bar
✅ Events should be displayed in responsive grid:
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns
✅ Each event card should show:
   - Event name
   - Description (truncated)
   - "Active" badge (if active)
   - Creator name
   - Creation date
   - Contestant count
   - Judge count
   - Criteria count
```

#### 2. Search Functionality
```
✅ Type in search bar
✅ Results should filter in real-time
✅ Search works on:
   - Event name
   - Event description
✅ Search is case-insensitive
✅ Clear search to show all events
✅ Pagination resets to page 1 when searching
```

#### 3. Pagination
```
✅ If there are > 6 events:
   - Multiple pages should appear
   - Pagination controls should display
✅ Click "Next" button:
   - Should go to next page
   - URL should update (if URL-based)
   - Page number button should highlight
✅ Click "Previous" button:
   - Should go to previous page
   - Previous button should disable on page 1
✅ Click specific page number:
   - Should jump to that page
✅ Next button should disable on last page
✅ Pagination should hide if only 1 page
```

#### 4. Empty State
```
✅ If no events exist:
   - Should show empty state icon and message
   - Should suggest creating first event
✅ If search returns no results:
   - Should show empty state
   - Should suggest adjusting search
```

#### 5. Loading States
```
✅ On page load:
   - Should show loading spinner
   - Should show "Loading events..." message
✅ Spinner should stop after data loads
✅ While loading:
   - Pagination buttons should be disabled
```

#### 6. Error Handling
```
✅ If API fails:
   - Should show error message
   - Should show which API call failed
✅ If event data is invalid:
   - Should handle gracefully
   - Should show error message
```

#### 7. Event Card Interaction
```
✅ Hover over event card:
   - Should show hover effect
   - Cursor should be pointer
✅ Click on event card:
   - Should navigate to /events/:id
   - Should load event details
```

#### 8. Event Detail Page
```
✅ Navigate to /events/:id
✅ Should show loading spinner initially
✅ Should display:
   - Back button to return to events list
   - Event name (large)
   - "Active Event" badge (if active)
   - Edit button
   - Event description
   - Creator name and email
   - Creation date/time
```

#### 9. Event Stats Cards
```
✅ Should show 3 stat cards:
   - Contestants count with icon
   - Judges count with icon
   - Criteria count with icon
✅ Numbers should match actual data
```

#### 10. Contestants Section
```
✅ Should list all contestants:
   - Show contestant name
   - Show contestant ID
   - Hover effect
✅ If no contestants:
   - Should show "No contestants yet" message
```

#### 11. Judges Section
```
✅ Should list all judges:
   - Show judge name
   - Show judge ID badge
   - Hover effect
✅ If no judges:
   - Should show "No judges yet" message
```

#### 12. Scoring Criteria Section
```
✅ Should list all criteria:
   - Show criteria name
   - Show percentage weight
   - Visual progress bar matching percentage
   - Hover effect
✅ If no criteria:
   - Should show "No scoring criteria defined yet" message
✅ Progress bars should:
   - Display correct width
   - Match the percentage displayed
   - Animate smoothly on load
```

#### 13. Navigation
```
✅ Click "Back to Events" link:
   - Should return to /events page
   - Should scroll to top (optional)
✅ Browser back button:
   - Should work correctly
```

#### 14. Responsive Design
```
Mobile (< 640px):
✅ Header should stack vertically
✅ Grid should show 1 column
✅ Stats cards should be visible (may need scroll)
✅ Text should be readable
✅ Buttons should be tappable (>44px)

Tablet (640px - 1024px):
✅ Grid should show 2 columns
✅ Stats cards should show well
✅ Layout should be balanced

Desktop (> 1024px):
✅ Grid should show 3 columns
✅ Full layout should display correctly
✅ Details sections side by side (2 cols)
```

#### 15. Performance
```
✅ Page should load quickly (< 2 seconds)
✅ Search should be responsive
✅ Pagination should be fast
✅ Images/content should load smoothly
```

### Sample Test Data

Create sample events with:
- Multiple contestants (10+)
- Multiple judges (5+)
- Multiple criteria (3-5)
- Various description lengths
- Mix of active/inactive events

### Example cURL Commands

```bash
# Get all events
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/events

# Get specific event
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/events/1
```

### Browser DevTools

1. **Console Tab**
   - Check for errors or warnings
   - Verify no failed network requests

2. **Network Tab**
   - Verify API calls are made
   - Check response status codes
   - Monitor payload sizes

3. **Performance Tab**
   - Check load times
   - Look for unnecessary re-renders

4. **Responsive Design Mode**
   - Test on various screen sizes
   - Verify touch interactions

### Known Limitations/Future Work

1. ❌ Create new event - Placeholder button (implement in next phase)
2. ❌ Edit event - Button exists but not functional
3. ❌ Delete event - Not implemented
4. ❌ Event filtering (by status, creator, etc.)
5. ❌ Event sorting
6. ❌ Multi-select actions

