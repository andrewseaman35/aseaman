
import $ from 'jquery';

const AUTH = require('./auth');
const CONFIG = require('./config');

const cognitoHostedUIUrl = function() {
    const deployEnv = CONFIG.LOCAL ? 'stage': CONFIG.DEPLOY_ENV;
    return `https://andrewcseaman-${deployEnv}.auth.us-east-1.amazoncognito.com/`;
}

const loginUrl = function(redirectURI) {
    return `${cognitoHostedUIUrl()}login?response_type=token&client_id=${CONFIG.CLIENT_ID}&redirect_uri=${redirectURI}`;
};

const logoutUrl = function(logoutURI) {
    return `${cognitoHostedUIUrl()}logout?client_id=${CONFIG.CLIENT_ID}&logout_uri=${logoutURI}`;
};

const navElement = function(className, item) {
    return $(`<div class="${className}" id="nav-${item.id}"><a href="${item.href}">${item.label}</a></div>`);
};

const navItem = function(item) {
    return navElement('nav-item', item);
};

const appendLoginItem = function($nav) {
    const loggedIn = AUTH.isLoggedIn();
    const redirectURI = `${CONFIG.ROOT_URL}auth_callback.html`;
    const logoutURI = `${CONFIG.ROOT_URL}logout.html`;

    const linkUrl = loggedIn ? logoutUrl(logoutURI) : loginUrl(redirectURI);
    const text = loggedIn ? 'Log out' : 'Log In';
    navItem({id: 'login', href: linkUrl, label: text}).appendTo($nav);
};

const header = function() {
    const $navRow = $('.nav-bar');
    appendLoginItem($navRow)
    $('.nav-bar').css('visibility', 'visible');
};

module.exports = header;
