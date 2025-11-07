# User Validation and Game Status Check Update

## Summary

Updated the application to improve security and user flow by:
1. ✅ Validating user existence before allowing game access
2. ✅ Centralizing game status checks only in WaitingView
3. ✅ Removing redundant game status validation from GameView

## Changes Made

### Backend Changes

#### `/backend/routes/game.js`

**1. GET `/questions` endpoint:**
- ✅ Now requires `userId` as query parameter
- ✅ Validates user exists in database before returning questions
- ✅ **Removed** game status check (now handled only in WaitingView via polling)
- ✅ Returns 404 if user not found
- ✅ Returns 400 if userId not provided

```javascript
router.get('/questions', (req, res) => {
  const { userId } = req.query;

  // Validate user exists
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Get questions (game status check removed)
    // ...
  });
});
```

**2. POST `/answer` endpoint:**
- ✅ Added user validation before processing answer
- ✅ Verifies user exists before saving score
- ✅ Returns 404 if user not found

```javascript
router.post('/answer', (req, res) => {
  // Verify user exists
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Continue with answer processing...
  });
});
```

### Frontend Changes

#### `/frontend/src/api/index.js`

**Updated `getQuestions` function:**
```javascript
// Before
export const getQuestions = () => api.get('/questions')

// After
export const getQuestions = (userId) => api.get('/questions', { params: { userId } })
```

#### `/frontend/src/views/GameView.vue`

**Changes:**
1. ✅ Removed `gameStarted` state variable (no longer needed)
2. ✅ Added user authentication check before fetching questions
3. ✅ Pass `userId` to `getQuestions()` API call
4. ✅ Updated error handling for user validation errors
5. ✅ Removed game status check (403 error handling)
6. ✅ Simplified error display

**Before:**
```javascript
onMounted(async () => {
  try {
    const response = await getQuestions()
    gameStore.setQuestions(response.data)
    gameStarted.value = true
  } catch (err) {
    if (err.response?.status === 403) {
      error.value = 'El juego aún no está activo...'
      gameStarted.value = false
    }
    // ...
  }
})
```

**After:**
```javascript
onMounted(async () => {
  // Verify user is authenticated
  if (!userStore.userId) {
    error.value = 'No estás registrado. Por favor regístrate primero.'
    loading.value = false
    return
  }

  try {
    const response = await getQuestions(userStore.userId)
    gameStore.setQuestions(response.data)
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Usuario no encontrado. Por favor regístrate nuevamente.'
    } else if (err.response?.status === 400) {
      error.value = 'Error de validación. Por favor regístrate nuevamente.'
    }
    // ...
  }
})
```

## Flow Improvements

### Previous Flow:
1. User registers → WaitingView (polls game status)
2. Game starts → GameView loads
3. **GameView checks game status again** ❌ (redundant)
4. **GameView doesn't validate user** ❌ (security issue)

### New Flow:
1. User registers → WaitingView (polls game status) ✅
2. Game starts → GameView loads
3. **GameView validates user exists** ✅ (security)
4. **GameView loads questions** ✅ (no redundant check)
5. All game operations verify user ✅

## Benefits

### Security:
- ✅ All game endpoints now validate user existence
- ✅ Prevents deleted/invalid users from playing
- ✅ Prevents score manipulation by non-existent users

### Performance:
- ✅ Removed redundant game status check from questions endpoint
- ✅ Faster question loading (one less database query)
- ✅ Game status check only happens in WaitingView (where it belongs)

### User Experience:
- ✅ Clear error messages for user validation issues
- ✅ Proper redirection if user not registered
- ✅ Centralized game state management in WaitingView

## Error Handling

### GameView Errors:
- **No userId**: "No estás registrado. Por favor regístrate primero."
- **User not found (404)**: "Usuario no encontrado. Por favor regístrate nuevamente."
- **Validation error (400)**: "Error de validación. Por favor regístrate nuevamente."
- **General error**: "No se pudieron cargar las preguntas."

### Answer Submission Errors:
- **User not found (404)**: "User not found"
- **Question not found (404)**: "Question not found"
- **Already answered (400)**: "Question already answered"

## Testing Checklist

- ✅ User can register and play normally
- ✅ Deleted user cannot access questions
- ✅ Deleted user cannot submit answers
- ✅ User without userId in store gets proper error
- ✅ Game status check only happens in WaitingView
- ✅ GameView loads questions without checking game status
- ✅ Error messages are clear and helpful
- ✅ No linter errors

## Backward Compatibility

- ✅ Existing users continue to work normally
- ✅ WaitingView polling mechanism unchanged
- ✅ Admin panel unaffected
- ✅ Leaderboard unaffected
- ✅ All existing functionality preserved

## API Contract Changes

### GET `/questions`
**Before:**
```
GET /questions
Response: 403 if game not active
```

**After:**
```
GET /questions?userId=<uuid>
Response: 404 if user not found
Response: 400 if userId missing
Note: No longer checks game status
```

### POST `/answer`
**Before:**
```
POST /answer { userId, questionId, answer }
Response: Saves answer without user validation
```

**After:**
```
POST /answer { userId, questionId, answer }
Response: 404 if user not found
Response: Validates user before saving
```

## Notes

- Game status (active/inactive) is **only** checked in WaitingView via polling
- Once in GameView, it's assumed game is active (because WaitingView redirected them)
- User validation prevents security issues with deleted/invalid users
- All error messages are in Spanish for consistency

