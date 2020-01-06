const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');
const loadGA = require('./ga');

const auth = require('./auth');
const header = require('./header');

const initAbout = require('./about');
const patent = require('./patent');
const whiskyShelf = require('./whisky_shelf');

import { reactFooter } from './components';

const modules = {
    initAbout,
    auth,
    config,
    constants,
    header,
    patent,
    whiskyShelf,
    utils,
};

$(window).ready(function() {
    loadGA();
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }

    // `footer-container` is the id of the footer container defined in `base.jinja2`
    reactFooter('footer-container');
});

