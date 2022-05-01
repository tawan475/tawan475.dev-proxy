const ipaddr = require("ipaddr.js");
const cloudflareIP = require('@tawan475/cloudflareip');
const cfIP = new cloudflareIP();

module.exports = (req, res, next) => {
    if (req.headers['cf-connecting-ip'] && cfIP.isCloudflareIP(req)) {
        let realIP = ipaddr.process(req.headers['cf-connecting-ip']);
        let cloudflareip = ipaddr.process(req.socket.remoteAddress);

        req.headers['from-cloudflare'] = true;
        req.headers['cloudflare-ip'] = cloudflareip;

        req.cloudflareip = cloudflareip.toString();
        req.cloudflareipver = cloudflareip.kind();

        req.trustedip = realIP.toString();
        req.trustedipver = realIP.kind();

        req.cloudflare = true;
    } else {
        let ip = ipaddr.process(req.socket.remoteAddress);
        req.trustedip = ip.toString();
        req.trustedipver = ip.kind();
    }

    next();
}