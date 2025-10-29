# 📚 MarkIt - Student Attendance Tracker

**Complete Documentation**

> A modern, full-stack web application for students to track lecture attendance, manage subjects, and monitor attendance goals.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [FSD Experiments](#fsd-experiments)
5. [Live Deployment](#live-deployment)
6. [Local Development Setup](#local-development-setup)
7. [Deployment Guide](#deployment-guide)
8. [API Documentation](#api-documentation)
9. [Project Structure](#project-structure)
10. [Environment Variables](#environment-variables)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

MarkIt is a comprehensive attendance tracking system designed for students to monitor their lecture attendance across multiple subjects. Built with modern web technologies, it demonstrates all 10 Full Stack Development experiments with production-ready code.

**Live Application:**
- **Frontend**: https://markit-fsd.vercel.app
- **Backend**: https://markit-y0ii.onrender.com
- **Database**: MongoDB Atlas (Cloud)

---

## ✨ Features

### Core Features
- 📊 **Real-time Dashboard** - Overview of attendance statistics with visual charts
- 📚 **Subject Management** - Add, edit, delete, and archive subjects
- 🎓 **Lecture Tracking** - Mark attendance for each lecture
- 📈 **Analytics & Reports** - Visual charts showing attendance trends
- 🎯 **Goal Setting** - Set and monitor attendance percentage goals
- 🔔 **Live Notifications** - Real-time updates via Socket.IO
- 👤 **User Profiles** - Personalized settings and preferences
- 🔐 **Secure Authentication** - JWT-based auth with role-based access

### Technical Features
- 🌓 **Dark/Light Mode** - Theme switching with system preference detection
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Sync** - WebSocket-based live updates
- 🎣 **Custom Hooks** - 4 production-ready React hooks
- 🔄 **Dual State Management** - Context API + Redux Toolkit
- 🛡️ **Security Features** - Helmet, CORS, rate limiting, input validation
- 🚀 **Optimized Build** - Code splitting, lazy loading, compression

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with hooks |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Redux Toolkit** | Global state management |
| **Context API** | Theme & auth state |
| **Framer Motion** | Animations |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time updates |
| **Recharts** | Data visualization |
| **React Hook Form** | Form management |
| **React Hot Toast** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Socket.IO** | WebSocket server |
| **JWT** | Authentication |
| **Joi** | Input validation |
| **Bcrypt** | Password hashing |
| **Helmet** | Security headers |
| **CORS** | Cross-origin support |
| **Morgan** | HTTP logging |
| **Jest** | Testing framework |

### Cloud Services
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database hosting |

---

## 🎓 FSD Experiments

All 10 Full Stack Development experiments are fully implemented:

### ✅ Experiment 1: Tailwind CSS
**Location**: `frontend/tailwind.config.js`, all components
- Responsive design with custom breakpoints
- Dark mode with `class` strategy
- Custom color schemes
- Utility classes throughout

### ✅ Experiment 2: React Hooks
**Location**: `frontend/src/hooks/`, `frontend/src/contexts/`
- **Built-in Hooks**: useEffect, useContext, useState, useReducer, useCallback
- **Custom Hooks**:
  - `useLocalStorage` - Persistent state with cross-tab sync
  - `useDebounce` - Value and callback debouncing
  - `useFetch` - Data fetching with loading states
  - `useForm` - Form state and validation

### ✅ Experiment 3: State Management
**Location**: `frontend/src/store/`, `frontend/src/contexts/`
- **Context API**: AuthContext, ThemeContext, DataSyncContext
- **Redux Toolkit**: authSlice, subjectsSlice, dashboardSlice, uiSlice

### ✅ Experiment 4: REST API + MongoDB
**Location**: `backend/src/routes/`, `backend/src/models/`
- RESTful API with Express
- Mongoose models: User, Subject, Lecture
- CRUD operations for all entities

### ✅ Experiment 5: Secure APIs
**Location**: `backend/src/middleware/`, `backend/src/server.js`
- JWT authentication
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation with Joi
- Error handling middleware

### ✅ Experiment 6: Authentication & Authorization
**Location**: `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`
- JWT-based authentication
- Role-based access control (student/admin)
- Protected routes
- Token refresh mechanism

### ✅ Experiment 7: Cloud Deployment
**Location**: Production environment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Environment-based configuration

### ✅ Experiment 8: WebSockets
**Location**: `backend/src/utils/socket.js`, `frontend/src/services/socket.js`
- Socket.IO implementation
- Real-time attendance updates
- Live notifications
- Connection management

### ✅ Experiment 9: Production Build
**Location**: `frontend/vite.config.js`, deployment configs
- Optimized Vite builds
- Code splitting
- Asset optimization
- Environment variables

### ✅ Experiment 10: CI/CD
**Location**: Vercel & Render auto-deployment
- GitHub integration
- Automatic deployments on push
- Build verification
- Zero-downtime deployment

---

## 🌐 Live Deployment

### Production URLs
- **Frontend**: https://markit-fsd.vercel.app
- **Backend API**: https://markit-y0ii.onrender.com/api
- **Database**: MongoDB Atlas (Private)

### Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Vercel    │────────▶│    Render    │────────▶│ MongoDB Atlas   │
│  (Frontend) │  HTTPS  │  (Backend)   │  MongoDB│   (Database)    │
│   React     │◀────────│   Node.js    │  URI    │   Cloud DB      │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                        │
      │      WebSocket         │
      └────────────────────────┘
```

### Cost
**Total: $0/month** (All services on free tier)

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (free)
- **Git**

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/markit.git
cd markit
```

#### 2. Install Dependencies
```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

#### 3. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://db_user:db_pass@attendancedb.js9kskt.mongodb.net/markit?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:5173
```

#### 4. Configure Frontend Environment
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=MarkIt
```

#### 5. Start Development Server
```bash
# From root directory
npm run dev
```

This starts both frontend and backend concurrently.

#### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api

### Available Scripts

```bash
# Development
npm run dev                  # Start both frontend and backend
npm run dev:frontend         # Start frontend only
npm run dev:backend          # Start backend only

# Installation
npm run install:all          # Install all dependencies
npm run install:frontend     # Install frontend dependencies
npm run install:backend      # Install backend dependencies

# Production
npm run build                # Build frontend for production
npm start                    # Start production server
```

---

## 🚀 Deployment Guide

### Prerequisites
- GitHub account
- Vercel account (sign up with GitHub)
- Render account (sign up with GitHub)
- MongoDB Atlas account

### Step 1: MongoDB Atlas Setup

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Provider: AWS
   - Region: Closest to you
   - Name: `AttendanceDB`

3. **Create Database User**:
   - Username: `db_user`
   - Password: Generate secure password (save it!)
   - Privileges: Read and write to any database

4. **Configure Network**:
   - Network Access → Add IP Address
   - Allow Access from Anywhere (0.0.0.0/0)

5. **Get Connection String**:
   ```
   mongodb+srv://db_user:<password>@attendancedb.xxxxx.mongodb.net/markit?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password

### Step 2: Deploy Backend to Render

1. **Create Account**: https://render.com (sign up with GitHub)

2. **Create Web Service**:
   - New + → Web Service
   - Connect your GitHub repository
   - Select `markit` repo

3. **Configure Service**:
   - **Name**: `markit-backend`
   - **Region**: Choose closest
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRES_IN=7d
   JWT_COOKIE_EXPIRES_IN=7
   CLIENT_URL=<your-vercel-url>
   ```

5. **Deploy**: Click "Create Web Service"

6. **Save URL**: Copy your Render URL (e.g., `https://markit-y0ii.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. **Create Account**: https://vercel.com (sign up with GitHub)

2. **Import Project**:
   - New Project → Import Git Repository
   - Select your `markit` repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://markit-y0ii.onrender.com/api
   VITE_SOCKET_URL=https://markit-y0ii.onrender.com
   VITE_APP_NAME=MarkIt
   ```

5. **Deploy**: Click "Deploy"

6. **Update Render**: Go back to Render and update `CLIENT_URL` with your Vercel URL

### Step 4: Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **Register**: Create a new account
3. **Test Features**: Add subject, mark attendance
4. **Check Real-time**: Open in two tabs, verify live updates

---

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:5000/api`
- **Production**: `https://markit-y0ii.onrender.com/api`

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Subject Endpoints

#### Get All Subjects
```http
GET /api/subjects
Authorization: Bearer <token>
```

#### Create Subject
```http
POST /api/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Data Structures",
  "code": "CS201",
  "targetPercentage": 75,
  "totalLectures": 60,
  "color": "blue"
}
```

#### Update Subject
```http
PUT /api/subjects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "targetPercentage": 80
}
```

#### Delete Subject
```http
DELETE /api/subjects/:id
Authorization: Bearer <token>
```

### Lecture Endpoints

#### Get Subject Lectures
```http
GET /api/lectures/subject/:subjectId
Authorization: Bearer <token>
```

#### Mark Attendance
```http
POST /api/lectures
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "subjectId",
  "attended": true,
  "date": "2025-10-29"
}
```

### Dashboard Endpoints

#### Get Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer <token>
```

---

## 📁 Project Structure

```
MarkIt/
├── frontend/                   # React frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Auth-related components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── DataSyncContext.jsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useFetch.js
│   │   │   └── useForm.js
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   │   └── slices/        # Redux slices
│   │   ├── styles/            # Global styles
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vite.config.js         # Vite configuration
│   └── vercel.json            # Vercel deployment config
│
├── backend/                    # Express backend application
│   ├── src/
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # Authentication
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── models/            # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Subject.js
│   │   │   └── Lecture.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js
│   │   │   ├── subjects.js
│   │   │   ├── lectures.js
│   │   │   └── dashboard.js
│   │   ├── utils/             # Utilities
│   │   │   └── socket.js      # Socket.IO config
│   │   └── server.js          # Server entry point
│   ├── tests/                 # Test files
│   ├── .env.example           # Environment template
│   └── package.json
│
├── DOCUMENTATION.md           # This file
├── package.json               # Root package
└── README.md                  # Quick start guide
```

---

## 🔐 Environment Variables

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` (local) or `10000` (Render) |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | Random 32+ char string |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | WebSocket URL | `http://localhost:5000` |
| `VITE_APP_NAME` | Application name | `MarkIt` |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill the process using the port
```

#### 2. MongoDB Connection Failed
**Error**: `MongooseError: The uri parameter to openUri() must be a string`

**Solution**:
- Check `.env` file exists in `backend/` folder
- Verify `MONGODB_URI` is set correctly
- Ensure no extra spaces in connection string

#### 3. CORS Errors
**Error**: `Access-Control-Allow-Origin header missing`

**Solution**:
- Update `CLIENT_URL` in backend `.env`
- Restart backend server
- Clear browser cache

#### 4. Build Fails on Vercel
**Error**: Build command failed

**Solution**:
- Check `Root Directory` is set to `frontend`
- Verify `Build Command` is `npm run build`
- Check all dependencies in `package.json`

#### 5. Render Service Not Starting
**Error**: Service crashes on startup

**Solution**:
- Check environment variables are set
- Verify `MONGODB_URI` is correct
- Check logs in Render dashboard

### Getting Help

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/yourusername/markit/issues)
2. Review deployment logs (Vercel/Render dashboard)
3. Verify all environment variables
4. Check MongoDB Atlas network access

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**MarkIt Development Team**

---

## 🙏 Acknowledgments

- React and Node.js communities
- MongoDB Atlas for free tier
- Vercel and Render for free hosting
- Tailwind CSS for amazing utilities

---

**⭐ If you find this project helpful, please give it a star on GitHub!**

---

*Last Updated: October 29, 2025*
