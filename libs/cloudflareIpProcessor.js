const ipaddr = require("ipaddr.js");
const cloudflareIP = require('@tawan475/cloudflareip');
const cfIP = new cloudflareIP();

module.exports = (req, res, next) => {
    let forwardedFor = req.headers['x-forwarded-for'].split(',');
    req.headers['cloudflare-ip'] = forwardedFor[1].trim();

    if (req.headers['cf-connecting-ip'] && cfIP.isCloudflareIP( req.headers['cloudflare-ip'] )) {
        let realIP = ipaddr.process(req.headers['cf-connecting-ip']);
        let cloudflareip = ipaddr.process(req.headers['cloudflare-ip']);

        req.headers['from-cloudflare'] = true;
        req.headers['cloudflare-ip'] = cloudflareip;

        req.cloudflareip = cloudflareip.toString();
        req.cloudflareipver = cloudflareip.kind();

        req.trustedip = realIP.toString();
        req.trustedipver = realIP.kind();

        req.cloudflare = true;
    } else {
        let ip = ipaddr.process(forwardedFor[0].trim());
        req.trustedip = ip.toString();
        req.trustedipver = ip.kind();
    }
    next();
}
