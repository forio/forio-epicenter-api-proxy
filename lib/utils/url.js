let request = require('request');
request = request.defaults({jar: true});

function toAbsoluteURL(url) {
    const serverRoot = 'api.forio.com/v2';
    const fullURL = `${serverRoot}/${url}`.replace(/\/{1,}/g, '/');
    return `https://${fullURL}`;    
}

exports.fetchFromAPI = function fetchFromAPI(req, url, options, cb) {
    const headers = Object.assign(req.headers);
    delete headers['accept-encoding'];
    delete headers['content-length'];
    delete headers.host;

    request(Object.assign({}, {
        method: 'GET',
        url: toAbsoluteURL(url),
        gzip: false,
        json: true,
        headers: headers
    }, options), cb);
};

exports.pipeRequest = function pipeRequest(req, res, url) {
    req.pipe(request({
        url: toAbsoluteURL(url),
        qs: req.query,
    })).pipe(res);
};