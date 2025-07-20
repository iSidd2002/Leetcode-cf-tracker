# 🚀 Production Deployment Guide

## LeetCode + CodeForces Tracker

### 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Domain name (for production)
- SSL certificate (recommended)

### 🏗️ Frontend Deployment

#### 1. Build the Frontend
```bash
npm run build
```

#### 2. Deploy to Static Hosting
The `dist/` folder can be deployed to:
- **Vercel** (recommended)
- **Netlify** 
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static hosting service**

#### 3. Environment Configuration
Update `.env.production` with your production API URL:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 🖥️ Backend Deployment

#### 1. Build the Backend
```bash
cd server
npm run build
```

#### 2. Deploy to Server
The backend can be deployed to:
- **Railway** (recommended)
- **Heroku**
- **DigitalOcean**
- **AWS EC2**
- **Google Cloud Platform**

#### 3. Environment Variables
Set these environment variables on your hosting platform:
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
```

### 🔧 Production Checklist

#### Security
- [ ] JWT secret is secure and random
- [ ] CORS is configured for production domains only
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] MongoDB connection is secured

#### Performance
- [ ] Frontend is built and minified
- [ ] Backend is compiled to JavaScript
- [ ] Database indexes are optimized
- [ ] Compression is enabled

#### Monitoring
- [ ] Error logging is configured
- [ ] Health check endpoint is working
- [ ] Database connection monitoring
- [ ] API response time monitoring

### 🌐 Quick Deploy Commands

#### Frontend (Vercel)
```bash
npm install -g vercel
vercel --prod
```

#### Backend (Railway)
```bash
npm install -g @railway/cli
railway login
railway deploy
```

### 📊 Features Ready for Production

✅ **Core Features**
- Problem tracking (LeetCode, CodeForces, AtCoder)
- Spaced repetition system
- Contest tracking
- Company-wise problem organization
- Analytics and progress tracking

✅ **DSA Practice Sheets**
- Striver A2Z DSA Sheet
- NeetCode 150
- AlgoExpert Problems
- Learnyard DSA Practice

✅ **Problem of the Day**
- Real-time LeetCode POTD integration
- Add to personal tracking
- Fallback system for reliability

✅ **Data Management**
- Local storage for offline use
- Cloud sync when authenticated
- Import/export functionality
- Bulk operations

✅ **User Experience**
- Responsive design
- Dark/light theme
- Notifications
- Progress visualization

### 🔗 External Integrations

- **LeetCode API**: Problem of the Day
- **MongoDB**: Data persistence
- **JWT**: Authentication
- **Local Storage**: Offline functionality

### 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 🆘 Troubleshooting

#### Common Issues
1. **CORS Errors**: Update backend CORS configuration with production domains
2. **API Connection**: Verify VITE_API_URL in production environment
3. **Database Connection**: Check MongoDB URI and network access
4. **Authentication**: Ensure JWT secret is consistent across deployments

#### Health Checks
- Frontend: `https://your-domain.com`
- Backend: `https://your-api-domain.com/api/health`
- Database: Check connection logs

### 📞 Support

For deployment issues or questions, check the main README.md or create an issue in the repository.

---

**🎉 Your LeetCode + CodeForces Tracker is now production-ready!**
