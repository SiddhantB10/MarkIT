# 📚 MarkIt - Student Attendance Tracker

A modern, full-stack web application for students to track their lecture attendance, manage subjects, and monitor attendance goals. **Built with all 10 Full Stack Development experiments!**

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Experiments](https://img.shields.io/badge/FSD%20Experiments-10%2F10-success)

## ✨ Features

- 📊 **Dashboard** - Real-time overview of attendance statistics
- 📚 **Subject Management** - Add, edit, and track multiple subjects
- 🎓 **Lecture Tracking** - Record attendance for each lecture
- 📈 **Statistics & Analytics** - Visual charts and attendance trends
- 🎯 **Goals** - Set and monitor attendance goals
- 🔔 **Real-time Notifications** - Live updates via Socket.IO
- 👤 **User Profiles** - Personalized settings and preferences
- 🌓 **Dark Mode** - Light and dark theme support
- 📱 **Responsive Design** - Built with Tailwind CSS
- 🔐 **Secure Authentication** - JWT with role-based access
- 🎣 **Custom React Hooks** - useLocalStorage, useDebounce, useFetch, useForm
- 🔄 **Dual State Management** - Context API + Redux Toolkit

## 🎓 FSD Experiments Implemented

This project demonstrates all 10 Full Stack Development experiments:

1. ✅ **Tailwind CSS** - Responsive, interactive UI with dark mode
2. ✅ **React Hooks** - useEffect, useContext, useReducer + custom hooks
3. ✅ **State Management** - Context API & Redux Toolkit
4. ✅ **REST API + MongoDB** - Express + Mongoose
5. ✅ **Secure APIs** - JWT, Helmet, CORS, rate limiting
6. ✅ **Authentication & Roles** - JWT with student/admin roles
7. ✅ **Cloud Deployment** - Render, Vercel, MongoDB Atlas
8. ✅ **WebSockets** - Socket.IO real-time updates
9. ✅ **Production Build** - Optimized builds
10. ✅ **CI/CD** - GitHub Actions, Render, Vercel

📖 See [EXPERIMENTS_CHECKLIST.md](EXPERIMENTS_CHECKLIST.md) for detailed verification.

## 🌐 Live Deployment

### 🚀 Production URLs
- **Frontend (Vercel)**: https://markit-fsd.vercel.app
- **Backend (Render)**: https://markit-y0ii.onrender.com
- **Database**: MongoDB Atlas

### Deployment Guides
- **[Complete Deployment Guide](COMPLETE_DEPLOYMENT_GUIDE.md)** ⭐ - Step-by-step instructions
- **[Quick Deployment Checklist](QUICK_DEPLOYMENT_CHECKLIST.md)** - Fast-track deployment
- **[Connection Guide](CONNECTION_GUIDE.md)** - Service connections diagram
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions

**Total Cost**: $0 (Free tier) 🎉

---

## 💻 Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   cd MarkIt
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api

## 🚀 Deploy to Production

### Deploy to Vercel (Frontend)

```bash
cd frontend
npm i -g vercel
vercel login
vercel --prod
```

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for detailed instructions.

### Deploy to Render (Backend)

See **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** for step-by-step guide.
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 📁 Project Structure

```
MarkIt/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Socket.IO handlers
│   │   └── server.js       # Express app entry
│   ├── tests/              # Jest test suite
│   ├── scripts/            # Database initialization
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context API (Auth, Theme, DataSync)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Socket.IO services
│   │   ├── store/          # Redux Toolkit store
│   │   └── App.jsx         # Main app component
│   ├── .env.example        # Environment template
│   └── package.json
│
├── .github/workflows/       # CI/CD pipelines
│   ├── deploy.yml          # GitHub Actions workflow
├── EXPERIMENTS_CHECKLIST.md # All experiments verification
└── package.json            # Root package with scripts
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Joi** - Validation
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Jest & Supertest** - Testing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management
- **Context API** - Alternative state management
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

### Cloud & Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Database hosting
- **GitHub Actions** - CI/CD pipeline

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://db_user:db_pass@attendancedb.js9kskt.mongodb.net/markit?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

See `backend/.env.example` for all available variables.

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=MarkIt
```

See `frontend/.env.example` for all available variables.

## 🎣 Custom React Hooks

MarkIt includes 4 professional custom hooks:

### useLocalStorage
```jsx
import { useLocalStorage } from '@/hooks';

const [user, setUser, removeUser] = useLocalStorage('user', null);
```

### useDebounce
```jsx
import { useDebounce } from '@/hooks';

const debouncedSearch = useDebounce(searchTerm, 500);
```

### useFetch
```jsx
import { useFetch } from '@/hooks';

const { data, loading, error, refetch } = useFetch('/api/subjects');
```

### useForm
```jsx
import { useForm } from '@/hooks';

const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  onSubmit,
  validate
);
```

## 🔄 State Management

MarkIt uses **both** Context API and Redux Toolkit:

### Context API (Primary)
- **AuthContext** - Authentication state
- **ThemeContext** - Theme management
- **DataSyncContext** - Data synchronization

### Redux Toolkit (Alternative)
- **authSlice** - Authentication
- **subjectsSlice** - Subjects CRUD
- **dashboardSlice** - Dashboard stats
- **uiSlice** - UI state (modals, notifications)

## 🧪 Testing

Run backend tests:

```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm test -- --coverage  # With coverage
```

Tests include:
- Authentication (register, login, JWT)
- Subjects CRUD operations
- Authorization checks

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Subject Endpoints

- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/:id` - Get single subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Lecture Endpoints

- `GET /api/lectures` - Get all lectures
- `POST /api/lectures` - Create lecture
- `GET /api/lectures/:id` - Get single lecture
- `PUT /api/lectures/:id` - Update lecture
- `DELETE /api/lectures/:id` - Delete lecture

### Dashboard Endpoints

- `GET /api/dashboard` - Get dashboard overview
- `GET /api/dashboard/attendance-summary` - Get attendance summary
- `GET /api/dashboard/analytics` - Get analytics

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Scripts

```bash
# Development
npm run dev                  # Start both backend and frontend
npm run dev:backend          # Start backend only
npm run dev:frontend         # Start frontend only

# Installation
npm run install:all          # Install all dependencies
npm run install:backend      # Install backend dependencies
npm run install:frontend     # Install frontend dependencies

# Production
npm run build                # Build frontend for production
npm start                    # Start production server
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**MarkIt Team**

## 🙏 Acknowledgments

- React community for amazing tools
- MongoDB team for excellent database
- All contributors and users

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**⭐ If you like this project, please give it a star!**

Made with ❤️ by MarkIt Team
