const utils = require('./utils');
const CONST = require('./constants');

const setToken = function(token, expiry) {
    utils.setCookie('id_token', token, expiry);
};

const getToken = function() {
    return utils.getCookie('id_token');
};

const unsetToken = function() {
    utils.unsetCookie('id_token');
};

const setUser = function(user, expiry) {
    utils.setCookie('user', user, expiry);
}

const getUser = function() {
    return utils.getCookie('user');
}

const unsetUser = function() {
    utils.unsetCookie('user');
}

const setGroups = function(groups, expiry) {
    utils.setCookie('groups', groups.join(','), expiry);
}

const getGroups = function() {
    return (utils.getCookie('groups') || '').split(',');
}

const unsetGroups = function() {
    utils.unsetCookie('groups');
}

const extractAuthComponents = function(authUrl) {
    const splitPath = authUrl.split('#');
    if (splitPath.length !== 2) {
        return null;
    }
    const queryString = splitPath[1];
    const query = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;

};

const authenticate = function() {
    const url = window.location.href;
    const components = extractAuthComponents(url);
    if (!components) {
        window.location.replace('/');
    }
    setToken(components.id_token, components.expires_in);

    const parsedJwt = parseJwt(components.id_token);
    setUser(parsedJwt['cognito:username'])
    setGroups(parsedJwt['cognito:groups'] || [])
    window.location.replace('/');
};

const logout = function() {
    unsetToken();
    unsetUser();
    unsetGroups();
    window.location.replace('/');
};

const isLoggedIn = function() {
    return getToken() !== null;
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

module.exports = {
    authenticate,
    isLoggedIn,
    logout,
    getUser,
    setUser,
    getToken,
    setToken,
 };
