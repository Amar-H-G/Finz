import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || origin.startsWith('http://localhost') || origin === allowedOrigin || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiter for AI analyst endpoint
const analystLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per min
  message: { success: false, error: 'Too many AI analyst queries. Please wait a moment.' }
});
app.use('/api/analyst', analystLimiter);

// Mount main API
app.use('/api', apiRoutes);

// Root health ping
app.get('/', (req, res) => {
  res.json({ message: 'Finz AI-Native Financial Review Platform API is active.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.originalUrl} not found` });
});

// Central error handler
app.use(errorHandler);

export default app;
