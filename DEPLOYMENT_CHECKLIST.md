# 🚀 Deployment Checklist for MarkIt

Follow this checklist to deploy your MarkIt application to production.

---

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Build succeeds locally: `cd frontend && npm run build`
- [ ] Backend starts without errors: `cd backend && npm start`
- [ ] All environment variables documented

### 2. Database Setup
- [ ] Create MongoDB Atlas account (free tier available)
- [ ] Create a new cluster
- [ ] Create database user with password
- [ ] Whitelist IP addresses (or use 0.0.0.0/0 for all)
- [ ] Get connection string
- [ ] Test connection locally

### 3. Version Control
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] Repository is public or connected to Vercel/Render

---

## Backend Deployment (Render)

### Step 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Verify email

### Step 2: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select your MarkIt repository

### Step 3: Configure Service
```
Name: markit-backend (or your choice)
Region: Choose closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### Step 4: Environment Variables
Add these in Render dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (Render's default)
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Strong random string (min 32 chars)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `CLIENT_URL` = Your Vercel URL (add after frontend deployed)

### Step 5: Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for errors
- [ ] Note your backend URL: `https://your-service.onrender.com`
- [ ] Test health endpoint: `https://your-service.onrender.com/api/health`

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Verify email

### Step 2: Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Select the repository

### Step 3: Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
Install Command: npm install (auto-detected)
```

### Step 4: Environment Variables
Add these in Vercel dashboard:

- [ ] `VITE_API_URL` = `https://your-backend.onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://your-backend.onrender.com`
- [ ] `VITE_APP_NAME` = `MarkIt`

**Important**: Make sure to add for all environments (Production, Preview, Development)

### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-5 minutes)
- [ ] Check deployment logs
- [ ] Note your frontend URL: `https://your-project.vercel.app`

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Go to Render dashboard
- [ ] Add `CLIENT_URL` environment variable with your Vercel URL
- [ ] Service will auto-redeploy
- [ ] Or manually update `backend/src/server.js` CORS config

### Test Application
- [ ] Visit your Vercel URL
- [ ] Register a new user
- [ ] Login successfully
- [ ] Create a subject
- [ ] Add a lecture
- [ ] Check attendance calculations
- [ ] Verify theme toggle works
- [ ] Test on mobile device
- [ ] Check browser console for errors
- [ ] Test WebSocket notifications (if any)

---

## Optional: Custom Domain

### Vercel Custom Domain
- [ ] Go to Project Settings → Domains
- [ ] Add your domain
- [ ] Update DNS records as shown
- [ ] Wait for DNS propagation
- [ ] Test custom domain

### Update Backend
- [ ] Add custom domain to `CLIENT_URL` in Render
- [ ] Update CORS configuration

---

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Enable Vercel Analytics (Project Settings → Analytics)
- [ ] Monitor Render logs for errors
- [ ] Set up MongoDB Atlas monitoring alerts

### Regular Maintenance
- [ ] Check error logs weekly
- [ ] Monitor database usage
- [ ] Update dependencies monthly: `npm outdated`
- [ ] Review security advisories: `npm audit`
- [ ] Backup MongoDB data regularly

---

## Troubleshooting

### Backend Issues

**Build Fails**
- [ ] Check Node version matches local (18.x)
- [ ] Verify package.json has all dependencies
- [ ] Check Render logs for specific error

**Cannot Connect to Database**
- [ ] Verify MongoDB Atlas connection string
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Ensure database user has correct permissions

**CORS Errors**
- [ ] Verify CLIENT_URL matches Vercel URL exactly
- [ ] Check CORS configuration in server.js
- [ ] Ensure credentials: true is set

### Frontend Issues

**Build Fails**
- [ ] Run `npm run build` locally
- [ ] Check for TypeScript errors
- [ ] Verify all environment variables are set
- [ ] Check Vercel build logs

**API Calls Fail**
- [ ] Verify VITE_API_URL is correct
- [ ] Check backend is running
- [ ] Test backend health endpoint
- [ ] Check browser network tab

**404 on Refresh**
- [ ] Ensure vercel.json is present
- [ ] Check routing configuration
- [ ] Redeploy if needed

---

## Security Checklist

- [ ] JWT_SECRET is strong and unique (min 32 characters)
- [ ] MongoDB connection string uses strong password
- [ ] Environment variables are not in Git
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] CORS is configured for specific origins only
- [ ] Rate limiting is enabled
- [ ] Input validation is working

---

## Performance Checklist

- [ ] Frontend build is optimized (check bundle size)
- [ ] Images are optimized
- [ ] API responses are compressed
- [ ] Database indexes are created
- [ ] Unused dependencies removed

---

## Final Verification

- [ ] All features work in production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast page loads (< 3 seconds)
- [ ] No broken links
- [ ] Forms validate correctly
- [ ] Authentication works
- [ ] Data persists correctly

---

## 🎉 Deployment Complete!

Your URLs:
- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-service.onrender.com
- **API**: https://your-service.onrender.com/api

Share your application with users!

---

## Quick Commands

### Redeploy Frontend
```bash
cd frontend
vercel --prod
```

### View Backend Logs
Go to Render Dashboard → Your Service → Logs

### View Frontend Logs
Go to Vercel Dashboard → Deployments → Logs

### Rollback Deployment
- **Vercel**: Deployments → Select previous → Promote to Production
- **Render**: Manual deploys → Select previous → Deploy

---

**Need Help?** Check:
- VERCEL_DEPLOYMENT.md
- RENDER_DEPLOYMENT.md  
- PRODUCTION_ENV.md
- .github/workflows/README.md
