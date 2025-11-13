# Two Game Rounds Implementation - Complete

## Overview
Successfully implemented a system to divide the game into two independent rounds that can be started separately from the admin panel, with separate and total leaderboards visible to users.

## Implementation Summary

### 1. Database Schema Changes ✅
**File: `backend/database/db.js`**
- Added `active_section` column to `game_state` table (stores which section is currently active: 1, 2, or NULL)
- Added `section` column to `questions` table (default: 1)
- Added `section` column to `scores` table (stores which section each answer belongs to)

**Migration Script: `backend/database/migrate_sections.sql`**
- Successfully migrated existing database to add new columns
- Set all existing questions to section 1
- Updated existing scores with their question's section

### 2. Backend API Updates ✅

#### Admin Routes (`backend/routes/admin.js`)
- **New endpoint**: `POST /admin/game-state/section/:sectionNumber` - Start/stop specific sections
- **Updated**: `POST /admin/game-state` - Now accepts optional `section` parameter
- **Updated**: Question creation/update endpoints now accept `section` field
- **Updated**: GET `/admin/questions` returns section information

#### Game Routes (`backend/routes/game.js`)
- **Updated**: `GET /game-state` - Returns `activeSection` in addition to `isActive`
- **Updated**: `GET /questions` - Filters questions by active section only
- **Updated**: `POST /answer` - Stores section with each score
- **Updated**: `GET /leaderboard` - Accepts `section` query parameter (1, 2, or 'combined')

### 3. Frontend Store Updates ✅
**File: `frontend/src/stores/game.js`**
- Changed `isGameActive` from ref to computed property
- Added `activeSection` ref (null, 1, or 2)
- Updated `setGameActive` to handle section-based activation
- Added `setActiveSection` method for explicit section updates

### 4. Frontend API Client ✅
**File: `frontend/src/api/index.js`**
- **Updated**: `getLeaderboard(section)` - Accepts optional section parameter
- **Added**: `setSectionState(sectionNumber, isActive, password)` - Control specific sections
- **Updated**: `setGameState` - Accepts optional section parameter

### 5. Admin Panel Updates ✅
**File: `frontend/src/views/AdminView.vue`**

**General Tab - Game Controls:**
- Replaced single game control with two section panels:
  - **Section 1 Controls** (blue theme 📘)
  - **Section 2 Controls** (green theme 📗)
- Each section has independent Start/Stop buttons
- Visual status indicators for each section
- Overall game status display

**Questions Tab:**
- Added section dropdown selector (Section 1 / Section 2) when creating/editing questions
- Questions list shows section badges (S1/S2) with colored backgrounds
- Section field is automatically saved with each question

### 6. Leaderboard View Updates ✅
**File: `frontend/src/views/LeaderboardView.vue`**
- Added section filter tabs at the top:
  - **📊 Combinado** - Shows total scores from both sections
  - **📘 Sección 1** - Shows only Section 1 rankings
  - **📗 Sección 2** - Shows only Section 2 rankings
- Tab selection dynamically fetches filtered leaderboard data
- Visual active state for selected tab

### 7. Game View Updates ✅
**File: `frontend/src/views/GameView.vue`**
- Added section badge display on each question
- Badge shows "📘 S1" or "📗 S2" with color-coded backgrounds
- Positioned next to question text for clear visibility

### 8. Waiting View Updates ✅
**File: `frontend/src/views/WaitingView.vue`**
- Updated game state polling to track `activeSection`
- Users see questions from active section only when game starts

## User Experience

### For Administrators:
1. **Round Management**: Start Ronda 1 or Ronda 2 independently
2. **Question Organization**: Assign questions to specific rounds when creating/editing
3. **Clear Visual Separation**: Color-coded rounds (blue for R1, green for R2)

### For Players:
1. **Transparent Gameplay**: Users don't need to know about rounds beforehand
2. **Clear Labels**: Each question shows which round it belongs to (🎯 R1 or 🎯 R2)
3. **Flexible Rankings**: View overall performance (🏆 Total) or round-specific rankings (🎯 Ronda 1, 🎯 Ronda 2)
4. **Round-Specific Questions**: Only see questions from the currently active round
5. **Round Completion Message**: Clear notification when a round is completed

## Technical Features

### Section States:
- `activeSection = null`: No game active
- `activeSection = 1`: Section 1 active, users see only Section 1 questions
- `activeSection = 2`: Section 2 active, users see only Section 2 questions

### Ranking System:
- **Combined**: Sums scores from both sections
- **Section 1**: Shows scores only from Section 1 questions
- **Section 2**: Shows scores only from Section 2 questions
- Tie-breaking: Higher score → earlier finish time → more questions answered

### Data Integrity:
- Existing questions automatically assigned to Section 1
- Scores linked to their question's section
- Backward compatible with single-section gameplay

## Files Modified

**Backend:**
- `backend/database/db.js`
- `backend/database/migrate_sections.sql` (new)
- `backend/routes/admin.js`
- `backend/routes/game.js`

**Frontend:**
- `frontend/src/stores/game.js`
- `frontend/src/api/index.js`
- `frontend/src/views/AdminView.vue`
- `frontend/src/views/LeaderboardView.vue`
- `frontend/src/views/GameView.vue`
- `frontend/src/views/WaitingView.vue`

## Testing Checklist

- [x] Database migration runs successfully
- [x] Admin can start/stop Section 1
- [x] Admin can start/stop Section 2
- [x] Questions can be assigned to sections
- [x] Questions display section badges
- [x] Only active section questions appear for users
- [x] Scores are stored with correct section
- [x] Leaderboard shows combined rankings
- [x] Leaderboard filters by section
- [x] Section labels visible in game view

## Deployment Notes

1. **First-time deployment**: Database will be created with new schema
2. **Existing deployment**: Run migration script before starting server:
   ```bash
   cd backend
   sqlite3 database.db < database/migrate_sections.sql
   ```
3. **Verify migration**: Check that existing questions are assigned to Section 1

## Future Enhancements (Optional)

- Add more than 2 sections
- Section-specific themes/colors
- Section completion tracking
- Analytics per section
- Scheduled section activation

---

**Implementation Date**: 2025-01-13
**Status**: ✅ Complete and Tested

