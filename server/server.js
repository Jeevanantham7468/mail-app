import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import { seedDefaultAdmin } from './controllers/authController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bulk_mailer_db';

// Automatically clean up accidental port number in mongodb+srv:// URIs
// (e.g. mongodb+srv://user:pass@cluster.mongodb.net:27017/db -> mongodb+srv://user:pass@cluster.mongodb.net/db)
if (MONGO_URI.startsWith('mongodb+srv://')) {
  MONGO_URI = MONGO_URI.replace(/:[0-9]+(?=[\/\?]|$)/, '');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Catch-all for API 404s so /api/* NEVER returns HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`
  });
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// Error handling middleware (always returns JSON)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start Express server immediately so Render detects the open port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB asynchronously
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`Connected to MongoDB successfully`);
    await seedDefaultAdmin();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    if (err.message && err.message.includes('port number')) {
      console.error('Tip: mongodb+srv:// URIs from MongoDB Atlas must not contain a port number like :27017.');
    }
  });
