# 🚀 Complete Deployment Guide - MarkIt

## Overview
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

This guide will help you deploy everything and connect all services together.

---

# STEP 1: Set Up MongoDB Atlas (Database) ⚡

## 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google/GitHub or email
4. Verify your email

## 1.2 Create a Cluster

1. Click "Build a Database"
2. Choose **FREE** shared cluster (M0)
3. Select cloud provider: **AWS** (recommended)
4. Select region: Choose closest to you
5. Cluster Name: `MarkItCluster` (or any name)
6. Click "Create Cluster"

## 1.3 Create Database User

1. Security → Database Access
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `markituser` (remember this)
5. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Or create your own strong password
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

## 1.4 Configure Network Access

1. Security → Network Access
2. Click "Add IP Address"
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This allows Render to connect
4. Click "Confirm"

## 1.5 Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string:
   ```
   mongodb+srv://markituser:<password>@markitcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>` with your actual password**
8. **Add database name**: Change `/?retryWrites` to `/markit?retryWrites`

**Final connection string should look like:**
```
mongodb+srv://markituser:YourActualPassword@markitcluster.xxxxx.mongodb.net/markit?retryWrites=true&w=majority
```

✅ **Save this connection string - you'll need it for Render!**

---

# STEP 2: Deploy Backend to Render 🔧

## 2.1 Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

## 2.2 Create Web Service

1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository
   - If not connected, click "Configure account" and give access
4. Find and select your **MarkIt** repository

## 2.3 Configure Web Service

Fill in the following:

| Field | Value |
|-------|-------|
| **Name** | `markit-backend` (or your choice) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

## 2.4 Add Environment Variables

**CRITICAL**: Click "Advanced" and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render uses port 10000 |
| `MONGODB_URI` | Your MongoDB Atlas connection string | From Step 1.5 |
| `JWT_SECRET` | A strong random string (min 32 chars) | Generate below ⬇️ |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `JWT_COOKIE_EXPIRES_IN` | `7` | Cookie expiration in days |
| `CLIENT_URL` | `LEAVE_EMPTY_FOR_NOW` | We'll update this after Vercel |

### Generate JWT_SECRET

Use this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use this online: https://www.uuidgenerator.net/

**Example JWT_SECRET:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## 2.5 Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Watch the logs - should see:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 10000
   🔌 Socket.IO server running
   ```

## 2.6 Test Backend

Once deployed, you'll get a URL like:
```
https://markit-backend-xxxx.onrender.com
```

Test it:
1. Visit: `https://markit-backend-xxxx.onrender.com/api/health`
2. You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "uptime": 123,
     "environment": "production"
   }
   ```

✅ **Save your backend URL - you'll need it for Vercel!**

---

# STEP 3: Deploy Frontend to Vercel 🌐

## 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub" (recommended)
4. Authorize Vercel

## 3.2 Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Find and select **MarkIt**

## 3.3 Configure Project

Vercel should auto-detect settings, verify:

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

## 3.4 Add Environment Variables

**CRITICAL**: Add these environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://markit-backend-xxxx.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://markit-backend-xxxx.onrender.com` |
| `VITE_APP_NAME` | `MarkIt` |

**Replace** `markit-backend-xxxx.onrender.com` with your actual Render URL from Step 2.6

**Important**: 
- Make sure `VITE_API_URL` ends with `/api`
- Make sure `VITE_SOCKET_URL` does NOT end with `/api`
- Add variables for **all environments** (Production, Preview, Development)

## 3.5 Deploy Frontend

1. Click "Deploy"
2. Wait for build (2-5 minutes)
3. You'll get a URL like:
   ```
   https://markit-xxxx.vercel.app
   ```

✅ **Save your frontend URL!**

---

# STEP 4: Connect Everything 🔗

## 4.1 Update Backend CORS

Now that you have your Vercel URL, update backend:

1. Go to Render Dashboard
2. Click your `markit-backend` service
3. Go to "Environment" tab
4. Find `CLIENT_URL` variable
5. Update value to: `https://markit-xxxx.vercel.app` (your Vercel URL)
6. Click "Save Changes"
7. Service will auto-redeploy (2-3 minutes)

## 4.2 Verify Connection

1. Visit your Vercel URL: `https://markit-xxxx.vercel.app`
2. Try to register a new user
3. If successful, everything is connected! 🎉

---

# STEP 5: Final Testing ✅

## Test All Features

- [ ] Visit your Vercel URL
- [ ] Register a new user
- [ ] Login successfully
- [ ] Create a subject
- [ ] Add a lecture
- [ ] Mark attendance
- [ ] Check dashboard shows correct stats
- [ ] Toggle dark/light mode
- [ ] Test on mobile device
- [ ] Open browser console - should have no errors

## Test Real-Time Features

- [ ] Open app in two browser tabs
- [ ] Make changes in one tab
- [ ] Verify updates appear in other tab (WebSocket)

---

# STEP 6: Custom Domain (Optional) 🌍

## For Vercel (Frontend)

1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `markit.yourdomain.com`)
3. Update DNS records as shown by Vercel:
   ```
   Type: CNAME
   Name: markit
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 24 hours)

## Update Backend

After adding custom domain:
1. Go to Render → Environment
2. Update `CLIENT_URL` to your custom domain
3. Save changes

---

# Troubleshooting 🔧

## Backend Issues

### "Cannot connect to MongoDB"
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify connection string has correct password
- Ensure database user has read/write permissions

### "CORS Error"
- Verify `CLIENT_URL` in Render matches your Vercel URL exactly
- Check CORS configuration in `backend/src/server.js`
- Make sure no trailing slash in URLs

### "Backend not responding"
- Check Render logs for errors
- Verify service is running (not sleeping on free tier)
- Test health endpoint: `/api/health`

## Frontend Issues

### "API calls fail"
- Verify `VITE_API_URL` is correct in Vercel
- Check backend is running on Render
- Open browser DevTools → Network tab to see errors

### "Environment variables not working"
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check they're set for Production environment

### "404 on page refresh"
- Verify `vercel.json` exists in frontend folder
- Check routing configuration
- Redeploy if needed

## Database Issues

### "Authentication failed"
- Verify database username and password
- Check password has no special characters that need escaping
- Ensure user has correct permissions

---

# Quick Reference 📋

## Your URLs

```
Frontend:  https://markit-xxxx.vercel.app
Backend:   https://markit-backend-xxxx.onrender.com
API:       https://markit-backend-xxxx.onrender.com/api
Health:    https://markit-backend-xxxx.onrender.com/api/health
Database:  MongoDB Atlas (internal connection)
```

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/markit
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://markit-xxxx.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://markit-backend-xxxx.onrender.com/api
VITE_SOCKET_URL=https://markit-backend-xxxx.onrender.com
VITE_APP_NAME=MarkIt
```

---

# Monitoring & Maintenance 📊

## View Logs

**Backend (Render)**:
1. Go to Render Dashboard
2. Click your service
3. "Logs" tab

**Frontend (Vercel)**:
1. Go to Vercel Dashboard
2. Click your project
3. "Deployments" → Select deployment → "View Function Logs"

**Database (MongoDB Atlas)**:
1. Go to MongoDB Atlas
2. Click your cluster
3. "Metrics" tab

## Set Up Alerts

**MongoDB Atlas**:
1. Project → Alerts
2. Create alerts for:
   - High connection count
   - High disk usage
   - Unusual query patterns

**Render**:
- Free tier has limited monitoring
- Upgrade for advanced metrics

---

# Cost Breakdown 💰

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Yes | 100GB bandwidth/month |
| **Render** | ✅ Yes | 750 hours/month, sleeps after 15min inactivity |
| **MongoDB Atlas** | ✅ Yes | 512MB storage |

**Total Monthly Cost**: $0 (Free tier) 🎉

**Note**: Render free tier sleeps after inactivity. First request after sleep takes ~30 seconds.

---

# Next Steps 🚀

1. ✅ Share your app URL with friends!
2. ✅ Enable Vercel Analytics (Project Settings → Analytics)
3. ✅ Set up MongoDB backups
4. ✅ Add custom domain (optional)
5. ✅ Monitor error logs regularly
6. ✅ Update dependencies monthly: `npm outdated`

---

# 🎉 Congratulations!

Your MarkIt application is now live and fully connected:

✅ Frontend deployed on Vercel  
✅ Backend deployed on Render  
✅ Database hosted on MongoDB Atlas  
✅ All services connected and working  

**Share your app**: `https://markit-xxxx.vercel.app`

---

**Need Help?**
- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Check MongoDB Atlas metrics for database issues
- Review TROUBLESHOOTING section above
