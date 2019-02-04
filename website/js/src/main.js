const $ = require('jquery');

const config = require('./config');
const loadGA = require('./ga');

const patent = require('./patent');

const modules = {
    config,
    patent,
};

loadGA(config);
for (const i in window.aseaman._js) {
    window.aseaman._js[i](modules);
}

