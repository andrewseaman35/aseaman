
import $ from 'jquery';

const AUTH = require('./auth');
const CONSTANTS = require('./constants');
const CONFIG = require('./config');


const loginUrl = function(redirectURI) {
    return `${CONSTANTS.LOGIN_DOMAIN}login?response_type=token&client_id=${CONFIG.CLIENT_ID}&redirect_uri=${redirectURI}`;
};

const logoutUrl = function(logoutURI) {
    return `${CONSTANTS.LOGIN_DOMAIN}logout?client_id=${CONFIG.CLIENT_ID}&logout_uri=${logoutURI}`;
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
