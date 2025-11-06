# Quiz Game Frontend

Vue.js 3 frontend for the Quiz Game application.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Features

- Vue 3 with Composition API
- Vue Router for navigation
- Pinia for state management
- Tailwind CSS for styling
- D3.js for graph visualization
- QRCode.js for QR generation
- Mobile-first responsive design

## Project Structure

```
/src
  /api          - API client functions
  /components   - Reusable components
  /router       - Route definitions
  /stores       - Pinia stores
  /views        - Page components
  main.js       - App entry point
  App.vue       - Root component
  style.css     - Global styles
```

## Views

- **HomeView**: Landing page with navigation
- **RegisterView**: User registration with QR code
- **WaitingView**: Waiting room with educational content
- **GameView**: Interactive quiz gameplay
- **ResultsView**: Score summary and feedback
- **LeaderboardView**: Rankings and scores
- **AdminView**: Admin dashboard

## Components

- **NetworkGraph**: D3.js-based graph visualization with zoom/pan

## Configuration

API proxy is configured in `vite.config.js` to forward `/api` requests to `http://localhost:3000`.

## Styling

Uses Tailwind CSS with custom configuration:
- Mobile-first breakpoints
- Custom color palette (primary blues)
- Large text sizes for accessibility
- Touch-friendly button sizes

## State Management

**User Store** (`stores/user.js`):
- User authentication state
- User ID and name
- LocalStorage persistence

**Game Store** (`stores/game.js`):
- Questions and answers
- Current question index
- Game active state

