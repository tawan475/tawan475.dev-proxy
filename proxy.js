const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const targets = {
    'api':   "http://localhost:8000",
    'http':  "http://localhost:8080",
    'https': "http://localhost:8443",
}

const app = express();

app.use(createProxyMiddleware('/', { target: targets['https'] }));
app.listen(80);