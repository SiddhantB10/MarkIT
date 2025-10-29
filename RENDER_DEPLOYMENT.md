# Deploy Backend to Render

## Quick Deploy

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

3. **Configure Service**
   ```
   Name: markit-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-app.vercel.app
   ```

5. **Create Free MongoDB Atlas Database**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to MONGODB_URI in Render

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note your backend URL: `https://markit-backend.onrender.com`

7. **Update Frontend Environment**
   - In Vercel, set `VITE_API_URL` to your Render backend URL + `/api`
   - Set `VITE_SOCKET_URL` to your Render backend URL

---

**Both Frontend & Backend are now live! 🎉**
