const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const targets = {
    'api':   "http://localhost:8000",
    'http':  "http://localhost:8080",
    'https': "http://localhost:8443",
}

const app = express();

// require middlwares
require('./libs/middlewares')(app);

app.use(createProxyMiddleware('/', { target: targets['http'] }));
app.listen(80);