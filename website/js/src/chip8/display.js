import _ from 'lodash';
import CONST from './constants';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;

const X_PIXEL_COUNT = 64;
const Y_PIXEL_COUNT = 32;


class Display {
    constructor() {
        this.pixelWidth = CANVAS_WIDTH / X_PIXEL_COUNT;
        this.pixelHeight = CANVAS_HEIGHT / Y_PIXEL_COUNT;
        this.inactiveColor = CONST.DEFAULT_INACTIVE;
        this.activeColor = CONST.DEFAULT_ACTIVE;
        this.display = null;
    }

    init(elementId) {
        this.elementId = elementId;
        const canvas = document.getElementById(this.elementId);
        console.log(canvas);

        this.renderDefault();
    }

    renderDefault() {
        this.setDisplay(_.map(CONST.DEFAULT_DISPLAY_ARRAY, Number));
    }

    refreshDisplay() {
        this.setDisplay(this.display);
    }

    setPixel(x, y, color) {
        if (x >= X_PIXEL_COUNT) {
            throw new Error('bad x draw value: ' + x);
        }
        if (y >= Y_PIXEL_COUNT) {
            throw new Error('bad y draw value: ' + y);
        }
        const canvas = document.getElementById(this.elementId);
        const context = canvas.getContext('2d');
        context.fillStyle = color;
        context.fillRect(
            x * this.pixelWidth,
            y * this.pixelHeight,
            this.pixelWidth,
            this.pixelHeight,
        );
    }

    setDisplay(display) {
        this.display = display;
        let index = 0;
        for (let y = 0; y < Y_PIXEL_COUNT; y++) {
            for (let x = 0; x < X_PIXEL_COUNT; x++) {
                this.setPixel(x, y, display[index] ? this.activeColor : this.inactiveColor);
                index += 1;
            }
        }
    }

    setActiveColor(color) {
        this.activeColor = color;
        this.refreshDisplay();
    }

    setInactiveColor(color) {
        this.inactiveColor = color;
        this.refreshDisplay();
    }
}

module.exports = Display;
