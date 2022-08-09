const express = require('express');
const cloudflareIpProcessor = require('../libs/cloudflareIpProcessor');
const logger = require('../libs/logger');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "https://tawan475.dev");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('X-Powered-By', 'tawan475');

        if (req.socket.localAddress !== req.socket.remoteAddress) {
            if (!req.subdomains.length && req.headers.host != 'tawan475.dev') {
                return res.redirect(301, 'https://tawan475.dev' + req.url);
            }

            if (!req.secure) {
                return res.redirect(301, 'https://' + req.headers.host + req.url);
            }

            if (req.get('host').indexOf('www.') === 0 && (req.method === "GET" && !req.xhr)) {
                return res.redirect(req.protocol + '://' + req.get('host').substring(4) + req.originalUrl);
            }
        };

        req.domain = req.hostname.split('.').slice(-2).join('.');

        next()
    })

    app.use(cloudflareIpProcessor)
    app.use(logger)
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
}