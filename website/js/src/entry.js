import React from 'react';
import ReactDOM from 'react-dom';

import Patent from './Patent';
import Whisky from './Whisky';


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
    initPatent,
    initWhisky,
};
