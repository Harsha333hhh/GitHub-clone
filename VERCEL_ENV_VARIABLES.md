# Environment Variables for Vercel Deployment

## Copy this into Vercel → Environment Variables

```
VITE_API_BASE_URL=https://github-clone-yd0z.onrender.com
```

---

## Steps in Vercel:

1. Go to your Vercel project: **git-hub-clone-gl5w**
2. Click **Settings** tab
3. Click **Environment Variables** (left sidebar)
4. Find the existing `VITE_API_BASE_URL` variable
5. Update the **Value** to:
   ```
   https://github-clone-yd0z.onrender.com
   ```
6. Click **Save**
7. Go to **Deployments** tab
8. Click on the latest deployment
9. Click **"Redeploy"** button

---

## That's it! 

Your frontend will now connect to your Render backend at:
- **Backend**: `https://github-clone-yd0z.onrender.com`
- **Frontend**: `https://git-hub-clone-gl5w.vercel.app`

Once Vercel finishes redeploying, visit your frontend URL and test! 🚀
