const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Trust proxy (needed for secure cookies and rate limiting behind Render's proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
