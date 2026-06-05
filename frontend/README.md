# Multi-Model AI Platform - Frontend

A modern, premium dark-themed React frontend for the Multi-Model AI Platform.

## Features

- 🎨 Premium dark AI dashboard design with glassmorphism
- 🌐 Multi-language support (English, Hindi, Telugu)
- 🔐 JWT-based authentication
- 📊 Dashboard with analytics and activity tracking
- 🤖 Four AI Hubs: Medical, Agriculture, Finance, Student
- 📱 Fully responsive design
- ⚡ Built with React + Vite for fast development

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Router** - Routing
- **React Markdown** - Markdown rendering

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── config/         # Configuration files
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## API Integration

The frontend is configured to work with the existing backend API:

- **Auth**: `/api/auth/*`
- **Dashboard**: `/api/dashboard/*`
- **Medical**: `/api/medical/*`
- **Agriculture**: `/api/agriculture/*`
- **Finance**: `/api/finance/*`
- **Student**: `/api/student/*`

All API calls include JWT authentication tokens automatically.

## Design System

- **Colors**: Dark blue (#0a0e27), Navy (#1a1f3a), Neon Cyan (#00f0ff), Neon Blue (#0066ff)
- **Components**: Glass cards, gradient buttons, neon accents
- **Animations**: Smooth transitions and hover effects

## Notes

- The backend must be running on port 5000 for the frontend to work
- JWT tokens are stored in localStorage
- All protected routes require authentication
- Language preference is saved in localStorage
