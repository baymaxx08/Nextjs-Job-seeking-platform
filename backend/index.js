const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config();

const { notFound, errorHandler } = require('./src/middleware/error');

const authRoutes = require('./src/routes/auth');
const jobsRoutes = require('./src/routes/jobs');
const seekerRoutes = require('./src/routes/seeker');
const providerRoutes = require('./src/routes/provider');
const notificationRoutes = require('./src/routes/notifications');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const clientUrls = (process.env.CLIENT_URL || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        ...clientUrls,
      ];

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' }, message: 'Service healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

function startServer(port = PORT) {
  try {
    const server = app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Backend server port ${port} already in use, reusing running instance.`);
      } else {
        console.error('Backend server error:', err);
      }
    });
    return server;
  } catch (err) {
    console.warn('Backend listen error:', err.message);
    return null;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };