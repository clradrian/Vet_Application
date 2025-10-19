const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy only API calls
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
    })
  );

  // Proxy admin endpoints if your frontend calls them directly
  app.use(
    '/admin',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
    })
  );
};
