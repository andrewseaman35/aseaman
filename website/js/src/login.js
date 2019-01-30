const $ = require('jquery');

const CONSTANTS = require('./constants');
const CONFIG = require('./config');

const initLogin = function() {
    const redirectURI = `${CONFIG.ROOT_URL}oauth_callback.html`;
    const loginUrl = `${CONSTANTS.LOGIN_DOMAIN}login?response_type=token&client_id=${CONFIG.CLIENT_ID}&redirect_uri=${redirectURI}`;
    const linkElements = document.getElementsByClassName('log-in-link');
    for (let i = 0; i < linkElements.length; i++) {
        linkElements[i].href = loginUrl;
    }
};

module.exports = initLogin;
