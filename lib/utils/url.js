let request = require('request');
request = request.defaults({ jar: true });
const urljoin = require('url-join');

function toAbsoluteURL(url) {
    const serverRoot = localEnv.API_HOST || process.env.API_HOST || 'https://api.forio.com/v2';
    // EpiJS automatically adds v2 to the original request
    // Calls to the proxy may include a /v2/ which can cause issues
    // If it exists, replace it with empty string to prevent issues
    const versionPath = 'v2/';
    url = url.replace(versionPath, '');
    const fullURL = urljoin(serverRoot, url);
    return fullURL;
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
        qsStringifyOptions: {
            indices: false,
        },
    })).pipe(res);
};
