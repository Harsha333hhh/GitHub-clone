# Deployment Guide: GitHub Clone

This guide covers uploading your project to GitHub and deploying to Vercel and Render with MongoDB Atlas.

---

## 1. GitHub Push (Authentication & Upload)

### Step 1: Configure Git User (One-time setup)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Create Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "GitHub Clone Deployment"
4. Select scopes:
   - ✅ repo (full control of private repositories)
   - ✅ workflow (update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 3: Push Your Code
Run this command in your terminal:
```bash
cd /Users/harshavardanmadupa/Desktop/GitHub
git push -u origin main
```

When prompted for password, paste your Personal Access Token.

Or use this one-liner to avoid re-entering credentials:
```bash
git push -u https://[YOUR_TOKEN]@github.com/Harsha333hhh/GitHub-clone.git main
```

### Step 4: Verify Push
```bash
git log --oneline -5
```
You should see your commits.

---

## 2. MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up and create an account
3. Create a new project: "GitHub Clone"

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose **M0 Sandbox** (free tier)
3. Select your region (AWS recommended)
4. Create cluster (wait ~10 minutes)

### Step 3: Create Database User
1. Go to Security → Database Access
2. Click "Add New Database User"
3. Username: `github_user`
4. Password: (auto-generate or create strong password - **save it**)
5. Database User Privileges: `Atlas Admin`
6. Click "Add User"

### Step 4: Whitelist IP Address
1. Go to Security → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Select "Drivers"
3. Choose "Node.js" and version "4.x or higher"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `myFirstDatabase` with `GitHub`

Example:
```
mongodb+srv://github_user:PASSWORD@cluster0.xxxxx.mongodb.net/GitHub?retryWrites=true&w=majority
```

---

## 3. Backend Deployment (Render)

### Step 1: Connect Your GitHub Repository
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Select your GitHub repository: `Harsha333hhh/GitHub-clone`
5. Branch: `main`
6. Runtime: `Node`
7. Build Command: `cd backend && npm install`
8. Start Command: `cd backend && npm start`

### Step 2: Configure Environment Variables
In the Render dashboard, go to "Environment" and add:

```
MONGODB_URI=mongodb+srv://github_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/GitHub?retryWrites=true&w=majority
PORT=10000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_12345
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### Step 3: Deploy
- Click "Create Web Service"
- Render will automatically deploy
- Get your backend URL (e.g., `https://github-clone-backend.onrender.com`)

### Step 4: Test Backend
```bash
curl https://github-clone-backend.onrender.com/common-api/trending
```

---

## 4. Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI (Optional but recommended)
```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository: `Harsha333hhh/GitHub-clone`
5. Select "Frontend" as root directory
6. Click "Import"

### Step 3: Configure Environment Variables
In Project Settings → Environment Variables, add:

```
VITE_API_BASE_URL=https://github-clone-backend.onrender.com
```

### Step 4: Deploy
- Vercel will automatically deploy
- Your frontend URL: `https://your-project.vercel.app`

### Step 5: Update Backend CORS
After getting your Vercel URL, update the `FRONTEND_URL` environment variable in Render:
```
FRONTEND_URL=https://your-project.vercel.app
```

---

## 5. Update Backend Connection String (Production)

### In [backend/server.js](backend/server.js):
The code has been updated to use environment variables. Verify:
```javascript
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/GitHub'
const port = process.env.PORT || 4000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
```

---

## 6. Local Development Setup

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Create Local .env File
Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/GitHub
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_secret_key
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:4000
```

### Run Local Server
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## 7. Troubleshooting

### GitHub Push Issues
- **Error**: "Invalid username or token"
  - Use Personal Access Token (not password)
  - Token must have `repo` scope

### MongoDB Connection Issues
- **Error**: "connection refused"
  - Check IP whitelist (Network Access → 0.0.0.0/0)
  - Verify password in connection string
  - Check username and database name

### CORS Errors
- **Error**: "Access to XMLHttpRequest blocked by CORS"
  - Update `FRONTEND_URL` in Render backend
  - Restart Render service
  - Clear browser cache

### Render Deployment Failed
- Check Render logs: Dashboard → Logs
- Verify `npm start` works locally: `npm run dev`
- Check all environment variables are set

### Vercel Build Failed
- Check Vercel logs
- Ensure `VITE_API_BASE_URL` is set correctly
- Verify root directory is set to `frontend`

---

## 8. Quick Reference: URLs After Deployment

Replace these with your actual URLs:

| Service | URL |
|---------|-----|
| GitHub Repo | https://github.com/Harsha333hhh/GitHub-clone |
| Frontend (Vercel) | https://your-project.vercel.app |
| Backend API (Render) | https://your-backend.onrender.com |
| MongoDB Atlas | https://cloud.mongodb.com/v2 |

---

## 9. Important Security Notes

⚠️ **NEVER commit `.env` files** - they're in `.gitignore`

✅ **Always use environment variables** for:
- Database credentials
- JWT secrets
- API keys
- API URLs

✅ **Use `.env.example`** to document required variables

---

## 10. Continuous Deployment

After initial setup, deployments happen automatically:
- **Push to GitHub** → Vercel builds and deploys frontend
- **Push to GitHub** → Render builds and deploys backend
- **No manual steps needed!**

---

## Next Steps

1. ✅ Git initialized - DONE
2. 📤 Push to GitHub - Follow Section 1
3. 🗄️ Set up MongoDB Atlas - Follow Section 2
4. 🔧 Deploy Backend to Render - Follow Section 3
5. 🚀 Deploy Frontend to Vercel - Follow Section 4
6. ✨ Test both services

Good luck! 🚀
