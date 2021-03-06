const cookieParser = require('cookie');
const jwtdecode = require('jwt-decode');

function userFromJWT(jwt, props) {
    if (!jwt) {
        return null;
    }
    const decoded = jwtdecode(jwt);
    const userName = decoded.user_name.split('/')[0];
    return Object.assign({
        id: decoded.user_id,
        userName: userName,
        account: decoded.parent_account_id,
    }, props);
}

function userFromCookie(cookieHeader) {
    const cookies = cookieParser.parse([].concat(cookieHeader || '')[0]);
    const jwt = cookies['epicenter.token'];
    const user = userFromJWT(jwt, {
        isTeamMember: true
    });
    return user;
}

function userFromAuthHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    const jwt = authHeader.split(' ')[1];
    return userFromJWT(jwt, {});
}
function userFromEpicenterJS(cookieHeader) {
    const cookies = cookieParser.parse([].concat(cookieHeader || '')[0]);
    const contents = cookies['epicenterjs.session'];
    if (!contents) {
        return null;
    }
    const parsed = JSON.parse(contents);
    return {
        isFac: parsed.isFac,
        isTeamMember: parsed.isTeamMember,
        id: parsed.userId,
        userName: parsed.userName,
        groupId: parsed.groupId,
        account: parsed.account,
    };
}

module.exports = function addUserMiddleware(req, res, next) {
    const cookieheader = req.headers.cookie;
    const user = req.user || userFromEpicenterJS(cookieheader) || userFromAuthHeader(req.headers.authorization) || userFromCookie(cookieheader);
    if (!user && req.url.indexOf('authentication') === -1) {
        return res.status(401).json({
            message: 'No authentication found, please log in',
            context: {
                url: req.url
            }
        });
    }
    req.user = user;
    next();  
};
