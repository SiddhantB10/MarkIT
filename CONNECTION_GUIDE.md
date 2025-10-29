# 🔗 Connection Architecture Diagram

Visual guide showing how all services connect together.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                     (Chrome, Firefox, etc.)                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │  HTTPS Requests  │      │  WebSocket (WS)  │
        │   (REST API)     │      │  (Real-time)     │
        └──────────────────┘      └──────────────────┘
                    │                         │
                    │                         │
                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VERCEL (Frontend Hosting)                      │
│                 https://markit-xxx.vercel.app                   │
├─────────────────────────────────────────────────────────────────┤
│  • React + Vite                                                 │
│  • Serves static files (HTML, CSS, JS)                         │
│  • Client-side routing                                          │
│  • Environment Variables:                                       │
│    - VITE_API_URL → Points to Render                           │
│    - VITE_SOCKET_URL → Points to Render                        │
└─────────────────────────────────────────────────────────────────┘
                    │                         │
                    │ API Calls              │ Socket Events
                    │ (fetch)                │ (Socket.IO)
                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               RENDER (Backend Hosting)                          │
│          https://markit-backend-xxx.onrender.com                │
├─────────────────────────────────────────────────────────────────┤
│  • Node.js + Express                                            │
│  • REST API endpoints (/api/*)                                  │
│  • Socket.IO server (WebSocket)                                 │
│  • JWT Authentication                                           │
│  • CORS enabled for Vercel                                      │
│  • Environment Variables:                                       │
│    - CLIENT_URL → Points to Vercel                             │
│    - MONGODB_URI → Points to MongoDB Atlas                     │
│    - JWT_SECRET → For token encryption                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Queries
                              │ (Mongoose)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            MongoDB Atlas (Database Hosting)                     │
│      mongodb+srv://cluster.mongodb.net/markit                   │
├─────────────────────────────────────────────────────────────────┤
│  • Cloud-hosted MongoDB                                         │
│  • Collections: users, subjects, lectures                       │
│  • Automatic backups                                            │
│  • Network Access: 0.0.0.0/0 (allows Render)                   │
│  • Database User: markituser (read/write permissions)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Example 1: User Registration

```
┌────────┐     ┌────────┐     ┌────────┐     ┌──────────┐
│ User   │────▶│Vercel  │────▶│Render  │────▶│ MongoDB  │
│Browser │     │Frontend│     │Backend │     │  Atlas   │
└────────┘     └────────┘     └────────┘     └──────────┘
    │              │              │                │
    │ 1. Fills form│              │                │
    │──────────────│              │                │
    │              │              │                │
    │              │ 2. POST /api/auth/register    │
    │              │──────────────▶                │
    │              │              │                │
    │              │              │ 3. Hash password
    │              │              │ & Save user    │
    │              │              │────────────────▶
    │              │              │                │
    │              │              │ 4. User saved  │
    │              │              ◀────────────────│
    │              │              │                │
    │              │ 5. Return JWT token          │
    │              ◀──────────────│                │
    │              │              │                │
    │ 6. Store token & redirect  │                │
    ◀──────────────│              │                │
```

### Example 2: Marking Attendance (with Real-time Update)

```
┌────────┐     ┌────────┐     ┌────────┐     ┌──────────┐
│ User A │     │Vercel  │     │Render  │     │ MongoDB  │
│Browser │     │Frontend│     │Backend │     │  Atlas   │
└────────┘     └────────┘     └────────┘     └──────────┘
    │              │              │                │
    │ 1. Clicks "Present"         │                │
    │──────────────▶              │                │
    │              │              │                │
    │              │ 2. PATCH /api/lectures/:id/attendance
    │              │──────────────▶                │
    │              │              │                │
    │              │              │ 3. Update lecture
    │              │              │────────────────▶
    │              │              │                │
    │              │              │ 4. Updated data
    │              │              ◀────────────────│
    │              │              │                │
    │              │              │ 5. Emit WebSocket event
    │              │              │ "lectureUpdated"
    │              │              │──────────┐     │
    │              │              │          │     │
    │              │              │          ▼     │
    │              │              │    ┌────────┐  │
    │              │              │    │ User B │  │
    │              │              │    │Browser │  │
    │              │              │    └────────┘  │
    │              │              │          │     │
    │              │              │ 6. Receive event
    │              │              │◀─────────┘     │
    │              │              │                │
    │              │ 7. Dashboard auto-updates    │
    │              │              │                │
```

---

## Network Communication

### HTTP/HTTPS Communication (API Calls)

```
Frontend (Vercel)                    Backend (Render)
─────────────────                    ────────────────

GET /api/subjects ──────────────────▶ Express Route
                                      │
                  ◀──────────────────  Return JSON
                   200 OK              Response


POST /api/auth/login ───────────────▶ Validate
  Body: {email, pass}                 credentials
                                      │
                     ◀────────────────  Return JWT
                      200 OK           + Set cookie
```

### WebSocket Communication (Real-time)

```
Frontend (Vercel)                    Backend (Render)
─────────────────                    ────────────────

1. Connect
   socket.connect() ─────────────────▶ Accept connection
                                      │
                    ◀─────────────────  'connect' event
                                      │
2. Join room
   emit('joinRoom')  ────────────────▶ socket.join(room)
                                      │
3. Listen for updates
   on('lectureUpdated') ──────────┐  │
                                  │  │
4. Backend emits update           │  │
                      ◀───────────┴──  io.emit('lectureUpdated')
                                      │
5. Receive & update UI            │  │
```

---

## Environment Variables Flow

### How Frontend Finds Backend

```
1. Build Time (Vercel)
   ───────────────────
   VITE_API_URL=https://markit-backend-xxx.onrender.com/api
        │
        │ Embedded into built JavaScript
        ▼
   dist/assets/index-abc123.js
        │
        │ Deployed to Vercel CDN
        ▼
   
2. Runtime (Browser)
   ─────────────────
   User visits: https://markit-xxx.vercel.app
        │
        │ Downloads JavaScript
        ▼
   JavaScript contains: const API_URL = "https://markit-backend-xxx.onrender.com/api"
        │
        │ Makes API calls to this URL
        ▼
   fetch(`${API_URL}/subjects`)
```

### How Backend Allows Frontend (CORS)

```
1. Backend Configuration (Render)
   ──────────────────────────────
   CLIENT_URL=https://markit-xxx.vercel.app
        │
        │ Used in CORS middleware
        ▼
   cors({
     origin: process.env.CLIENT_URL,
     credentials: true
   })
        │
        │
2. When Request Arrives
   ────────────────────
   Request from: https://markit-xxx.vercel.app
        │
        │ Check CORS
        ▼
   Origin matches CLIENT_URL? ✓
        │
        │ Add headers
        ▼
   Access-Control-Allow-Origin: https://markit-xxx.vercel.app
   Access-Control-Allow-Credentials: true
        │
        │ Process request
        ▼
   Return response
```

---

## Port & URL Structure

### Development (Local)

```
Frontend:  http://localhost:5173
           │        │       └─ Port (Vite default)
           │        └───────── Hostname
           └────────────────── Protocol

Backend:   http://localhost:5000
           │        │       └─ Port (Express config)
           │        └───────── Hostname
           └────────────────── Protocol

Database:  mongodb://localhost:27017/markit
           │         │         │     └─ Database name
           │         │         └─────── Port
           │         └───────────────── Hostname
           └─────────────────────────── Protocol
```

### Production (Deployed)

```
Frontend:  https://markit-xxx.vercel.app
           │     │           └─ Subdomain (auto-generated)
           │     └───────────── Domain
           └─────────────────── Protocol (always HTTPS)

Backend:   https://markit-backend-xxx.onrender.com
           │     │             │        └─ Domain
           │     │             └────────── Unique ID
           │     └──────────────────────── Service name
           └────────────────────────────── Protocol (always HTTPS)

API:       https://markit-backend-xxx.onrender.com/api
                                              └─ API prefix

Database:  mongodb+srv://cluster.xxxxx.mongodb.net/markit
           │            │                       └─ Database
           │            └─────────────────────────── Cluster
           └──────────────────────────────────────── Protocol (SRV)
```

---

## Security Flow

### Authentication Flow

```
1. User Login
   ──────────
   Browser                 Backend              Database
      │                       │                    │
      │ POST /api/auth/login  │                    │
      │──────────────────────▶│                    │
      │  {email, password}    │                    │
      │                       │ Find user          │
      │                       │───────────────────▶│
      │                       │                    │
      │                       │ User data          │
      │                       ◀───────────────────│
      │                       │                    │
      │                       │ Compare password   │
      │                       │ (bcrypt)           │
      │                       │                    │
      │                       │ Generate JWT       │
      │                       │ (jsonwebtoken)     │
      │                       │                    │
      │ JWT + Cookie          │                    │
      ◀──────────────────────│                    │
      │                       │                    │
      │ Store in localStorage │                    │
      │ & cookie              │                    │


2. Protected Request
   ─────────────────
   Browser                 Backend              Database
      │                       │                    │
      │ GET /api/subjects     │                    │
      │ Authorization: Bearer token               │
      │──────────────────────▶│                    │
      │                       │                    │
      │                       │ Verify JWT         │
      │                       │ (jwt.verify)       │
      │                       │                    │
      │                       │ Decode user ID     │
      │                       │                    │
      │                       │ Find user          │
      │                       │───────────────────▶│
      │                       │                    │
      │                       │ User data          │
      │                       ◀───────────────────│
      │                       │                    │
      │                       │ Attach to request  │
      │                       │ req.user = user    │
      │                       │                    │
      │                       │ Get subjects       │
      │                       │───────────────────▶│
      │                       │                    │
      │                       │ Subjects data      │
      │                       ◀───────────────────│
      │                       │                    │
      │ JSON response         │                    │
      ◀──────────────────────│                    │
```

---

## DNS & Routing

### How Requests Reach Your App

```
User types: markit-xxx.vercel.app
     │
     ▼
DNS Lookup
     │
     ├─▶ Vercel DNS Server
     │       │
     │       ▼
     │   Returns IP: 76.76.21.21 (example)
     │
     ▼
Browser connects to IP
     │
     ▼
Vercel Edge Network (CDN)
     │
     ├─▶ Serves cached static files (if available)
     │
     └─▶ Serves index.html
         │
         ▼
     Browser runs JavaScript
         │
         ├─▶ Reads VITE_API_URL
         │
         └─▶ Makes API call to: markit-backend-xxx.onrender.com
                 │
                 ▼
             DNS Lookup
                 │
                 ▼
             Render Server IP
                 │
                 ▼
             Express App receives request
                 │
                 ▼
             Processes & returns data
```

---

## Scaling & Load

### Free Tier Limitations

```
MongoDB Atlas (Free - M0)
├─ Storage: 512MB
├─ RAM: Shared
├─ CPU: Shared
├─ Connections: 500 max
└─ Throughput: Shared

Render (Free)
├─ Memory: 512MB
├─ CPU: 0.1 vCPU (shared)
├─ Disk: N/A (ephemeral)
├─ Sleep: After 15min inactivity
└─ Build time: 15 min max

Vercel (Hobby - Free)
├─ Bandwidth: 100GB/month
├─ Builds: 6000 min/month
├─ Serverless Functions: 100GB-hrs
├─ Edge Requests: Unlimited
└─ Concurrent Builds: 1
```

### When to Upgrade

```
Need to Upgrade If:
├─ MongoDB
│   ├─ Storage > 512MB
│   ├─ Need backups
│   └─ Need dedicated resources
│
├─ Render
│   ├─ Can't tolerate sleep delay
│   ├─ Need more memory/CPU
│   └─ Need persistent storage
│
└─ Vercel
    ├─ Bandwidth > 100GB/month
    ├─ Need team features
    └─ Need advanced analytics
```

---

## Connection Checklist

Use this to verify all connections are set up correctly:

### ✅ Frontend → Backend

- [ ] `VITE_API_URL` set in Vercel
- [ ] `VITE_API_URL` ends with `/api`
- [ ] `VITE_SOCKET_URL` set in Vercel
- [ ] `VITE_SOCKET_URL` has no `/api`
- [ ] Can access `/api/health` endpoint
- [ ] No CORS errors in browser console

### ✅ Backend → Database

- [ ] `MONGODB_URI` set in Render
- [ ] Connection string has database name `/markit`
- [ ] Password is correct (no special chars)
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user has read/write permissions
- [ ] Backend logs show "MongoDB Connected"

### ✅ Backend → Frontend (CORS)

- [ ] `CLIENT_URL` set in Render
- [ ] `CLIENT_URL` matches Vercel URL exactly
- [ ] No trailing slash in `CLIENT_URL`
- [ ] CORS middleware configured in server.js
- [ ] Backend accepts requests from Vercel

### ✅ End-to-End

- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can create subjects
- [ ] Can add lectures
- [ ] Real-time updates work
- [ ] No console errors

---

**Tip**: If any connection fails, check the corresponding section in `TROUBLESHOOTING.md`
