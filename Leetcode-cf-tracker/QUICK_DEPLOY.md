# 🚀 Quick Deployment Guide

## **Step-by-Step Deployment (Recommended)**

### **🎯 Option 1: Vercel + Railway (Easiest)**

#### **1. Deploy Frontend to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

#### **2. Deploy Backend to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd server
railway login
railway init
railway up
```

#### **3. Setup Database (MongoDB Atlas)**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Whitelist all IPs (0.0.0.0/0)

#### **4. Configure Environment Variables**

**Vercel (Frontend):**
- Go to vercel.com → Your Project → Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-railway-backend-url.com/api`

**Railway (Backend):**
- Go to railway.app → Your Project → Variables
- Add these variables:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leetcode-tracker
JWT_SECRET=your-super-secret-32-character-key
FRONTEND_URL=https://your-vercel-frontend-url.com
```

---

### **🎯 Option 2: Netlify + Heroku**

#### **1. Deploy Frontend to Netlify**
```bash
npm run build
# Go to netlify.com and drag/drop the dist/ folder
```

#### **2. Deploy Backend to Heroku**
```bash
cd server
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-netlify-url.com
git push heroku main
```

---

### **🎯 Option 3: GitHub Pages + Railway**

#### **1. Deploy Frontend to GitHub Pages**
```bash
npm install --save-dev gh-pages
# Add to package.json:
# "homepage": "https://yourusername.github.io/Leetcode-cf-tracker"
# "deploy": "gh-pages -d dist"
npm run deploy
```

#### **2. Deploy Backend to Railway** (same as Option 1)

---

## **⚡ One-Click Deploy Commands**

### **Quick Setup Script**
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment preparation
./deploy.sh
```

### **Environment Setup**
```bash
# Copy environment templates
cp .env.production .env.local
cp server/.env.example server/.env

# Edit with your actual values
nano .env.local
nano server/.env
```

---

## **🔧 Required Environment Variables**

### **Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=LeetCode CF Tracker
VITE_APP_VERSION=1.0.0
```

### **Backend (server/.env)**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/leetcode-tracker
JWT_SECRET=your-32-character-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

---

## **✅ Post-Deployment Checklist**

- [ ] Frontend loads correctly
- [ ] Backend API responds at `/api/health`
- [ ] Database connection works
- [ ] Authentication flow works
- [ ] POTD fetching works
- [ ] All DSA & CP sheet links work
- [ ] Problem tracking works
- [ ] Contest tracking works
- [ ] Data sync between frontend/backend works

---

## **🆘 Troubleshooting**

### **Common Issues:**
1. **CORS Errors**: Update `FRONTEND_URL` in backend env vars
2. **API Not Found**: Check `VITE_API_URL` in frontend env vars
3. **Database Connection**: Verify MongoDB URI and IP whitelist
4. **Build Failures**: Run `npm run build` locally first

### **Health Check URLs:**
- Frontend: `https://your-domain.com`
- Backend: `https://your-api-domain.com/api/health`

---

## **🎉 You're Live!**

Once deployed, your LeetCode + CodeForces Tracker will be accessible worldwide with:
- ✅ Real-time Problem of the Day
- ✅ Complete DSA & CP practice sheets
- ✅ Progress tracking and analytics
- ✅ Contest management
- ✅ Spaced repetition system
- ✅ Cloud sync capabilities

**Share your deployed app and start tracking your coding journey!** 🚀
