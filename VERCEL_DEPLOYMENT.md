# Vercel Deployment Guide for MarkIt

## Prerequisites

1. A Vercel account (https://vercel.com)
2. Vercel CLI installed (optional): `npm i -g vercel`
3. Backend API deployed (Render, Railway, or your choice)

## Environment Variables

Before deploying, you need to set these environment variables in Vercel:

### Required Variables

1. **VITE_API_URL** - Your backend API URL
   - Example: `https://your-backend.onrender.com/api`
   - This is your Express backend API endpoint

2. **VITE_SOCKET_URL** - Your WebSocket URL
   - Example: `https://your-backend.onrender.com`
   - Same as backend URL without `/api`

3. **VITE_APP_NAME** - Application name
   - Default: `MarkIt`

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the `frontend` folder as the root directory

2. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   # First deployment (creates project)
   vercel
   
   # Production deployment
   vercel --prod
   ```

5. **Set Environment Variables via CLI**
   ```bash
   vercel env add VITE_API_URL
   # Enter your value when prompted
   
   vercel env add VITE_SOCKET_URL
   # Enter your value when prompted
   
   vercel env add VITE_APP_NAME
   # Enter "MarkIt" when prompted
   ```

6. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Method 3: GitHub Integration (Auto-Deploy)

1. **Connect GitHub to Vercel**
   - Go to Vercel Dashboard
   - Click "Import Project"
   - Connect your GitHub account
   - Select your repository

2. **Configure**
   - Root Directory: `frontend`
   - Framework: Vite
   - Add environment variables

3. **Automatic Deployments**
   - Every push to `main` branch → Production deployment
   - Every push to other branches → Preview deployment
   - Pull requests → Preview deployments

## Post-Deployment Steps

### 1. Update Backend CORS

Update your backend's allowed origins to include your Vercel URL:

In `backend/src/server.js`:
```javascript
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-project.vercel.app", // Add your Vercel URL
    "https://*.vercel.app" // Allow all Vercel preview URLs
  ],
  credentials: true,
  // ... rest of config
}));
```

### 2. Test Your Deployment

- Visit your Vercel URL
- Register a new user
- Login and test all features
- Check browser console for errors
- Verify WebSocket connection works

### 3. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as shown
4. Wait for DNS propagation
5. Update backend CORS to include custom domain

## Troubleshooting

### Build Fails

**Error**: `Command "npm run build" exited with 1`

**Solutions**:
1. Check build logs for specific errors
2. Ensure all dependencies are in `dependencies`, not `devDependencies`
3. Verify `vite build` works locally
4. Check for TypeScript errors if using TS

### Environment Variables Not Working

**Error**: `Cannot read property 'VITE_API_URL' of undefined`

**Solutions**:
1. Ensure variables are prefixed with `VITE_`
2. Redeploy after adding environment variables
3. Check variable names are correct
4. Verify they're set for Production environment

### CORS Errors

**Error**: `Access to fetch at ... has been blocked by CORS policy`

**Solutions**:
1. Add Vercel URL to backend CORS origins
2. Ensure `credentials: true` is set in both frontend and backend
3. Check backend is deployed and accessible
4. Verify VITE_API_URL is correct

### 404 on Page Refresh

**Error**: Page refreshes result in 404

**Solution**: This is already handled by `vercel.json` routing configuration

### WebSocket Connection Failed

**Error**: `WebSocket connection failed`

**Solutions**:
1. Verify VITE_SOCKET_URL is correct
2. Ensure backend WebSocket server is running
3. Check backend CORS includes your Vercel URL
4. Verify backend supports WebSocket upgrades

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

This configuration:
- Tells Vercel to build your Vite project
- Sets the output directory to `dist`
- Handles client-side routing (SPA)

## Environment Variables Reference

### Production Values Example

```env
VITE_API_URL=https://markit-backend.onrender.com/api
VITE_SOCKET_URL=https://markit-backend.onrender.com
VITE_APP_NAME=MarkIt
```

### Development Values

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=MarkIt Dev
```

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Compression
- ✅ Edge caching
- ✅ DDoS protection

## Monitoring

1. **Analytics**
   - Go to Project → Analytics
   - View page views, performance metrics

2. **Logs**
   - Go to Deployments → View Logs
   - Check build and runtime logs

3. **Performance**
   - Use Vercel Speed Insights
   - Enable in Project Settings

## Rollback

If something goes wrong:

1. Go to Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Continuous Deployment

With GitHub integration:
- Push to `main` → Auto-deploy to production
- Open PR → Get preview URL
- Merge PR → Auto-deploy to production

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Enable Vercel Analytics
4. ✅ Configure monitoring/alerts
5. ✅ Update documentation with live URL
6. ✅ Share with users!

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- MarkIt Issues: Check project documentation

---

**Your Frontend is Now Production-Ready on Vercel! 🚀**
