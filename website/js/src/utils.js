import CONFIG from './config';

function getAPIUrl(path) {
    if (CONFIG.LOCAL) {
        return `http://0.0.0.0:8099/${path}`;
    }
    return `https://${CONFIG.API_URL}/v1/test/${path}`;
}

function setCookie(name, value, expiration) {
    // Sets a cookie. Expiration in seconds.
    var expires = '';
    if (expiration) {
        var date = new Date();
        date.setTime(date.getTime() + (expiration * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function unsetCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function getCookie(name) {
    var nameEQ = name + '=';
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

function getImageSrc(path) {
    return CONFIG.PUBLIC_BUCKET_URL + 'aseaman/' + path;
}

module.exports = {
    getAPIUrl,
    setCookie,
    getCookie,
    getImageSrc,
    unsetCookie,
};
