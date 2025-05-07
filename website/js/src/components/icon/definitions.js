/*
 * Definitions for SVG icon paths used by the Icon component. This is faster to load than
 * included them as individual SVG files.
 *
 * Icons obtained from https://octicons.github.com/ using the 16px size
 */

import React from 'react';

const closeX = (
    <path fillRule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path>
);

const close = (
    <>
        <path class="path-close-left" fill="#000" d="M2.8076 19.3557 19.7782 2.3852l1.4142 1.4142L4.2218 20.7699z"/>
        <path class="path-close-right" fill="#000" d="m4.2218 2.385 16.9706 16.9707-1.4142 1.4142L2.8076 3.7993z"/>
    </>
)

const pencil = (
    <path fillRule="evenodd" d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 011.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"></path>
);

const plus = (
    <path fillRule="evenodd" d="M12 9H7v5H5V9H0V7h5V2h2v5h5v2z"></path>
)

const trashcan = (
    <path fillRule="evenodd" d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"></path>
);

const caretUp = (
    <path fillRule="evenodd" d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5 5 5z"></path>
);

const caretDown = (
    <path fillRule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6l-5 5z"></path>
);

const checkmark = (
    <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
);

const share = (
    // viewbox 0 0 16 16
    <path d="M15 3a3 3 0 0 1-5.175 2.066l-3.92 2.179a2.994 2.994 0 0 1 0 1.51l3.92 2.179a3 3 0 1 1-.73 1.31l-3.92-2.178a3 3 0 1 1 0-4.133l3.92-2.178A3 3 0 1 1 15 3Zm-1.5 10a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 13.5 13Zm-9-5a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 4.5 8Zm9-5a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 13.5 3Z"></path>
)

const hamburger = (
    <>
        <g clipPath="url(#a)" fill="#000">
            <path class="path-hamburger-top" d="m.878021 3.55737h24v2h-24z"/>
            <path class="path-hamburger-middle" d="m.878021 10.7588h24v2h-24z"/>
            <path class="path-hamburger-bottom" d="m.878021 17.9603h24v2h-24z"/>
        </g>
    </>
)

module.exports = {
    caretUp,
    caretDown,
    checkmark,
    close,
    closeX,
    hamburger,
    pencil,
    plus,
    share,
    trashcan,
}
