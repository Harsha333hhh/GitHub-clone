# Deploy to Vercel & Render

## 1. Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Select "GitHub"
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project
1. Click "Add New..." → "Project"
2. Search for and select: **GitHub-clone**
3. Click "Import"

### Step 3: Configure Project Settings
- **Project Name**: github-clone (or any name)
- **Root Directory**: `frontend` ← **IMPORTANT**
- **Framework Preset**: Vite
- Click "Environment Variables"

### Step 4: Add Environment Variables
Add this variable:
```
VITE_API_BASE_URL = https://your-render-backend-url.onrender.com
```
(You'll update this after deploying backend to Render)

For now, you can use:
```
VITE_API_BASE_URL = http://localhost:4000
```

### Step 5: Deploy
- Click "Deploy"
- Wait for deployment to complete (2-5 minutes)
- Your frontend URL will be shown (e.g., `https://github-clone-xxx.vercel.app`)

---

## 2. Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Sign Up"
3. Select "GitHub"
4. Authorize Render to access your GitHub account

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select: **GitHub-clone**
4. Select Branch: `main`

### Step 3: Configure Service
Fill in these details:
- **Name**: `github-clone-backend`
- **Runtime**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Region**: Choose closest to you (US preferred)

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
MONGODB_URI=mongodb+srv://Harshab34:Harshab34@harshascluster.2fvz9tp.mongodb.net/GitHub?retryWrites=true&w=majority&appName=HarshasCluster

PORT=10000

NODE_ENV=production

JWT_SECRET=your_super_secret_jwt_key_12345

JWT_SECRET_KEY=49173a7f2921a8147fc374e33bfcaa736747252f141e6caf9ff1fde5e53e3798

FRONTEND_URL=https://github-clone-xxx.vercel.app
```

Replace `github-clone-xxx.vercel.app` with your actual Vercel URL from Step 1.

### Step 5: Deploy
- Click "Create Web Service"
- Render will build and deploy automatically (3-5 minutes)
- Your backend URL will be shown (e.g., `https://github-clone-backend.onrender.com`)

---

## 3. Update Vercel with Backend URL

Once you have your Render URL:

1. Go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL = https://github-clone-backend.onrender.com
   ```
4. Go to "Deployments" → Click latest deployment → "Redeploy"

---

## 4. Test Your Deployment

After both are deployed:

1. Visit your Vercel URL: `https://github-clone-xxx.vercel.app`
2. Try logging in or creating a repository
3. Check browser DevTools (F12) → Network tab
4. Verify API calls go to your Render backend URL

---

## 5. Continuous Deployment

After initial setup:
- **Push to GitHub** → Vercel auto-deploys frontend
- **Push to GitHub** → Render auto-deploys backend
- No manual steps needed!

---

## Troubleshooting

**Frontend can't connect to backend:**
- Check `VITE_API_BASE_URL` in Vercel environment variables
- Make sure it matches your Render URL exactly
- Redeploy Vercel after updating

**Backend deployment fails:**
- Check Render logs: Dashboard → Logs
- Verify `npm start` works locally: `npm run dev` in backend folder
- Check all environment variables are set

**Render is sleeping:**
- Free tier Render instances sleep after 15 minutes of inactivity
- Upgrade to paid plan to keep it always on

**CORS errors:**
- Update `FRONTEND_URL` in Render with your Vercel URL
- Restart Render service

---

## Current URLs Structure

After deployment, you'll have:

```
Frontend (Vercel):    https://github-clone-xxx.vercel.app
Backend API (Render): https://github-clone-backend.onrender.com
MongoDB:              Harsha's Cluster (Atlas)
GitHub Repo:          https://github.com/Harsha333hhh/GitHub-clone
```

---

**Ready to deploy? Start with Vercel (Step 1), then Render (Step 2)!**
