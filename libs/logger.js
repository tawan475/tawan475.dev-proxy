const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
    let startTime = process.hrtime.bigint();
    // [1648570997477] o:direct code:200 cloudflare(172.70.35.13) 34.74.204.144 GET:https://tawan475.dev/ 123 ms 

    let log = '';
    log += `[${Date.now()}] `; // add time
    log += `o:${req.get('origin') || "direct"} `; // add origin of the request
    // add status code
    log += `code:${res.statusCode} `;

    // add cloudflare if exist
    if (req.cloudflare) {
        let cfip = req.cloudflareip.padEnd(req.cloudflareipver === 'ipv6' ? 39 : 15);
        let loglength = (req.cloudflareipver === 'ipv6') ? (39 + 12) : (15 + 12);
        log += `cloudflare(${cfip}) `.padEnd(loglength + 1);
    }
    // add ip
    let iplength = req.trustedipver === 'ipv6' ? 39 : 15;
    log += `${req.trustedip} `.padEnd(iplength + 1);

    // add method
    log += `${req.method}`.padStart(4);
    log += `:`;

    // add protocol
    log += req.protocol + "://";
    // add domain
    log += req.get('host');

    // add url
    log += req.url;

    res.on('close', () => {
        const timeTook = Number((process.hrtime.bigint() - startTime) / (1000n * 1000n)) + " ms";
        // add time took to log string
        log += ` ${timeTook}`;
        console.log(log);
        fs.appendFile(path.join(req.app.dirname, "./request_logs.log"), log + "\r\n", (err) => {
            if (err) console.log(err)
        });
    })

    next();
}