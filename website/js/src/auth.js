const utils = require('./utils');
const CONST = require('./constants');

const setToken = function(token) {
    utils.setCookie('id_token', token, CONST.TOKEN_EXPIRATION_TIME);
};

const getToken = function() {
    return utils.getCookie('id_token');
};

const unsetToken = function() {
    utils.unsetCookie('id_token');
};

const setApiKey = function(key) {
    utils.setCookie('apiKey', key);
};

const unsetApiKey = function(key) {
    utils.unsetCookie('apiKey');
};

const getApiKey = function(key) {
    return utils.getCookie('apiKey');
};

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
        return false;
    }
    setToken(components.id_token);
    window.location.replace('/');
};

const logout = function() {
    unsetToken();
    window.location.replace('/');
};

module.exports = { authenticate, setToken, getToken, logout, setApiKey, getApiKey, unsetApiKey };
