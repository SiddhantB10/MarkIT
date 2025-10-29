# Quick Deployment Checklist ✅

Use this checklist to deploy MarkIt in the correct order.

---

## PART 1: Database Setup (15 minutes)

### MongoDB Atlas

- [ ] 1. Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] 2. Create FREE cluster (M0 tier)
- [ ] 3. Create database user with password
  - Username: `markituser` (or your choice)
  - Save password in safe place!
- [ ] 4. Add IP whitelist: **0.0.0.0/0** (Allow access from anywhere)
- [ ] 5. Get connection string
- [ ] 6. Replace `<password>` with actual password
- [ ] 7. Add database name `/markit` before `?retryWrites`
- [ ] 8. **Save final connection string**: 
  ```
  mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/markit?retryWrites=true&w=majority
  ```

**✅ Database is ready!**

---

## PART 2: Backend Deployment (20 minutes)

### Render Setup

- [ ] 1. Create Render account at https://render.com
- [ ] 2. Sign up with GitHub
- [ ] 3. Click "New +" → "Web Service"
- [ ] 4. Connect your GitHub repository
- [ ] 5. Configure service:
  - Name: `markit-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: **Free**

### Environment Variables

- [ ] 6. Click "Advanced" and add these variables:

| Variable | Value | How to Get |
|----------|-------|------------|
| `NODE_ENV` | `production` | (Type exactly) |
| `PORT` | `10000` | (Type exactly) |
| `MONGODB_URI` | MongoDB connection string | From Part 1, step 8 |
| `JWT_SECRET` | Random 32+ char string | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | (Type exactly) |
| `JWT_COOKIE_EXPIRES_IN` | `7` | (Type exactly) |
| `CLIENT_URL` | *(leave empty for now)* | Will update after Vercel |

### Deploy & Test

- [ ] 7. Click "Create Web Service"
- [ ] 8. Wait for deployment (5-10 minutes)
- [ ] 9. Check logs for "✅ MongoDB Connected"
- [ ] 10. **Copy your backend URL**: `https://markit-backend-xxxx.onrender.com`
- [ ] 11. Test health endpoint: Visit `https://markit-backend-xxxx.onrender.com/api/health`
- [ ] 12. Should see: `{"status":"OK",...}`

**✅ Backend is deployed!**

**SAVE THIS URL**: ___________________________________

---

## PART 3: Frontend Deployment (15 minutes)

### Vercel Setup

- [ ] 1. Create Vercel account at https://vercel.com
- [ ] 2. Sign up with GitHub
- [ ] 3. Click "Add New..." → "Project"
- [ ] 4. Import your MarkIt repository
- [ ] 5. Configure project:
  - Framework: `Vite`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`

### Environment Variables

- [ ] 6. Add these environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Backend URL + `/api` | `https://markit-backend-xxxx.onrender.com/api` |
| `VITE_SOCKET_URL` | Backend URL (no /api) | `https://markit-backend-xxxx.onrender.com` |
| `VITE_APP_NAME` | `MarkIt` | `MarkIt` |

**IMPORTANT**: 
- Set for ALL environments (Production, Preview, Development)
- `VITE_API_URL` MUST end with `/api`
- `VITE_SOCKET_URL` must NOT end with `/api`

### Deploy & Test

- [ ] 7. Click "Deploy"
- [ ] 8. Wait for build (2-5 minutes)
- [ ] 9. **Copy your frontend URL**: `https://markit-xxxx.vercel.app`
- [ ] 10. Visit URL and check app loads

**✅ Frontend is deployed!**

**SAVE THIS URL**: ___________________________________

---

## PART 4: Connect Everything (5 minutes)

### Update Backend CORS

- [ ] 1. Go back to Render dashboard
- [ ] 2. Click your `markit-backend` service
- [ ] 3. Go to "Environment" tab
- [ ] 4. Find `CLIENT_URL` variable
- [ ] 5. Update value to your Vercel URL: `https://markit-xxxx.vercel.app`
- [ ] 6. Click "Save Changes"
- [ ] 7. Wait for auto-redeploy (2-3 minutes)

**✅ Everything is connected!**

---

## PART 5: Final Testing (10 minutes)

### Test All Features

- [ ] 1. Visit your Vercel URL
- [ ] 2. Open browser DevTools (F12) → Console tab
- [ ] 3. Should see no errors
- [ ] 4. Register a new user
- [ ] 5. Login successfully
- [ ] 6. Create a subject
- [ ] 7. Add lecture to subject
- [ ] 8. Mark attendance
- [ ] 9. Check dashboard shows correct stats
- [ ] 10. Toggle dark/light mode
- [ ] 11. Test on mobile device
- [ ] 12. Logout and login again

### Test Real-Time (WebSocket)

- [ ] 1. Open app in two browser tabs/windows
- [ ] 2. Mark attendance in one tab
- [ ] 3. Verify dashboard updates in other tab automatically

**✅ All features working!**

---

## Troubleshooting

### ❌ Backend Deploy Failed
- Check Render logs for error messages
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### ❌ Frontend Deploy Failed
- Check Vercel logs
- Verify build command is `npm run build`
- Ensure `vercel.json` exists in frontend folder

### ❌ CORS Errors
- Verify `CLIENT_URL` in Render matches Vercel URL exactly
- No trailing slashes in URLs
- Check browser console for exact error

### ❌ API Calls Fail
- Verify `VITE_API_URL` ends with `/api`
- Backend must be deployed first
- Test backend health endpoint

### ❌ Login/Register Not Working
- Check browser console for errors
- Verify backend MongoDB connection
- Test with Postman: `POST /api/auth/register`

---

## Your Deployment URLs

Fill these in as you deploy:

```
✅ Frontend:  https://___________________.vercel.app
✅ Backend:   https://___________________.onrender.com
✅ API:       https://___________________.onrender.com/api
✅ Health:    https://___________________.onrender.com/api/health
✅ Database:  MongoDB Atlas (connection string saved ✓)
```

---

## After Deployment

### Monitor Your App

**Check Render Logs**:
1. Render Dashboard → markit-backend → Logs
2. Watch for errors or warnings

**Check Vercel Logs**:
1. Vercel Dashboard → markit → Deployments → Logs

**Check MongoDB Metrics**:
1. MongoDB Atlas → Cluster → Metrics

### Set Up Alerts (Optional)

- MongoDB Atlas: Set up connection alerts
- Vercel: Enable Analytics
- Render: Upgrade for advanced monitoring

---

## 🎉 Success!

If all checkboxes are checked, your app is live!

**Share your app**: `https://your-app.vercel.app`

---

## Need More Help?

Refer to these guides:
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Detailed instructions
- `TROUBLESHOOTING.md` - Common issues and fixes
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://www.mongodb.com/docs/atlas/

---

**Deployment Time**: ~1 hour total
**Cost**: $0 (All free tiers)

Good luck! 🚀
