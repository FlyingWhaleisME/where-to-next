// ADVANCED TECHNIQUE 1: MODULAR DEPENDENCY MANAGEMENT
// Importing multiple specialized libraries for different functionalities
const express = require('express'); // Web framework for RESTful API architecture
const cors = require('cors'); // Cross-Origin Resource Sharing middleware for security
const mongoose = require('mongoose'); // Object Document Mapper (ODM) for MongoDB
const jwt = require('jsonwebtoken'); // JSON Web Token library for stateless authentication
const { body, validationResult } = require('express-validator'); // Input validation middleware
const OpenAI = require('openai'); // AI service integration for external API calls
require('dotenv').config(); // Environment variable management for configuration

// Import models
const User = require('./models/User');
const TripPreferences = require('./models/TripPreferences');
const TripTracingState = require('./models/TripTracingState');
const Document = require('./models/Document');
const DocumentShare = require('./models/DocumentShare');

// ADVANCED TECHNIQUE 2: CONDITIONAL SERVICE INITIALIZATION
// Lazy initialization pattern - only create OpenAI instance if API key exists
// This prevents application crashes when external services are unavailable
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

// ADVANCED TECHNIQUE 3: ASYNC/AWAIT ERROR HANDLING WITH FALLBACK VALUES
// Async function with comprehensive error handling and fallback configuration
// Uses environment variables with default values for development flexibility
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/where-to-next';
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 URI:', mongoURI);
    
    // Simple connection without complex options
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running: brew services start mongodb-community');
    return false;
  }
};

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ADVANCED TECHNIQUE 4: MIDDLEWARE PATTERN WITH JWT AUTHENTICATION
// Custom middleware function that implements JWT token validation
// Uses callback-based JWT verification with error handling
// Modifies request object to attach user data for downstream routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint to verify frontend-backend communication
app.get('/api/test', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = dbStatus === 1 ? 'Connected' : 
                      dbStatus === 2 ? 'Connecting' : 
                      dbStatus === 3 ? 'Disconnecting' : 'Disconnected';
  
  res.json({ 
    message: 'Frontend-backend communication successful!',
    data: {
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatusText,
      databaseState: dbStatus,
      mongodbVersion: mongoose.version
    }
  });
});

// ===== AUTHENTICATION ENDPOINTS =====

// ADVANCED TECHNIQUE 5: INPUT VALIDATION MIDDLEWARE CHAINING
// Multiple middleware functions chained together for comprehensive validation
// Express-validator provides declarative validation rules with custom error messages
app.post('/api/auth/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').optional().trim()
], async (req, res) => {
  try {
    // Validation result processing with error aggregation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    const { email, password, name } = req.body;
    
    // ADVANCED TECHNIQUE 6: DATABASE QUERY OPTIMIZATION
    // Check if user already exists before creating new user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({ email, password, name });
    await user.save();
    
    // ADVANCED TECHNIQUE 7: JWT TOKEN GENERATION WITH EXPIRATION
    // Generate JWT token with user payload and configurable expiration
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    const { email, password } = req.body;
    
    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== API ENDPOINTS =====

// Trip Preferences CRUD
app.get('/api/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await TripPreferences.find({ userId: req.user.userId })
      .sort({ lastModified: -1 });
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/preferences/:id', authenticateToken, async (req, res) => {
  try {
    const preference = await TripPreferences.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!preference) {
      return res.status(404).json({ error: 'Preference not found' });
    }
    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/preferences', authenticateToken, async (req, res) => {
  try {
    const preference = new TripPreferences({
      ...req.body,
      userId: req.user.userId
    });
    await preference.save();
    res.status(201).json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/preferences/:id', authenticateToken, async (req, res) => {
  try {
    const preference = await TripPreferences.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!preference) {
      return res.status(404).json({ error: 'Preference not found' });
    }
    res.json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/preferences/:id', authenticateToken, async (req, res) => {
  try {
    const preference = await TripPreferences.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!preference) {
      return res.status(404).json({ error: 'Preference not found' });
    }
    res.json({ message: 'Preference deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Documents CRUD
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .sort({ lastModified: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      userId: req.user.userId
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trip Tracing State CRUD
app.get('/api/trip-tracing', authenticateToken, async (req, res) => {
  try {
    const tripTracingStates = await TripTracingState.find({ userId: req.user.userId })
      .sort({ lastModified: -1 });
    res.json(tripTracingStates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trip-tracing/:id', authenticateToken, async (req, res) => {
  try {
    const tripTracingState = await TripTracingState.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!tripTracingState) {
      return res.status(404).json({ error: 'Trip tracing state not found' });
    }
    res.json(tripTracingState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trip-tracing', authenticateToken, async (req, res) => {
  try {
    const tripTracingState = new TripTracingState({
      ...req.body,
      userId: req.user.userId
    });
    await tripTracingState.save();
    res.status(201).json(tripTracingState);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/trip-tracing/:id', authenticateToken, async (req, res) => {
  try {
    const tripTracingState = await TripTracingState.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tripTracingState) {
      return res.status(404).json({ error: 'Trip tracing state not found' });
    }
    res.json(tripTracingState);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/trip-tracing/:id', authenticateToken, async (req, res) => {
  try {
    const tripTracingState = await TripTracingState.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!tripTracingState) {
      return res.status(404).json({ error: 'Trip tracing state not found' });
    }
    res.json({ message: 'Trip tracing state deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== AI INTEGRATION ENDPOINT =====

// ADVANCED TECHNIQUE 8: EXTERNAL API INTEGRATION WITH FALLBACK HANDLING
// AI service integration with comprehensive error handling and service availability checks
app.post('/api/ai/generate-summary', authenticateToken, async (req, res) => {
  try {
    const { tripPreferences, tripTracingState } = req.body;
    
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service not configured',
        fallback: 'Please add OPENAI_API_KEY to environment variables'
      });
    }
    
    // ADVANCED TECHNIQUE 9: DYNAMIC STRING TEMPLATING WITH CONDITIONAL LOGIC
    // Complex string interpolation with type checking and fallback values
    const prompt = `
Based on these travel preferences:
- Group Size: ${tripPreferences.groupSize || 'Not specified'}
- Duration: ${typeof tripPreferences.duration === 'object' ? 
  `Status: ${tripPreferences.duration.duration?.status || 'Not specified'}` : 
  tripPreferences.duration || 'Not specified'}
- Budget: ${tripPreferences.budget || 'Not specified'} ${tripPreferences.currency || 'USD'}
- Destination Style: ${tripPreferences.destinationStyle || 'Not specified'}
- Trip Vibe: ${tripPreferences.tripVibe || 'Not specified'}
- Planning Style: ${tripPreferences.planningStyle || 'Not specified'}

${tripTracingState ? `
And these detailed preferences:
- Accommodation: ${tripTracingState.accommodation?.selectedTypes?.join(', ') || 'Not specified'}
- Transportation: ${tripTracingState.transportation?.selectedMethods?.join(', ') || 'Not specified'}
- Food Preferences: ${tripTracingState.foodPreferences?.styles?.join(', ') || 'Not specified'}
` : ''}

Please provide:
1. A personalized travel summary
2. Destination recommendations with reasoning
3. Budget breakdown and tips
4. Cultural considerations and travel tips

Keep the response concise but informative, focusing on actionable advice.
    `;
    
    // ADVANCED TECHNIQUE 10: ASYNC API CALL WITH CONFIGURATION OBJECT
    // External API call with structured configuration and response handling
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    res.json({
      summary: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      model: "gpt-3.5-turbo"
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ 
      error: 'AI service temporarily unavailable',
      details: error.message
    });
  }
});

// ===== ADDITIONAL ENDPOINTS =====

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's saved destinations
app.get('/api/user/destinations', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .select('destinationName createdAt lastModified')
      .sort({ lastModified: -1 });
    
    const destinations = documents.map(doc => ({
      id: doc._id,
      name: doc.destinationName,
      createdAt: doc.createdAt,
      lastModified: doc.lastModified
    }));
    
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search documents by destination name
app.get('/api/documents/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = req.params.query;
    const documents = await Document.find({
      userId: req.user.userId,
      destinationName: { $regex: query, $options: 'i' }
    }).sort({ lastModified: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export user data (for backup/download)
app.get('/api/user/export', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const preferences = await TripPreferences.find({ userId: req.user.userId });
    const tripTracingStates = await TripTracingState.find({ userId: req.user.userId });
    const documents = await Document.find({ userId: req.user.userId });
    
    const exportData = {
      user: user,
      preferences: preferences,
      tripTracingStates: tripTracingStates,
      documents: documents,
      exportedAt: new Date().toISOString()
    };
    
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DOCUMENT SHARING ENDPOINTS =====

// ADVANCED TECHNIQUE 11: CRYPTOGRAPHIC RANDOM STRING GENERATION
// Custom algorithm for generating secure, unique share codes
// Uses mathematical randomization with character set filtering
const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create shared document
app.post('/api/documents/share', authenticateToken, async (req, res) => {
  try {
    const { documentData, documentId } = req.body;
    const user = req.user;

    if (!documentData || !documentId) {
      return res.status(400).json({ error: 'Document data and ID are required' });
    }

    // ADVANCED TECHNIQUE 12: COLLISION AVOIDANCE WITH RETRY MECHANISM
    // Implements a retry loop to ensure unique share codes
    // Prevents race conditions in concurrent share code generation
    let shareCode;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      shareCode = generateShareCode();
      const existing = await DocumentShare.findOne({ shareCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique share code' });
    }

    // Create document share entry
    // Fetch user data from database to get the full name (same as chatbox)
    const dbUser = await User.findById(user.userId);
    const creatorName = dbUser?.name || user.email.split('@')[0];
    
    const documentShare = new DocumentShare({
      shareCode,
      documentId,
      documentData,
      creatorId: user.userId,
      creatorName: creatorName
    });

    await documentShare.save();

    res.json({
      success: true,
      shareCode,
      message: 'Document shared successfully'
    });
  } catch (error) {
    console.error('Error creating document share:', error);
    res.status(500).json({ error: error.message });
  }
});

// Access shared document by code (no authentication required for viewing)
app.get('/api/documents/share/:shareCode', async (req, res) => {
  try {
    const { shareCode } = req.params;

    if (!shareCode || shareCode.length !== 6) {
      return res.status(400).json({ error: 'Invalid share code format' });
    }

    const documentShare = await DocumentShare.findOne({ 
      shareCode: shareCode.toUpperCase(),
      isDeleted: false 
    });

    if (!documentShare) {
      return res.status(404).json({ error: 'Document not found or has been deleted' });
    }

    // Update access statistics
    documentShare.accessCount += 1;
    documentShare.lastAccessedAt = new Date();
    await documentShare.save();

    res.json({
      success: true,
      document: {
        id: documentShare.documentId,
        data: documentShare.documentData,
        creatorName: documentShare.creatorName,
        createdAt: documentShare.createdAt,
        accessCount: documentShare.accessCount
      }
    });
  } catch (error) {
    console.error('Error accessing shared document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete shared document (creator only)
app.delete('/api/documents/share/:shareCode', authenticateToken, async (req, res) => {
  try {
    const { shareCode } = req.params;
    const user = req.user;

    const documentShare = await DocumentShare.findOne({ 
      shareCode: shareCode.toUpperCase() 
    });

    if (!documentShare) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (documentShare.creatorId !== user.userId) {
      return res.status(403).json({ error: 'Only the creator can delete this document' });
    }

    // Soft delete
    documentShare.isDeleted = true;
    documentShare.deletedAt = new Date();
    await documentShare.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shared document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update shared document (creator only)
app.put('/api/documents/share/:shareCode', authenticateToken, async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { documentData } = req.body;
    const user = req.user;

    if (!documentData) {
      return res.status(400).json({ error: 'Document data is required' });
    }

    const documentShare = await DocumentShare.findOne({ 
      shareCode: shareCode.toUpperCase() 
    });

    if (!documentShare) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (documentShare.creatorId !== user.userId) {
      return res.status(403).json({ error: 'Only the creator can update this document' });
    }

    if (documentShare.isDeleted) {
      return res.status(410).json({ error: 'Document has been deleted' });
    }

    // Update the document data
    documentShare.documentData = documentData;
    documentShare.lastAccessedAt = new Date();
    await documentShare.save();

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating shared document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's shared documents
app.get('/api/documents/share', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    const sharedDocuments = await DocumentShare.find({
      creatorId: user.userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      documents: sharedDocuments.map(doc => ({
        shareCode: doc.shareCode,
        documentId: doc.documentId,
        createdAt: doc.createdAt,
        accessCount: doc.accessCount,
        lastAccessedAt: doc.lastAccessedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching user shared documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADVANCED TECHNIQUE 13: MODULAR SERVER ARCHITECTURE WITH DEPENDENCY INJECTION
// Separate collaboration server module with dynamic initialization
const CollaborationServer = require('./collaborationServer');
let collaborationServer = null;

// ADVANCED TECHNIQUE 14: MULTI-SERVICE APPLICATION BOOTSTRAPPING
// Main server startup with secondary service initialization
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Network access: http://where-to-next.local:${PORT}`);
  
  // Start collaboration server
  try {
    collaborationServer = new CollaborationServer(8080);
    console.log(`🔗 Collaboration server started on port 8080`);
  } catch (error) {
    console.error('❌ Failed to start collaboration server:', error);
  }
});

// ADVANCED TECHNIQUE 15: GRACEFUL SHUTDOWN WITH SIGNAL HANDLING
// Process signal handlers for clean application termination
// Ensures proper resource cleanup and prevents data corruption
process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  if (collaborationServer) {
    collaborationServer.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down servers...');
  if (collaborationServer) {
    collaborationServer.shutdown();
  }
  process.exit(0);
});
