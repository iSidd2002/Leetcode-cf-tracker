# Environment Variables Configuration

## 🔧 Required Environment Variables for Render Deployment

### Frontend Environment Variables

Set these in your Render Static Site dashboard:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com/api` |
| `VITE_APP_NAME` | Application name | `LeetCode CF Tracker` |
| `VITE_APP_VERSION` | App version | `1.0.0` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_ENABLE_NOTIFICATIONS` | Enable notifications | `true` |
| `VITE_ENABLE_SYNC` | Enable cloud sync | `true` |

### Backend Environment Variables

Set these in your Render Web Service dashboard:

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `NODE_ENV` | Node environment | `production` | ✅ |
| `PORT` | Server port | `10000` | ✅ |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✅ |
| `JWT_SECRET` | JWT signing secret | `your-32-char-secret-key` | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.onrender.com` | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ |
| `LEETCODE_API_URL` | LeetCode GraphQL endpoint | `https://leetcode.com/graphql` | ❌ |
| `CODEFORCES_API_URL` | CodeForces API endpoint | `https://codeforces.com/api` | ❌ |

## 🚀 Quick Setup for Render

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Render
5. Get your connection string

### 2. Generate JWT Secret
```bash
# Generate a secure 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Render Environment Variables Setup

#### Backend Service:
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/leetcode_tracker
JWT_SECRET=your-generated-32-character-secret
FRONTEND_URL=https://your-frontend-name.onrender.com
```

#### Frontend Service:
```bash
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_APP_NAME=LeetCode CF Tracker
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_SYNC=true
```

## 🔒 Security Notes

1. **Never commit real environment variables to Git**
2. **Use strong, unique JWT secrets**
3. **Restrict MongoDB access to necessary IPs only**
4. **Use HTTPS URLs for all external services**
5. **Regularly rotate secrets and passwords**

## 🧪 Testing Environment Variables

### Local Development
Copy `.env.example` files and update with your local values:

```bash
# Frontend
cp Leetcode-cf-tracker/.env.example Leetcode-cf-tracker/.env.local

# Backend
cp server/.env.example server/.env
```

### Verify Configuration
Use the health check endpoints to verify your setup:

- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com/api/health`

## 📞 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check `FRONTEND_URL` matches your frontend domain
2. **Database Connection**: Verify `MONGODB_URI` and IP whitelist
3. **JWT Errors**: Ensure `JWT_SECRET` is set and consistent
4. **API Not Found**: Check `VITE_API_URL` points to correct backend

### Debug Commands:
```bash
# Check environment variables are loaded
curl https://your-backend.onrender.com/api/health

# Test database connection
# (Add a debug endpoint in development)
```
