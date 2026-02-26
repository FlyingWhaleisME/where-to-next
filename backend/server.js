const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const app = express();


const PORT = process.env.PORT || 3001;

// Import models
const User = require('./models/User');
const TripPreferences = require('./models/TripPreferences');
const TripTracingState = require('./models/TripTracingState');
const Document = require('./models/Document');
const DocumentShare = require('./models/DocumentShare');


// Asynchronous function to establish MongoDB database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/where-to-next';
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', mongoURI);
    
    await mongoose.connect(mongoURI);
    
    console.log('Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.log('Make sure MongoDB is running: brew services start mongodb-community');
    return false;
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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
// POST endpoint for user registration by using Express.js middleware functions
// Array contains validation middleware functions for email and password
app.post('/api/auth/register', [
  // Validate email format using express-validator
  body('email').isEmail().withMessage('Please provide a valid email'),
  // Validate password length using express-validator
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  // Optional name field with whitespace trimming
  body('name').optional().trim()
], async (req, res) => {
  try {
    // Check if validation passed
    const errors = validationResult(req);
    
    // If validation failed, return error response
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    // Extract validated data from request body
    const { email, password, name } = req.body;

    // Query database to check if user already exists
    // Prevents duplicate account creation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Use Mongoose model to create and save a new user
    const user = new User({ email, password, name });
    // Await pauses execution until user is saved to MongoDB database
    // Returns Promise that resolves to the saved user
    await user.save();
    
    // Generate JWT authentication token
    // Token contains user ID and email, expires in 24 hours
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return success response with token and user data
    // 201 status code is a created resource response
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    // Return what went wrong as a JSON error response if user registration fails
    // 500 status code is a generic server error
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
      process.env.JWT_SECRET,
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

// POST endpoint: Create a new trip preference
app.post('/api/preferences', authenticateToken, async (req, res) => {
  try {
    // Create new TripPreferences instance using Mongoose model
    const preference = new TripPreferences({
      ...req.body, // Spread operator copies all preferences data from request body (frontend)
      userId: req.user.userId // Add userId from JWT token for ownership
    });

    // Save the TripPreferences instance to MongoDB database
    await preference.save(); // await pauses execution until save completes
    // Returns Promise that resolves to the saved preference

    // Return the created preference as JSON success response
    res.status(201).json(preference);
  } catch (error) {
    // Return what went wrong as a JSON error response if preference creation fails
    // 400 status code is a bad request error
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

// GET endpoint: Retrieve a specific document by ID
app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    // Query MongoDB for document matching IDs for privacy and ownership
    const document = await Document.findOne({ 
      _id: req.params.id,                     // Document ID from URL parameter
      userId: req.user.userId                 // User ID from JWT authentication token
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return the found document as JSON success response
    res.json(document);
  } catch (error) {
    // Return what went wrong (database query) as a JSON error response if document not found
    // 500 status code is a generic server error
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint: Create and save a new trip document
app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    // Create new Document instance using Mongoose model
    const document = new Document({
      ...req.body,              // Spread operator copies all document properties from request body (frontend)
      userId: req.user.userId   // Add userId from JWT token for ownership
    });

    // Save the Document instance to MongoDB database
    // await pauses execution until save completes
    // Returns Promise that resolves to the saved document
    await document.save();

    // Return the created document as JSON success response
    // MongoDB automatically converts document to JSON format
    res.status(201).json(document);
  } catch (error) {
    // Return what went wrong (validation or database) as a JSON error response if document creation fails
    // 400 status code is a bad request error
    res.status(400).json({ error: error.message });
  }
});

// PUT endpoint: Update an existing document
app.put('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    // Find and update document in one operation, ensuring privacy and ownership
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id,               // Document ID for search and update
        userId: req.user.userId },        // User ID for security
      req.body,                           // New data to update from request body (frontend)
      { new: true, runValidators: true }  // Return updated document and validate data before saving
    );

    // Return what went wrong (database query) as a JSON error response if document not found
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return the updated document as JSON success response
    res.json(document);
  } catch (error) {
    // Return what went wrong (validation or database) as a JSON error response if document update fails
    res.status(400).json({ error: error.message });
  }
});

// DELETE endpoint: Remove document from database
app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    // Find and delete document in one operation, ensuring privacy and ownership
    const document = await Document.findOneAndDelete({ 
      _id: req.params.id,                 // Document ID for search and delete
      userId: req.user.userId             // User ID for security
    });

    // Return what went wrong (database query) as a JSON error response if document not found
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return success response with message as a JSON success response
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    // Return what went wrong (validation or database) as a JSON error response if document deletion fails
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

// ===== DEBUG ENDPOINT =====
// Debug endpoint to view all accounts and their data (for development/testing only)
app.get('/api/debug/all-data', async (req, res) => {
  try {
    // Get all users (include password hash for debug)
    const users = await User.find({});
    
    // For each user, get their documents and preferences
    const usersWithData = await Promise.all(users.map(async (user) => {
      const documents = await Document.find({ userId: user._id });
      const preferences = await TripPreferences.find({ userId: user._id });
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        passwordHash: user.password,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        documentsCount: documents.length,
        documents: documents.map(doc => ({
          id: doc._id,
          title: doc.title || doc.destinationName || 'Untitled',
          createdAt: doc.createdAt,
          lastModified: doc.lastModified
        })),
        preferencesCount: preferences.length,
        preferences: preferences.map(pref => ({
          id: pref._id,
          surveyName: pref.surveyName || 'Unnamed Survey',
          completedAt: pref.completedAt,
          createdAt: pref.createdAt
        }))
      };
    }));
    
    res.json({
      totalUsers: usersWithData.length,
      users: usersWithData,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: Delete a user account and all their data by email
app.delete('/api/debug/delete-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Delete all user's data
    await Document.deleteMany({ userId: user._id });
    await TripPreferences.deleteMany({ userId: user._id });
    await TripTracingState.deleteMany({ userId: user._id });
    await DocumentShare.deleteMany({ creatorId: user._id });
    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: `Deleted user ${email} and all associated data` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete authenticated user's own account
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Delete all user's data
    await Document.deleteMany({ userId: user._id });
    await TripPreferences.deleteMany({ userId: user._id });
    await TripTracingState.deleteMany({ userId: user._id });
    await DocumentShare.deleteMany({ creatorId: user._id });
    await User.findByIdAndDelete(user._id);
    res.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    // Check if a share code already exists for this document
    const existingShare = await DocumentShare.findOne({ 
      documentId: documentId,
      creatorId: user.userId,
      isDeleted: { $ne: true } // Not deleted
    });

    if (existingShare) {
      // Return existing share code instead of creating a new one
      return res.json({
        success: true,
        shareCode: existingShare.shareCode,
        message: 'Document already shared'
      });
    }

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

const CollaborationServer = require('./collaborationServer');
let collaborationServer = null;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Network access: http://where-to-next.local:${PORT}`);
  
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasCustomPort = process.env.PORT && process.env.PORT !== '3001';
    const isCloudPlatform = isProduction || hasCustomPort;
    
    if (isCloudPlatform) {
      collaborationServer = new CollaborationServer(server);
      console.log(`Collaboration server attached to HTTP server (WebSocket available on same port ${PORT})`);
    } else {
      collaborationServer = new CollaborationServer(8080);
      console.log(`Collaboration server started on port 8080`);
    }
  } catch (error) {
    console.error('Failed to start collaboration server:', error);
  }
});

process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  if (collaborationServer) {
    collaborationServer.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  if (collaborationServer) {
    collaborationServer.shutdown();
  }
  process.exit(0);
});
