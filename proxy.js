require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const subdomain = require('express-subdomain');
const targets = {
    'api': "https://localhost:8000",
    'go': "https://localhost:8002",
    'http': "http://localhost:8080",
    'https': "https://localhost:8443",
}
const proxy = (url) => {
    // allow insecure https for self sign localhost cert
    let isProduction = process.env.NODE_ENV === "production";
    return createProxyMiddleware({ target: targets[url], secure: isProduction, onError: errorHandler })
}

const app = express();
app.dirname = __dirname;
require('./libs/middlewares')(app);


app.use(subdomain('api', proxy('api')));
app.use(subdomain('go', proxy('go')));

let httpsProxy = proxy('https');
app.use((req, res, next) => {
    if (!req.subdomains.length) return httpsProxy(req, res, next);
    next();
});

app.use(function (req, res, next) {
    next(createError(404));
});


function errorHandler(err, req, res, next) {
    if (!err) return;
    res.status(err.status || 500).json({ status: err.status || 500, message: err.message || 'Internal Server Error' });
};
app.use(errorHandler);

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
