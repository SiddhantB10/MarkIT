# Production Environment Variables

## Frontend (Vercel)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=MarkIt
```

## Backend (Render)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/markit?retryWrites=true&w=majority
JWT_SECRET=your-production-secret-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=https://your-frontend-url.vercel.app
```

## How to Set in Vercel

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable
4. Select "Production" environment
5. Click "Save"
6. Redeploy

## How to Set in Render

1. Go to your web service in Render Dashboard
2. Environment tab
3. Add each variable
4. Click "Save Changes"
5. Service will auto-redeploy

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique values for JWT_SECRET
- Rotate secrets regularly in production
- Use MongoDB Atlas IP whitelist for security
