require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const subdomain = require('express-subdomain');
const { v4: uuidv4 } = require('uuid');
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

// error handler
app.use(function (err, req, res, next) {
    if (!err) return; // no error
    // render the error page
	let errorID = uuidv4();
	let errorRequestLog = `o:${req.get('origin') || "direct"} code:${res.statusCode} ${req.trustedip} ${req.method}:${req.protocol}://${req.get('host')}${req.url}`;
	let errorMessage = `[${Date.now()}] errorID: ${errorID} | ${errorRequestLog}\r\n${err.stack}`
	
	console.log(errorMessage)
	
	fs.appendFile(path.join(req.app.dirname, "./error_logs.log"), errorMessage + "\r\n", (err) => {
		if (err) console.log(err)
	});

	if (!err.status || err.status == 500) err.message = 'Internal Server Error';

    res.status(err.status || 500).json({ status: err.status || 500, errorID: errorID, message: err.message || 'Internal Server Error' });
});

const options = process.env.NODE_ENV === "production" ? {
    key: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev-0001/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev-0001/fullchain.pem'),
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
