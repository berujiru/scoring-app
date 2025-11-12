# Event Detail Management - Quick Start Guide

## 🚀 Quick Reference

### What's New?
Your EventDetail page now includes:
- ✅ **Edit Event** - Update event name and description
- ✅ **Add Contestants** - Add competitors to the event
- ✅ **Add Judges** - Add judges with auto-generated codes
- ✅ **Add Criteria** - Define scoring criteria with weights
- ✅ **Delete Items** - Remove contestants, judges, or criteria
- ✅ **Real-time Updates** - All changes reflect instantly

---

## 💡 How to Use

### As Event Creator

#### Edit Event Details
```
1. Click "Edit Event" button (top right)
2. Change event name or description
3. Click "Save Changes"
4. Event updates immediately
```

#### Add Contestant
```
1. Go to "Contestants" section
2. Click "Add" button
3. Enter contestant name
4. Click "Add Contestant"
5. New contestant appears in list
```

#### Add Judge
```
1. Go to "Judges" section
2. Click "Add" button
3. Enter judge name
4. Click "Add Judge"
5. See success message with unique code
6. Share the code with the judge
7. Judge appears in list with code
```

#### Add Scoring Criteria
```
1. Go to "Scoring Criteria" section
2. Click "Add" button
3. Enter criteria name (e.g., "Creativity")
4. Set weight percentage (0-100%)
   - Use slider for quick selection
   - Or type directly in number field
5. Click "Add Criteria"
6. Criteria appears with visual weight bar
```

#### Delete Item
```
1. Hover over contestant/judge/criteria
2. Red delete icon (✕) appears on right
3. Click delete icon
4. Confirm deletion in modal
5. Item removed immediately
```

### As Viewer (Not Creator)
```
- See all event details (read-only)
- Cannot edit, add, or delete
- Edit/Add/Delete buttons hidden
```

---

## 🎨 Visual Indicators

### Edit Button
- **Location:** Top right of event header
- **Color:** Indigo (primary color)
- **Visible to:** Event creator only
- **Icon:** Pencil icon

### Add Buttons
- **Location:** Header of each section
- **Colors:** 
  - Contestants: Blue
  - Judges: Purple
  - Criteria: Green
- **Visible to:** Event creator only
- **Icon:** Plus icon

### Delete Buttons
- **Location:** Right side of each item
- **Behavior:** Appears on hover
- **Color:** Red
- **Visible to:** Event creator only
- **Icon:** Trash can

---

## 📋 Modal Forms

### Edit Event Modal
```
Form Fields:
- Event Name * (required)
- Description (optional)

Buttons:
- Cancel
- Save Changes
```

### Add Contestant Modal
```
Form Fields:
- Contestant Name * (required)

Buttons:
- Cancel
- Add Contestant
```

### Add Judge Modal
```
Form Fields:
- Judge Name * (required)

Result (on success):
- Shows unique access code
- "Copy Code" button
- "Done" button to close
```

### Add Criteria Modal
```
Form Fields:
- Criteria Name * (required)
- Weight Percentage * (0-100)
  - Slider control
  - OR number input

Buttons:
- Cancel
- Add Criteria
```

---

## 🔑 Judge Access Codes

### What are they?
- Unique code generated for each judge
- Used by judges to access scoring interface
- Shows in success message after adding judge

### How to share
```
1. Add judge via modal
2. See success message with code
3. Click "Copy Code" button
4. Share via email, message, etc.
5. Judge uses code to access event
```

### How to find code
```
- Visible in Judges section
- Hover over judge name
- Code shown in purple box
- Also displays in list
```

---

## ✅ Form Validation

### Required Fields
- Event Name (min 1 character)
- Contestant Name (min 1 character)
- Judge Name (min 1 character)
- Criteria Name (min 1 character)
- Criteria Percentage (0-100)

### Error Messages
- "Event name is required"
- "Contestant name is required"
- "Judge name is required"
- "Criteria name is required"
- "Percentage must be between 0 and 100"

### Whitespace Handling
- Automatically trimmed
- Empty spaces not allowed
- Description can be empty (optional)

---

## 🔄 Updates & Refreshes

### Auto-Refresh
- ✅ After creating item → list updates
- ✅ After deleting item → list updates
- ✅ After editing event → page updates
- ✅ Stats cards auto-update

### Manual Refresh
- Navigate away and back to event
- Or close and re-open event detail page

---

## 🛡️ Permission Controls

### Only Event Creator Can:
- ✅ Edit event name/description
- ✅ Add contestants
- ✅ Add judges
- ✅ Add criteria
- ✅ Delete contestants
- ✅ Delete judges
- ✅ Delete criteria

### Everyone Can:
- ✅ View event details
- ✅ View contestants list
- ✅ View judges list
- ✅ View criteria and weights

---

## 🎯 Typical Workflow

### Setting Up a New Event

```
Step 1: Create Event (on Events page)
  └─ Enter name & description

Step 2: Go to Event Detail
  └─ Click event card

Step 3: Add Contestants
  └─ Click "Add" in Contestants
  └─ Add each competitor

Step 4: Add Judges
  └─ Click "Add" in Judges
  └─ Add each judge
  └─ Get unique code for each
  └─ Share codes with judges

Step 5: Add Criteria
  └─ Click "Add" in Criteria
  └─ Add scoring criteria
  └─ Set weight percentages
  └─ Total should equal 100%

Step 6: Ready to Score
  └─ Event ready for judging
  └─ Judges use codes to access
  └─ View results dashboard
```

---

## ⚠️ Important Notes

### Before Deleting
- Cannot undo deletion
- Confirmation required
- Consider impact on scoring

### Judge Codes
- Each judge gets unique code
- Don't share codes between judges
- If lost, delete judge and re-add

### Criteria Percentages
- Total doesn't need to equal 100%
- Can be any values 0-100%
- Each criteria weighted independently

### Editing Events
- Only creator can edit
- Changes apply immediately
- No version history

---

## 🆘 Common Issues

### Modal won't open
- Check you're logged in
- Verify you're event creator
- Refresh page and try again

### Changes not showing
- Page might be caching
- Refresh page with F5
- Check network connection

### Can't delete items
- Are you the event creator?
- Try confirming deletion in modal
- Check network connection

### Judge codes not visible
- Make sure judges were created successfully
- Check judges list
- Refresh page

### Form validation errors
- Enter required fields
- Check field is not empty
- No special characters needed

---

## 💡 Tips & Tricks

### Quick Judge Setup
```
1. Add all judges at once
2. Copy each code as it appears
3. Paste in bulk message/email
4. Judges share codes with each other
```

### Organizing Criteria
```
- Start with main criteria
- Add 4-5 key evaluation areas
- Distribute percentages evenly
- e.g., 20% each for 5 criteria
```

### Managing Contestants
```
- Alphabetical order (user adds)
- Number participants as added
- Can delete if added by mistake
- Search using browser find (Ctrl+F)
```

---

## 📊 Sections Overview

### Contestants Section
```
Card Layout:
- Title: "Contestants"
- Count: Number badge in stats
- Add button: "Add" (blue)
- Items show: Name, ID
- Delete: On hover, red X
```

### Judges Section
```
Card Layout:
- Title: "Judges"
- Count: Number badge in stats
- Add button: "Add" (purple)
- Items show: Name, Code, ID
- Delete: On hover, red X
```

### Criteria Section
```
Card Layout:
- Title: "Scoring Criteria"
- Count: Number badge in stats
- Add button: "Add" (green)
- Items show: Name, Progress bar, %
- Delete: On hover, red X
```

---

## 🎓 Learning Resources

### For More Info
- Read EVENT_DETAIL_MANAGEMENT.md (full guide)
- Check component files in src/components/
- Review API calls in src/api/client.ts

### File References
- EditEventModal.tsx - Event editing
- AddContestantModal.tsx - Add contestants
- AddJudgeModal.tsx - Add judges
- AddCriteriaModal.tsx - Add criteria
- EventDetail.tsx - Main page

---

## ✨ Feature Checklist

When setting up your event, ensure:
- ✅ Event name is descriptive
- ✅ Event description provided (optional but helpful)
- ✅ All contestants added
- ✅ All judges added and codes distributed
- ✅ All criteria added with appropriate weights
- ✅ At least one of each (contestants, judges, criteria)
- ✅ Ready for scoring!

---

**Last Updated:** November 12, 2025  
**Status:** ✅ Live and Production Ready  
**Version:** 1.0.0
