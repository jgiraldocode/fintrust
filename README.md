# Quiz Game with QR Registration

An interactive quiz game featuring graph-based questions, QR code registration, and real-time leaderboard. Built with Vue.js and Node.js.

## Features

- 📱 **Mobile-First Design**: Optimized for older users with large text and buttons
- 🔍 **QR Code Registration**: Easy registration via QR code scanning
- 📊 **Graph-Based Questions**: Interactive network graphs with zoom and pan controls
- 🏆 **Real-Time Leaderboard**: Track scores and rankings
- 👨‍💼 **Admin Panel**: Manage questions and control game flow
- 💡 **Learning Tips**: Educational feedback for each question
- ✨ **Smooth Animations**: Enhanced user experience with transitions

## Project Structure

```
/backend         - Node.js + Express API
/frontend        - Vue.js 3 + Tailwind CSS
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

### For Players

1. **Register**: Scan the QR code or visit the registration page
2. **Wait**: View educational content while waiting for the game to start
3. **Play**: Answer graph-based questions with multiple choice options
4. **Results**: See your score and encouraging feedback
5. **Leaderboard**: Compare your performance with others

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Login**: Use password `admin123` (default)
3. **Create Questions**: Add graph-based questions with JSON data
4. **Control Game**: Start/stop the game for all players
5. **Monitor**: View registered users and statistics

## Admin Panel Features

- **Game Controls**: Start/stop the game
- **Question Management**: Create, edit, and delete questions
- **User Management**: View all registered users
- **Graph Preview**: Preview graph visualization before saving
- **Reset Scores**: Clear all scores for a fresh start

## Graph JSON Format

Questions use network graphs with nodes and links:

```json
{
  "nodes": [
    {
      "id": "person1",
      "label": "John Smith",
      "type": "person",
      "status": "verified"
    },
    {
      "id": "phone1",
      "label": "+1 555-0101",
      "type": "phone",
      "status": "verified"
    }
  ],
  "links": [
    {
      "source": "person1",
      "target": "phone1",
      "strength": 0.95
    }
  ]
}
```

Supported node types:
- `person` - Person entity (blue)
- `phone` - Phone number (green)
- `email` - Email address (orange)
- `id` - ID document (purple)
- `device` - Device (pink)
- `location` - Location (teal)

## API Endpoints

### Public Endpoints
- `POST /api/register` - Register new user
- `GET /api/game-state` - Check if game is active
- `GET /api/questions` - Get questions (when game is active)
- `POST /api/answer` - Submit answer
- `GET /api/leaderboard` - Get leaderboard

### Admin Endpoints (Basic Auth)
- `POST /api/admin/game-state` - Start/stop game
- `GET /api/admin/questions` - List all questions
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/reset-scores` - Reset all scores

## Configuration

### Backend
Set environment variables or use defaults:
- `PORT` - Server port (default: 3000)
- `ADMIN_PASSWORD` - Admin password (default: admin123)

### Frontend
Proxy configuration in `vite.config.js` routes `/api` to backend.

## Technology Stack

**Backend:**
- Express.js - Web framework
- SQLite3 - Database
- CORS - Cross-origin support

**Frontend:**
- Vue 3 - Progressive framework
- Vue Router - Routing
- Pinia - State management
- D3.js - Graph visualization
- Tailwind CSS - Styling
- QRCode.js - QR code generation
- Axios - HTTP client

## Design Principles

- **Accessibility**: Large text, high contrast, and touch-friendly targets
- **Mobile-First**: Responsive design that works on all screen sizes
- **Progressive Enhancement**: Core functionality without JavaScript
- **User Feedback**: Clear error messages and loading states
- **Educational**: Tips and explanations for learning

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

