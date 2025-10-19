const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // User service proxy (auth, users)
  app.use(
    '/api/users',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    })
  );

  // Authentication endpoints
  app.use(
    '/api/login',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    })
  );

  app.use(
    '/api/register',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    })
  );

  // Pet service proxy
  app.use(
    '/api/pets',
    createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      secure: false,
    })
  );

  // Notification service proxy
  app.use(
    '/api/notifications',
    createProxyMiddleware({
      target: 'http://localhost:3003',
      changeOrigin: true,
      secure: false,
    })
  );

  // Admin endpoints (route to user service)
  app.use(
    '/admin',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    })
  );
};
