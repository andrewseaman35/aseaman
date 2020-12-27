import _ from 'lodash';


const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 512;

const X_PIXEL_COUNT = 64;
const Y_PIXEL_COUNT = 32;

const COLORS = {
    ON: '#000000',
    OFF: '#FFFFFF',
}


class Display {
    constructor() {
        this.pixelWidth = CANVAS_WIDTH / X_PIXEL_COUNT;
        this.pixelHeight = CANVAS_HEIGHT / Y_PIXEL_COUNT;
    }

    init(elementId) {
        this.elementId = elementId;
        const canvas = document.getElementById(this.elementId);
        console.log(canvas);
        this.setPixel(0, 0, COLORS.ON);
        this.setPixel(0, 2, COLORS.ON);
        this.setPixel(4, 2, COLORS.OFF);
        this.setPixel(63, 0, COLORS.OFF);
        this.setPixel(63, 31, COLORS.OFF);
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
        let index = 0;
        for (let y = 0; y < Y_PIXEL_COUNT; y++) {
            for (let x = 0; x < X_PIXEL_COUNT; x++) {
                this.setPixel(x, y, display[index] ? COLORS.ON : COLORS.OFF);
                index += 1;
            }
        }
    }
}

module.exports = Display;
