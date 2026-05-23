# Environment Variables for Render Deployment

## Copy each of these into Render → Environment Variables

```
MONGODB_URI=mongodb+srv://Harshab34:HarshaB34@harshascluster.2fvz9tp.mongodb.net/?appName=HarshasCluster

PORT=10000

NODE_ENV=production

JWT_SECRET=your_super_secret_jwt_key_12345

JWT_SECRET_KEY=49173a7f2921a8147fc374e33bfcaa736747252f141e6caf9ff1fde5e53e3798

FRONTEND_URL=https://git-hub-clone-gl5w.vercel.app
```

---

## Steps in Render:

1. Go to your **github-clone-backend** service
2. Click **Environment** tab
3. For each variable above:
   - Click "Add Environment Variable"
   - Paste the **NAME** (e.g., `MONGODB_URI`)
   - Paste the **VALUE** (entire string after the `=`)
4. Click **Save Changes**
5. Click **Redeploy latest commit**

---

## After Render Deploys Successfully:

1. Copy your Render backend URL (e.g., `https://github-clone-backend.onrender.com`)
2. Go to **Vercel** → Your project
3. Click **Settings** → **Environment Variables**
4. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://github-clone-backend.onrender.com
   ```
5. Click **Redeploy**

Done! 🚀
