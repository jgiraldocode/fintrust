# Quiz Game Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Default Configuration

- Port: 3000
- Admin Password: admin123 (change in production)

## API Endpoints

### Public Endpoints

- `POST /api/register` - Register a new user
- `GET /api/user/:id` - Get user by ID
- `GET /api/game-state` - Check if game is active
- `GET /api/questions` - Get all questions (only if game is active)
- `POST /api/answer` - Submit an answer
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/user-score/:userId` - Get user's score

### Admin Endpoints (require Basic Auth)

- `POST /api/admin/game-state` - Start/stop the game
- `GET /api/admin/questions` - Get all questions (admin view)
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/reset-scores` - Reset all scores

## Admin Authentication

Use Basic Auth with:
- Username: admin
- Password: admin123 (or set ADMIN_PASSWORD environment variable)

