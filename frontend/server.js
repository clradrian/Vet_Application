const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// User service proxy (auth, users)
app.use(
  '/api/users',
  createProxyMiddleware({
    target: 'http://user-service:3001',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api/users': '/users', // rewrite path
    },
  })
);

// Authentication endpoints
app.use(
  '/auth',
  createProxyMiddleware({
    target: 'http://user-service:3001',
    changeOrigin: true,
    secure: false,
  })
);

// Pet service proxy
app.use(
  '/api/pets',
  createProxyMiddleware({
    target: 'http://pet-service:3002',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '', // rewrite /api/pets to /pets
    },
  })
);

// Vaccines endpoints
app.use(
  '/api/vaccines',
  createProxyMiddleware({
    target: 'http://pet-service:3002',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '', // rewrite /api/vaccines to /vaccines
    },
  })
);

// Dewormings endpoints
app.use(
  '/api/dewormings',
  createProxyMiddleware({
    target: 'http://pet-service:3002',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '', // rewrite /api/dewormings to /dewormings
    },
  })
);

// Admin endpoints (route to user service)
app.use(
  '/admin',
  createProxyMiddleware({
    target: 'http://user-service:3001',
    changeOrigin: true,
    secure: false,
  })
);

// Notification service proxy
app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: 'http://notification-service:3003',
    changeOrigin: true,
    secure: false,
  })
);

// Default route for the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});