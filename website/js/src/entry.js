import React from 'react';
import ReactDOM from 'react-dom';

import About from './About';
import Patent from './Patent';
import Whisky from './Whisky';


function initAbout(elementId) {
    ReactDOM.render(
        <About />,
        document.getElementById(elementId),
    );
}


function initPatent(elementId) {
    ReactDOM.render(
        <Patent />,
        document.getElementById(elementId),
    );
}


function initWhisky(elementId) {
    ReactDOM.render(
        <Whisky />,
        document.getElementById(elementId),
    );
}

module.exports = {
    initAbout,
    initPatent,
    initWhisky,
};
