# 🚀 MarkIt - Quick Reference Guide

## Installation & Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 3. Start with Docker (Recommended)
npm run docker:up

# OR Start manually
npm run dev
```

## Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend & backend
npm run install:all      # Install all dependencies
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:build     # Rebuild Docker images
```

### Backend
```bash
cd backend
npm start               # Production mode
npm run dev             # Development mode
npm test                # Run tests
npm run test:watch      # Tests in watch mode
```

### Frontend
```bash
cd frontend
npm run dev             # Development server
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/markit
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get user
- POST `/api/auth/logout` - Logout

### Subjects
- GET `/api/subjects` - List all
- POST `/api/subjects` - Create
- GET `/api/subjects/:id` - Get one
- PUT `/api/subjects/:id` - Update
- DELETE `/api/subjects/:id` - Delete

### Lectures
- GET `/api/lectures/subject/:id` - Get by subject
- POST `/api/lectures` - Create
- PUT `/api/lectures/:id` - Update
- DELETE `/api/lectures/:id` - Delete

### Dashboard
- GET `/api/dashboard/stats` - Get statistics

## Custom Hooks Usage

```jsx
// useLocalStorage
import { useLocalStorage } from '@/hooks';
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);

// useDebounce
import { useDebounce } from '@/hooks';
const debouncedValue = useDebounce(value, 500);

// useFetch
import { useFetch } from '@/hooks';
const { data, loading, error, refetch } = useFetch('/api/endpoint');

// useForm
import { useForm } from '@/hooks';
const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  onSubmit,
  validate
);
```

## Redux Usage

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchSubjects } from '@/store/slices';

// Get state
const { user } = useSelector(state => state.auth);
const { subjects } = useSelector(state => state.subjects);

// Dispatch actions
const dispatch = useDispatch();
dispatch(loginUser({ email, password }));
dispatch(fetchSubjects());
```

## Context API Usage

```jsx
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataSync } from '@/contexts/DataSyncContext';

const { user, login, logout } = useAuth();
const { theme, setTheme, toggleTheme } = useTheme();
const { dashboardData, subjects, fetchDashboardData } = useDataSync();
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Remove volumes (clean start)
docker-compose down -v
```

## Testing

```bash
# Run all tests
cd backend && npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

## Deployment

### GitHub Actions (Automatic)
1. Set up secrets in GitHub repository settings:
   - RENDER_BACKEND_SERVICE_ID
   - RENDER_API_KEY
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

2. Push to main branch:
```bash
git push origin main
```

### Manual Deployment

**Backend (Render)**:
```bash
cd backend
git push render main
```

**Frontend (Vercel)**:
```bash
cd frontend
vercel --prod
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### MongoDB Connection Issues
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 mongo:7.0

# Or check if MongoDB service is running
sudo systemctl status mongod
```

### Clear Node Modules
```bash
# Root
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
MarkIt/
├── backend/
│   ├── src/
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # User, Subject, Lecture
│   │   ├── routes/         # API endpoints
│   │   ├── utils/          # Socket.IO
│   │   └── server.js
│   └── tests/              # Jest tests
│
├── frontend/
│   └── src/
│       ├── components/     # UI components
│       ├── contexts/       # Context API
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Routes
│       ├── services/       # API, Socket
│       └── store/          # Redux Toolkit
│
└── .github/workflows/      # CI/CD
```

## Default Credentials

**Development User**:
- Email: `test@example.com`
- Password: `password123`

(Create via registration or seed script)

## URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/api/health
- MongoDB: mongodb://localhost:27017

## Performance Tips

1. **Enable compression** (already configured)
2. **Use lazy loading** for routes
3. **Optimize images** before upload
4. **Use production build** for deployment
5. **Enable caching** in Nginx config

## Security Checklist

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation (Joi)
- ✅ Environment variables
- ✅ HTTPS in production

## Useful Links

- 📖 [Full Documentation](./README.md)
- 🔍 [Experiments Checklist](./EXPERIMENTS_CHECKLIST.md)
- 📝 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 🚀 [Deployment Guide](./.github/workflows/README.md)
- 🐛 [Bug Fixes](./BUG_FIXES.md)

## Support

For issues or questions:
1. Check documentation files
2. Review error logs
3. Check GitHub Actions output
4. Verify environment variables
5. Ensure all services are running

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
