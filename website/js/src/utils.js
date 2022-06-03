import $ from 'jquery';

import CONFIG from './config';
import CONSTANTS from './constants';

function getAPIUrl(path) {
    if (CONFIG.LOCAL) {
        return `http://0.0.0.0:8099/${path}/`;
    }
    return `https://${CONFIG.API_URL}/${path}/`;
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

function setQueryStringParameter(key, value) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set(key, value);
    history.replaceState(null, null, '?'+queryParams.toString());
}

function getImageSrc(path) {
    return CONFIG.PUBLIC_BUCKET_URL + 'aseaman/' + path;
}

function getUrlTo(path) {
    return CONFIG.ROOT_URL + path;
}

function isMobile() {
    return $(window).width() < CONSTANTS.SCREEN_SMALL_WIDTH_MAX;
}

function zeroPad(num, places) {
    return String(num).padStart(places, '0')
}

function toReadableDateTime(secondsTimestamp) {
    const mod = new Date(secondsTimestamp * 1000);
    const month = zeroPad(mod.getMonth() + 1, 2);
    const day = zeroPad(mod.getDate(), 2);
    const year = mod.getFullYear();
    const hour = zeroPad(mod.getHours(), 2);
    const minute = zeroPad(mod.getMinutes(), 2);
    const second = zeroPad(mod.getSeconds(), 2);
    return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
}


function toReadableDate(secondsTimestamp) {
    const mod = new Date(secondsTimestamp * 1000);
    const month = zeroPad(mod.getMonth() + 1, 2);
    const day = zeroPad(mod.getDate(), 2);
    const year = mod.getFullYear();
    return `${month}/${day}/${year}`;
}


const KEY_CODE = {
    ESCAPE: 'Escape',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
};


module.exports = {
    KEY_CODE,
    isMobile,
    getAPIUrl,
    setCookie,
    getCookie,
    getImageSrc,
    getUrlTo,
    unsetCookie,
    setQueryStringParameter,
    toReadableDate,
    toReadableDateTime,
};
