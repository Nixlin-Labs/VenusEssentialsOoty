const env = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      env.CLIENT_URL,
      env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

module.exports = { corsOptions };
