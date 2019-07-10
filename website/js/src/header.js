
const $ = require('jquery');

const AUTH = require('./auth');
const CONSTANTS = require('./constants');
const CONFIG = require('./config');

const NAV_STRUCTURE = [
    { id: 'index', label: 'Home', href: 'index.html', items: [] },
    { id: 'about', label: 'About', href: 'about.html', items: [
        { id: 'pipeline', label: 'pipeline', href: 'pipeline.html' },
    ]},
    { id: 'patent', label: 'Patent', href: 'patent.html', items: [] },
];

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

const nestedNavItem = function(item) {
    return navElement('nested-nav-item', item);
};

const appendLoginItem = function($nav) {
    const loggedIn = AUTH.getToken() !== null;
    const redirectURI = `${CONFIG.ROOT_URL}auth_callback.html`;
    const logoutURI = `${CONFIG.ROOT_URL}logout.html`;

    const linkUrl = loggedIn ? logoutUrl(logoutURI) : loginUrl(redirectURI);
    const text = loggedIn ? 'Log out' : 'Log In';
    navItem({id: 'login', href: linkUrl, label: text}).appendTo($nav);
};

const header = function() {
    const $navRow = $('.nav-bar');
    NAV_STRUCTURE.forEach(function(item) {
        const $navItem = navItem(item);
        if (item.items.length > 0) {
            const $nestedNav = $('<div class="nested-nav"></div>');
            item.items.forEach(function(nestedItem) {
                nestedNavItem(nestedItem).appendTo($nestedNav);
            });
            $nestedNav.appendTo($navItem);
        }
        $navItem.appendTo($navRow);
    });
    appendLoginItem($navRow);
    $('.nav-bar').css('visibility', 'visible');
};

module.exports = header;