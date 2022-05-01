require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const subdomain = require('express-subdomain');
const targets = {
    'api': "https://localhost:8000", // https
    'http': "http://localhost:8080", // http - should never allow http
    'https': "https://localhost:8443", // https
}
const proxy = (url) => {
    // allow insecure https for self sign localhost cert
    let isProduction = process.env.NODE_ENV === "production";
    return createProxyMiddleware('/', { target: targets[url], secure: isProduction })
}

const app = express();

// require middlwares
require('./libs/middlewares')(app);

// require api
app.use(subdomain('api', proxy('api')));

// https without any subdomain should be the last one
app.use(proxy('https'));


const options = process.env.NODE_ENV === "production" ? {
    key: fs.readFileSync('./libs/ssl/private.key.pem'),
    cert: fs.readFileSync('./libs/ssl/domain.cert.pem'),
    ca: fs.readFileSync('./libs/ssl/intermediate.cert.pem')
} : {
    key: fs.readFileSync('./libs/ssl/localhost/localhost.key'),
    cert: fs.readFileSync('./libs/ssl/localhost/localhost.crt')
}

require('http').createServer(app).listen(80, () => {
    console.log(`listening at HTTP`)
});

require('https').createServer(options, app).listen(443, () => {
    console.log(`listening at HTTPS`)
});
