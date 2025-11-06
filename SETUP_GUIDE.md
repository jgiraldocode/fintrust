# Complete Setup Guide

This guide will walk you through setting up and running the Quiz Game application.

## Prerequisites

Before starting, make sure you have:
- **Node.js** version 16 or higher ([Download here](https://nodejs.org/))
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Terminal/Command Prompt access

## Step-by-Step Setup

### Step 1: Install Backend Dependencies

Open your terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

This will install all required Node.js packages including Express, SQLite3, and others.

### Step 2: Install Frontend Dependencies

In a new terminal window, navigate to the frontend directory:

```bash
cd frontend
npm install
```

This will install Vue.js, Tailwind CSS, D3.js, and other frontend dependencies.

### Step 3: Start the Backend Server

From the `backend` directory:

```bash
npm start
```

You should see:
```
Server is running on port 3000
Database initialized successfully
```

**Keep this terminal window open.** The backend server must stay running.

### Step 4: Start the Frontend Development Server

From the `frontend` directory (in a different terminal):

```bash
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal window open too.**

### Step 5: Access the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the Quiz Game home page!

## First-Time Setup

### Creating Your First Question

1. Go to `http://localhost:5173/admin`
2. Enter the admin password: `admin123`
3. Click **"+ New Question"**
4. Fill in the form:
   - **Question Text**: "How many unique phone numbers are connected to verified persons?"
   - **Graph JSON**: Copy from `EXAMPLE_QUESTION.json` file
   - **Options**: Add 4 options (3 phone numbers is correct)
   - **Correct Answer**: Select option 3
   - **Tip**: Add a helpful learning tip
5. Click **"Preview Graph"** to see the visualization
6. Click **"Create"** to save

### Starting the Game

1. In the admin panel, click **"▶️ Start Game"**
2. The game status should change to **"🟢 ACTIVE"**
3. Now players can start playing!

### Testing as a Player

1. Open a new browser tab or use your phone
2. Go to `http://localhost:5173`
3. Click **"Get Started"**
4. Scan the QR code (or just click "Register")
5. Enter your name and click **"Register"**
6. You'll see the waiting room until the game is active
7. Once active, you'll automatically enter the game
8. Answer the questions and see your results!

## Common Issues and Solutions

### Backend won't start

**Error**: "Port 3000 is already in use"

**Solution**: Either:
- Stop the other application using port 3000
- Or change the port by setting `PORT=3001` before starting:
  ```bash
  PORT=3001 npm start
  ```

### Frontend won't start

**Error**: "Port 5173 is already in use"

**Solution**: The frontend will automatically try the next available port (5174, 5175, etc.)

### Can't connect to backend from frontend

**Error**: Network errors or CORS issues

**Solution**: Make sure:
1. Backend is running on port 3000
2. Frontend is using the proxy configuration in `vite.config.js`
3. Both are running on localhost

### Database errors

**Error**: "SQLITE_CANTOPEN" or similar

**Solution**: The database file will be created automatically on first run. Make sure the backend directory is writable.

## Development Tips

### Auto-Reload

Both servers support auto-reload:
- **Backend**: Use `npm run dev` instead of `npm start` (requires nodemon)
- **Frontend**: Already has hot-reload enabled

### Resetting Everything

To start fresh:
1. Stop both servers (Ctrl+C)
2. Delete `backend/database.db`
3. Restart the backend
4. Database will be recreated empty

### Viewing the Database

The database is a SQLite file at `backend/database.db`. You can view it with:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- Command line: `sqlite3 backend/database.db`

## Production Deployment

### Building the Frontend

```bash
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

### Serving in Production

For production, you'll need to:
1. Serve the built frontend files (from `dist/`)
2. Run the backend with production settings
3. Use environment variables for configuration
4. Set up a proper database (SQLite works, but consider PostgreSQL for scale)
5. Use HTTPS and proper authentication

Example with a simple Node.js static server:

```bash
# Install serve globally
npm install -g serve

# Serve the built frontend
cd frontend/dist
serve -s -p 8080
```

## Security Notes

### Default Admin Password

The default admin password is `admin123`. **CHANGE THIS IN PRODUCTION!**

Set a custom password:
```bash
cd backend
ADMIN_PASSWORD=your_secure_password npm start
```

### CORS Configuration

The backend allows all origins by default. In production, configure CORS to only allow your domain.

## Testing the Application

### Manual Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and shows home page
- [ ] Can access admin panel with password
- [ ] Can create a question with graph preview
- [ ] Can start/stop the game
- [ ] Can register as a new user
- [ ] QR code displays correctly
- [ ] Waiting room shows educational content
- [ ] Game starts when admin activates it
- [ ] Graph displays correctly with zoom/pan
- [ ] Can select answers
- [ ] Feedback shows correctly (correct/incorrect)
- [ ] Tips display after answering
- [ ] Results page shows score
- [ ] Leaderboard displays rankings
- [ ] Can view leaderboard as anonymous user

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Check the browser console (F12 → Console)
3. Verify all prerequisites are installed
4. Make sure both servers are running
5. Try clearing browser cache and localStorage
6. Restart both servers

## Next Steps

Now that your app is running:

1. **Create more questions** with different graph patterns
2. **Customize the styling** in Tailwind configuration
3. **Add more node types** for different use cases
4. **Enhance the admin panel** with analytics
5. **Deploy to production** using your preferred hosting service

Enjoy building your quiz game! 🎉

