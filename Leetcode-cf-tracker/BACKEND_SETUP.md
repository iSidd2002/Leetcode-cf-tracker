# Backend Setup Guide

This guide will help you set up the Node.js/Express backend for the LeetCode + CodeForces Tracker application.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Git

### 1. Install Dependencies

```bash
# Install frontend dependencies (if not already done)
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# MongoDB will be available at: mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Use it in the environment variables

### 3. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/leetcode-cf-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Application

#### Option A: Start Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option B: Start Separately
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Problems
- `GET /api/problems` - Get user's problems (protected)
- `POST /api/problems` - Create new problem (protected)
- `PUT /api/problems/:id` - Update problem (protected)
- `DELETE /api/problems/:id` - Delete problem (protected)
- `POST /api/problems/bulk` - Bulk create problems (protected)

### Contests
- `GET /api/contests` - Get user's contests (protected)
- `POST /api/contests` - Create new contest (protected)
- `PUT /api/contests/:id` - Update contest (protected)
- `DELETE /api/contests/:id` - Delete contest (protected)

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev    # Start with nodemon (auto-restart)
npm run build  # Build TypeScript
npm start      # Start production build
npm test       # Run tests
npm run lint   # Run ESLint
```

### Database Management

#### View Data
```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use leetcode-cf-tracker

# View collections
show collections

# View users
db.users.find()

# View problems
db.problems.find()
```

#### Reset Database
```bash
# Drop database (careful!)
mongosh
use leetcode-cf-tracker
db.dropDatabase()
```

## 🚀 Deployment

### Backend Deployment Options

#### 1. Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add mongodb
railway deploy
```

#### 2. Render
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Add environment variables

#### 3. Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git subtree push --prefix server heroku main
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-production-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **CORS**: Configure CORS for your production domain
3. **Rate Limiting**: Adjust rate limits based on your needs
4. **Environment Variables**: Never commit secrets to version control
5. **Database**: Use MongoDB Atlas with proper authentication
6. **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check connection
mongosh --eval "db.adminCommand('ismaster')"
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

#### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that CORS is properly configured in `server/src/index.ts`

#### Authentication Issues
- Verify JWT secret is set in backend `.env`
- Check that tokens are being sent with `Bearer ` prefix
- Ensure user exists in database

### Logs and Debugging

```bash
# Backend logs
cd server
npm run dev

# MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log

# Check API health
curl http://localhost:5000/api/health
```

## 📈 Monitoring and Analytics

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Stats
```javascript
// In MongoDB shell
db.stats()
db.users.countDocuments()
db.problems.countDocuments()
db.contests.countDocuments()
```

## 🔄 Data Migration

If you have existing localStorage data, the app will automatically handle the transition:

1. **First Login**: Data stays in localStorage
2. **Sync Feature**: Will be implemented to merge local and server data
3. **Offline Mode**: Always available as fallback

## 📞 Support

- Check the main README.md for general information
- Create issues on GitHub for bugs
- Check the API health endpoint for backend status
- Review server logs for debugging information
