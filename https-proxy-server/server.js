const express = require("express");
const https = require("https");
const fs = require("fs");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Path to the SSL certificate and key files
const sslOptions = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/algomon.kyle-jeffrey.com/privkey.pem"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/algomon.kyle-jeffrey.com/fullchain.pem"
  ),
};

const app = express();

// Proxy middleware configuration
const proxyOptions = {
  target: "http://localhost:80", // The address of your HTTP server
  changeOrigin: true,
  secure: false, // If your HTTP server uses self-signed certificates
};

// Apply the proxy to all requests
app.use("/", createProxyMiddleware(proxyOptions));

// Start the HTTPS server
https.createServer(sslOptions, app).listen(443, () => {
  console.log("HTTPS Proxy Server running on port 443");
});
