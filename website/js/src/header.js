
const $ = require('jquery');

const AUTH = require('./auth');
const CONSTANTS = require('./constants');
const CONFIG = require('./config');

const loginUrl = function(redirectURI) {
    return `${CONSTANTS.LOGIN_DOMAIN}login?response_type=token&client_id=${CONFIG.CLIENT_ID}&redirect_uri=${redirectURI}`;
};

const logoutUrl = function(logoutURI) {
    return `${CONSTANTS.LOGIN_DOMAIN}logout?client_id=${CONFIG.CLIENT_ID}&logout_uri=${logoutURI}`;
};

const initLogin = function() {
    const loggedIn = AUTH.getToken() !== null;
    const linkElements = document.getElementsByClassName('log-in-link');
    const redirectURI = `${CONFIG.ROOT_URL}auth_callback.html`;
    const logoutURI = `${CONFIG.ROOT_URL}logout.html`;

    const linkUrl = loggedIn ? logoutUrl(logoutURI) : loginUrl(redirectURI);
    for (let i = 0; i < linkElements.length; i++) {
        linkElements[i].href = linkUrl;
        linkElements[i].text = loggedIn ? 'Log out' : 'Log In';
    }
};

const header = function() {
    initLogin();

    const navId = '#nav-' + document.body.id;
    const navItem = document.querySelector(navId);
    if (navItem) navItem.parentNode.removeChild(navItem);
    document.querySelector('.nav-bar').style.visibility = 'visible';
};

module.exports = header;
