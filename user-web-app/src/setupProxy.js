const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to Vercel backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
      changeOrigin: true,
      secure: true,
      headers: {
        // CORS headers are handled by the backend
      },
      onError: (err, req, res) => {
        console.log('Proxy Error:', err.message);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Proxy error: ' + err.message);
      },
      logLevel: 'warn'
    })
  );
};