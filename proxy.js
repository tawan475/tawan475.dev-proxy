const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const subdomain = require('express-subdomain');
const targets = {
    'api': "http://localhost:8000",
    // 'http': "http://localhost:8080", // should never allow http
    'https': "http://localhost:8443",
}

const onlyFromLocal = function (pathname, req) {
    // only pass to http if the connection is from local, otherwise use https
    if (req.socket.localAddress === req.socket.remoteAddress) {
        return true
    }
}

const app = express();

// require middlwares
require('./libs/middlewares')(app);

// require api
app.use(subdomain('api', createProxyMiddleware('/', { target: targets['api'] })));

// base without any subdomain should be the last one
app.use(createProxyMiddleware('/', { target: targets['https'] }));

const options = {
    key: fs.readFileSync('./libs/ssl/private.key.pem'),
    cert: fs.readFileSync('./libs/ssl/domain.cert.pem'),
    ca: fs.readFileSync('./libs/ssl/intermediate.cert.pem')
};

require('http').createServer(app).listen(80, () => {
    console.log(`listening at HTTP`)
});
require('https').createServer(options, app).listen(443, () => {
    console.log(`listening at HTTPS`)
});
