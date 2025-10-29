# 🔧 Deployment Troubleshooting Guide

Common issues and their solutions when deploying MarkIt.

---

## Table of Contents

1. [MongoDB Atlas Issues](#mongodb-atlas-issues)
2. [Render Backend Issues](#render-backend-issues)
3. [Vercel Frontend Issues](#vercel-frontend-issues)
4. [Connection Issues](#connection-issues)
5. [CORS Errors](#cors-errors)
6. [Authentication Issues](#authentication-issues)
7. [WebSocket Issues](#websocket-issues)
8. [Performance Issues](#performance-issues)

---

## MongoDB Atlas Issues

### ❌ "MongoServerError: bad auth: Authentication failed"

**Cause**: Incorrect username or password in connection string

**Solutions**:
1. Go to MongoDB Atlas → Database Access
2. Verify username exists
3. Reset password if needed
4. Update `MONGODB_URI` in Render with new password
5. Ensure password doesn't contain special characters like `@`, `#`, `:`, `/`
   - If it does, URL encode them or generate a new password

**Example**:
```
# Bad (if password contains special chars):
mongodb+srv://user:P@ssw0rd@cluster.mongodb.net/markit

# Good:
mongodb+srv://user:Passw0rd123@cluster.mongodb.net/markit
```

---

### ❌ "MongoNetworkError: connection timed out"

**Cause**: IP address not whitelisted

**Solutions**:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Save and wait 1-2 minutes for propagation

---

### ❌ "MongoServerError: user is not allowed to do action"

**Cause**: Database user lacks permissions

**Solutions**:
1. Go to MongoDB Atlas → Database Access
2. Edit your user
3. Change role to: **"Atlas admin"** or **"Read and write to any database"**
4. Save changes

---

### ❌ "Cannot connect to cluster"

**Cause**: Incorrect connection string format

**Solutions**:
1. Verify connection string format:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/markit?retryWrites=true&w=majority
   ```
2. Ensure database name `/markit` is present
3. Check cluster URL is correct
4. Test connection with MongoDB Compass

---

## Render Backend Issues

### ❌ "Deploy failed: Build failed"

**Cause**: Dependency installation failed or incorrect configuration

**Solutions**:
1. Check Render logs for specific error
2. Verify `package.json` exists in `backend/` folder
3. Ensure Build Command is: `npm install`
4. Try clearing build cache:
   - Settings → "Clear Build Cache & Deploy"

---

### ❌ "Application failed to respond"

**Cause**: Server not starting or crashing

**Solutions**:
1. Check Render logs for errors
2. Common issues:
   - MongoDB connection failed → Check `MONGODB_URI`
   - Missing environment variables → Verify all vars are set
   - Port mismatch → Ensure `PORT=10000`
3. Look for error messages in logs
4. Verify Start Command is: `npm start`

---

### ❌ "Service is sleeping"

**Cause**: Render free tier sleeps after 15 minutes of inactivity

**Solutions**:
- This is **normal** for free tier
- First request after sleep takes 30-60 seconds
- Options:
  1. Accept the delay (free)
  2. Upgrade to paid plan ($7/month)
  3. Use cron job to ping every 10 minutes:
     ```
     https://cron-job.org/
     Ping: https://your-backend.onrender.com/api/health
     Every: 10 minutes
     ```

---

### ❌ "Environment variable not defined"

**Cause**: Missing environment variables

**Solutions**:
1. Go to Render Dashboard → Your Service → Environment
2. Verify these variables exist:
   - `NODE_ENV`
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `JWT_COOKIE_EXPIRES_IN`
   - `CLIENT_URL`
3. Click "Save Changes" after adding
4. Service will auto-redeploy

---

## Vercel Frontend Issues

### ❌ "Build failed: Command failed"

**Cause**: Build errors in frontend code

**Solutions**:
1. Check Vercel build logs for specific error
2. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Fix type errors
   - Environment variables → Ensure they start with `VITE_`
3. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```

---

### ❌ "404 on page refresh"

**Cause**: Missing routing configuration

**Solutions**:
1. Verify `vercel.json` exists in `frontend/` folder
2. Content should be:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. Redeploy if file was missing

---

### ❌ "Environment variables not working"

**Cause**: Variables not prefixed with `VITE_` or not set for all environments

**Solutions**:
1. All variables MUST start with `VITE_`
2. Set variables for all environments:
   - Production ✓
   - Preview ✓
   - Development ✓
3. After adding variables, trigger new deployment:
   - Deployments → Three dots → "Redeploy"

---

### ❌ "White screen / Blank page"

**Cause**: JavaScript errors or API connection issues

**Solutions**:
1. Open browser DevTools (F12) → Console
2. Check for errors
3. Common causes:
   - `VITE_API_URL` incorrect or missing
   - CORS errors → Check backend `CLIENT_URL`
   - Build errors → Check Vercel logs
4. Verify environment variables are set correctly

---

## Connection Issues

### ❌ "Failed to fetch" or "Network Error"

**Cause**: Frontend can't reach backend

**Solutions**:
1. Verify `VITE_API_URL` in Vercel:
   - Should be: `https://your-backend.onrender.com/api`
   - Must end with `/api`
   - No trailing slash after `/api`
2. Test backend directly:
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"OK"}`
3. Check if backend is sleeping (Render free tier)
4. Verify backend logs show no errors

---

### ❌ "ERR_CONNECTION_REFUSED"

**Cause**: Backend is down or URL is wrong

**Solutions**:
1. Check backend is deployed and running
2. Verify `VITE_API_URL` matches exact Render URL
3. Test backend health endpoint
4. Check Render service status

---

## CORS Errors

### ❌ "Access-Control-Allow-Origin error"

**Error in console**:
```
Access to fetch at 'https://backend.com/api/auth/login' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Cause**: Backend not configured to accept requests from frontend

**Solutions**:
1. Go to Render → Environment
2. Set `CLIENT_URL` to EXACT Vercel URL:
   ```
   https://markit-xxxx.vercel.app
   ```
3. **No trailing slash!**
4. Save and wait for redeploy
5. Clear browser cache and retry

---

### ❌ "CORS preflight request failed"

**Cause**: OPTIONS request not handled properly

**Solutions**:
1. Verify backend has CORS middleware
2. Check `backend/src/server.js` has:
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true
   }));
   ```
3. Ensure `CLIENT_URL` is set in Render

---

### ❌ "Credentials flag is true, but Access-Control-Allow-Credentials is not"

**Cause**: CORS configuration doesn't allow credentials

**Solutions**:
1. Ensure backend CORS config has:
   ```javascript
   credentials: true
   ```
2. Frontend requests must include:
   ```javascript
   credentials: 'include'
   ```
3. Both are already configured in MarkIt

---

## Authentication Issues

### ❌ "Invalid token" or "Authentication failed"

**Cause**: JWT token issues

**Solutions**:
1. Clear browser cookies and localStorage
2. Try registering new user
3. Verify `JWT_SECRET` is set in Render
4. Check backend logs for JWT errors
5. Ensure `JWT_SECRET` is at least 32 characters

---

### ❌ "User registration fails"

**Cause**: Database connection or validation issues

**Solutions**:
1. Check browser console for error message
2. Verify MongoDB is connected (backend logs)
3. Check password meets requirements:
   - Min 8 characters
   - Contains uppercase, lowercase, number
4. Ensure email is valid format
5. Check if user already exists

---

### ❌ "Login succeeds but redirects to login again"

**Cause**: Cookie/token storage issues

**Solutions**:
1. Check browser allows cookies
2. Verify `sameSite` and `secure` cookie settings
3. In production, ensure HTTPS is used
4. Clear browser cache and cookies
5. Try incognito/private mode

---

## WebSocket Issues

### ❌ "WebSocket connection failed"

**Cause**: Socket.IO connection issues

**Solutions**:
1. Verify `VITE_SOCKET_URL` is set correctly:
   ```
   https://your-backend.onrender.com
   ```
   - No `/api` at the end!
2. Check backend logs for Socket.IO initialization
3. Ensure backend is running
4. Test in browser console:
   ```javascript
   const socket = io('https://your-backend.onrender.com');
   socket.on('connect', () => console.log('Connected!'));
   ```

---

### ❌ "Real-time updates not working"

**Cause**: Socket connection not established

**Solutions**:
1. Open browser DevTools → Network → WS (WebSocket)
2. Should see active WebSocket connection
3. Check backend emits events correctly
4. Verify frontend listeners are set up
5. Test with two browser windows

---

## Performance Issues

### ❌ "First request is very slow (30+ seconds)"

**Cause**: Render free tier sleeping

**Solutions**:
- This is **normal** for Render free tier
- Backend sleeps after 15 minutes of inactivity
- First request wakes it up (takes 30-60 seconds)
- Options:
  1. Accept delay (free)
  2. Set up ping service to keep alive
  3. Upgrade to paid plan

---

### ❌ "API requests are slow"

**Cause**: Database queries or network latency

**Solutions**:
1. Check MongoDB Atlas metrics
2. Ensure database indexes are created
3. Optimize queries in backend
4. Consider upgrading Render/MongoDB tier
5. Check backend logs for slow queries

---

### ❌ "Frontend loads slowly"

**Cause**: Large bundle size or network issues

**Solutions**:
1. Optimize images in `frontend/public/`
2. Check Vercel Analytics for performance metrics
3. Reduce bundle size:
   ```bash
   npm run build
   # Check dist/ size
   ```
4. Enable Vercel Edge Network (automatically enabled)

---

## Database Issues

### ❌ "Cannot read property of undefined"

**Cause**: Data not found or schema mismatch

**Solutions**:
1. Check MongoDB Atlas → Collections
2. Verify data exists
3. Check Mongoose schema matches data structure
4. Look for typos in field names

---

### ❌ "Duplicate key error"

**Cause**: Trying to insert duplicate unique value

**Solutions**:
1. Check which field is unique (usually email or code)
2. Try different value
3. Check existing data in MongoDB Atlas
4. May need to delete test data

---

## General Debugging Steps

### Step 1: Check All Services Are Running

- [ ] MongoDB Atlas cluster is active
- [ ] Render service shows "Live" status
- [ ] Vercel deployment successful

### Step 2: Test Each Service Independently

```bash
# Test MongoDB
# Use MongoDB Compass with your connection string

# Test Backend
curl https://your-backend.onrender.com/api/health

# Test Frontend
# Visit https://your-frontend.vercel.app
```

### Step 3: Check Environment Variables

**Render**:
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` is correct
- [ ] `JWT_SECRET` is set (32+ chars)
- [ ] `CLIENT_URL` matches Vercel URL

**Vercel**:
- [ ] `VITE_API_URL` ends with `/api`
- [ ] `VITE_SOCKET_URL` has no `/api`
- [ ] All variables set for Production environment

### Step 4: Check Logs

1. **Backend Logs** (Render):
   - Dashboard → Service → Logs
   - Look for errors, connection issues

2. **Frontend Logs** (Vercel):
   - Dashboard → Deployment → Function Logs
   - Check build logs for errors

3. **Browser Console**:
   - F12 → Console tab
   - Look for API errors, CORS issues

### Step 5: Test in Isolation

1. Test backend with Postman/curl
2. Test frontend with mock data
3. Test database connection separately

---

## Still Having Issues?

### Collect Debug Information

1. **Backend URL**: ___________________________
2. **Frontend URL**: ___________________________
3. **Error Message**: ___________________________
4. **Browser Console Error**: ___________________________
5. **Backend Logs**: (copy last 50 lines)
6. **Steps to Reproduce**: ___________________________

### Check These Files

- `backend/src/server.js` - CORS configuration
- `frontend/src/services/api.js` - API URL configuration
- `frontend/vercel.json` - Routing configuration
- `backend/.env` - Environment variables (local)

### Helpful Commands

```bash
# Test backend locally
cd backend
npm start

# Test frontend locally
cd frontend
npm run dev

# Build frontend
cd frontend
npm run build

# Check for errors
npm run build 2>&1 | grep -i error
```

---

## Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| CORS error | Update `CLIENT_URL` in Render to match Vercel URL |
| 404 on refresh | Check `vercel.json` exists in frontend |
| White screen | Check browser console, verify `VITE_API_URL` |
| Can't connect to backend | Test `/api/health` endpoint |
| Login fails | Clear cookies, check MongoDB connection |
| Slow first load | Render free tier - wait 60 seconds |
| WebSocket not working | Verify `VITE_SOCKET_URL` has no `/api` |

---

## Preventive Measures

1. **Always test locally before deploying**
2. **Keep environment variables documented**
3. **Monitor logs after deployment**
4. **Test all features after deployment**
5. **Set up health check monitoring**

---

## Getting Help

1. Check this troubleshooting guide
2. Review `COMPLETE_DEPLOYMENT_GUIDE.md`
3. Check official documentation:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - MongoDB: https://www.mongodb.com/docs/atlas/
4. Search error message on Stack Overflow
5. Check service status pages:
   - Render: https://status.render.com/
   - Vercel: https://www.vercel-status.com/
   - MongoDB: https://status.mongodb.com/

---

**Most Common Issue**: `CLIENT_URL` in Render doesn't match Vercel URL exactly (check for trailing slashes!)

**Second Most Common**: Environment variables not set for all environments in Vercel

**Third Most Common**: `VITE_API_URL` missing `/api` at the end

Good luck! 🍀
