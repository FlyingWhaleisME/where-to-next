# 🧪 Complete Testing Guide for Where To Next Backend Integration

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ MongoDB running locally (`brew services start mongodb-community`)
- ✅ Backend server running (`cd backend && node server.js`)
- ✅ Frontend running (`npm start`)
- ✅ All dependencies installed (`npm install` in both root and backend directories)

## 🚀 Quick Start Testing

### 1. **Backend Health Check**
```bash
# Test backend connectivity
curl http://localhost:3001/api/health

# Test database connection
curl http://localhost:3001/api/test
```

**Expected Response:**
```json
{
  "message": "Frontend-backend communication successful!",
  "data": {
    "serverTime": "2024-01-15T10:30:00.000Z",
    "environment": "development",
    "database": "Connected",
    "databaseState": 1,
    "mongodbVersion": "7.0.0"
  }
}
```

### 2. **Frontend Backend Connection Test**
1. Open your browser to `http://localhost:3000`
2. Click the "🧪 Test Backend Connection" button
3. Should show success message with server details

## 🔐 Authentication Testing

### **User Registration**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6789abcdef0",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### **User Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **Frontend Authentication Test**
1. Click "Register" in the header
2. Fill in the form with test data
3. Should show success message and update header
4. Click "Logout" to test logout functionality
5. Click "Login" and use the same credentials

## 📊 Data Persistence Testing

### **Trip Preferences CRUD**

#### Create Preferences
```bash
curl -X POST http://localhost:3001/api/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "groupSize": "solo",
    "budget": "1500",
    "currency": "USD",
    "destinationStyle": "cultural",
    "tripVibe": ["relaxed", "adventure"],
    "planningStyle": "detailed"
  }'
```

#### Get All Preferences
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/preferences
```

#### Update Preferences
```bash
curl -X PUT http://localhost:3001/api/preferences/PREFERENCE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "budget": "2000",
    "tripVibe": ["relaxed", "adventure", "cultural"]
  }'
```

#### Delete Preferences
```bash
curl -X DELETE http://localhost:3001/api/preferences/PREFERENCE_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Documents CRUD**

#### Create Document
```bash
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "destinationName": "Tokyo, Japan",
    "bigIdeaSurveyData": {
      "groupSize": "solo",
      "budget": "2000"
    },
    "tripTracingSurveyData": {
      "accommodation": {
        "selectedTypes": ["hotel", "hostel"]
      }
    }
  }'
```

#### Search Documents
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:3001/api/documents/search/tokyo"
```

### **Trip Tracing State CRUD**

#### Create Trip Tracing State
```bash
curl -X POST http://localhost:3001/api/trip-tracing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "surveyId": "survey_123",
    "surveyName": "Tokyo Trip Planning",
    "groupSize": "solo",
    "accommodation": {
      "selectedTypes": ["hotel", "hostel"],
      "changeThroughTrip": false
    },
    "transportation": {
      "selectedMethods": ["train", "walking"],
      "changeThroughTrip": false
    }
  }'
```

## 🤖 AI Integration Testing

### **Mock AI Response (No API Key)**
```bash
curl -X POST http://localhost:3001/api/ai/generate-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tripPreferences": {
      "groupSize": "solo",
      "tripVibe": ["relaxed", "cultural"],
      "budgetType": "unsure"
    }
  }'
```

**Expected Response (Mock):**
```json
{
  "summary": "Mock AI response: Based on your solo trip preferences...",
  "tokensUsed": 0,
  "model": "mock-response",
  "note": "This is a mock response. Add OPENAI_API_KEY to .env for real AI integration."
}
```

### **Real AI Response (With API Key)**
1. Get OpenAI API key from https://platform.openai.com/account/api-keys
2. Add to `backend/.env`: `OPENAI_API_KEY=sk-your-key-here`
3. Restart backend: `cd backend && node server.js`
4. Run the same curl command above
5. Should return real AI-generated travel advice

## 👤 User Profile Testing

### **Get User Profile**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/user/profile
```

### **Update User Profile**
```bash
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }'
```

### **Get User's Destinations**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/user/destinations
```

### **Export User Data**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/user/export
```

## 🌐 Frontend Integration Testing

### **Complete User Journey Test**
1. **Register/Login**: Create account or login
2. **Big Picture Survey**: Complete survey, data should save to backend
3. **Trip Tracing**: Complete detailed survey, data should save to backend
4. **Profile Page**: View saved data from backend
5. **AI Summary**: Generate AI summary using backend
6. **Logout/Login**: Verify data persists across sessions

### **Data Persistence Test**
1. Complete surveys while logged in
2. Logout and login with different account
3. Verify data is user-specific
4. Login with original account
5. Verify data is still there

## 🔧 Error Handling Testing

### **Invalid Authentication**
```bash
# Test without token
curl http://localhost:3001/api/preferences

# Test with invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3001/api/preferences
```

**Expected Response:**
```json
{
  "error": "Access token required"
}
```

### **Invalid Data**
```bash
# Test with invalid email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "error": "Please provide a valid email"
}
```

### **Database Connection Issues**
1. Stop MongoDB: `brew services stop mongodb-community`
2. Try any API call
3. Should handle gracefully with appropriate error messages
4. Restart MongoDB: `brew services start mongodb-community`

## 📱 Frontend UI Testing

### **Authentication Modal**
- [ ] Register form validation
- [ ] Login form validation
- [ ] Toggle between login/register
- [ ] Close modal functionality
- [ ] Error message display

### **Header Navigation**
- [ ] User state display (logged in/out)
- [ ] Dropdown menu functionality
- [ ] Navigation to different pages
- [ ] Logout functionality

### **Survey Pages**
- [ ] Data persistence during survey
- [ ] Navigation between questions
- [ ] Form validation
- [ ] Progress tracking

### **Profile Page**
- [ ] Display user information
- [ ] Show saved destinations
- [ ] Edit profile functionality
- [ ] Data export functionality

## 🐛 Common Issues & Solutions

### **MongoDB Connection Issues**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### **Backend Server Issues**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing processes
pkill -f "node server.js"

# Restart backend
cd backend && node server.js
```

### **Frontend Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart frontend
npm start
```

### **CORS Issues**
- Backend should handle CORS automatically
- If issues persist, check browser console for CORS errors
- Ensure frontend is running on port 3000

## 📊 Performance Testing

### **Load Testing (Optional)**
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test
artillery quick --count 10 --num 5 http://localhost:3001/api/health
```

### **Database Performance**
- Monitor MongoDB performance during heavy usage
- Check response times for large datasets
- Verify indexes are working properly

## ✅ Success Criteria

Your backend integration is successful when:

- [ ] All API endpoints respond correctly
- [ ] User authentication works end-to-end
- [ ] Data persists across browser sessions
- [ ] AI integration works (mock or real)
- [ ] Frontend communicates with backend seamlessly
- [ ] Error handling works properly
- [ ] User data is properly isolated
- [ ] All CRUD operations work
- [ ] Search functionality works
- [ ] Data export works

## 🎯 Next Steps

After successful testing:

1. **Deploy Backend**: Consider deploying to Heroku, Railway, or similar
2. **Deploy Frontend**: Deploy to Netlify, Vercel, or similar
3. **Set up Production Database**: Use MongoDB Atlas for production
4. **Add Monitoring**: Set up error tracking and performance monitoring
5. **Add Tests**: Write unit and integration tests
6. **Documentation**: Create API documentation

## 📞 Support

If you encounter issues:

1. Check the terminal output for error messages
2. Check browser console for frontend errors
3. Verify all services are running
4. Check network connectivity
5. Review this guide for common solutions

Happy testing! 🚀
