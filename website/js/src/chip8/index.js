import $ from 'jquery';

import Chip8 from './chip8';
import Display from './display';

import CONST from './constants';


function initChip8(elementId) {
    const chip8 = new Chip8();
    const display = new Display();
    display.init('chip8-display');

    let quit = false;
    let timer = 0;
    function cycle() {
        timer++;

        if (timer % 1 === 0) {
            if (chip8.requiresRerender) {
                display.setDisplay(chip8.displayBuffer);
                chip8.requiresRerender = false;
            }
            chip8.cycle();
            timer = 0;
        }

        if (!quit) {
            setTimeout(cycle, 4);
        }
    }

    $('#rom-select').on('change', function() {
        if (this.value.length) {
            quit = false;
            chip8.reset();
            display.setDisplay(chip8.displayBuffer);
            chip8.load(this.value);
            $(this).blur();
            cycle();
        } else {
            display.renderDefault();
            quit = true;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape") {
            quit = true;
        } else if (e.code in CONST.KEY_MAP) {
            chip8.handleKeyDown(CONST.KEY_MAP[e.code]);
        } else {
            console.log(e.code);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code in CONST.KEY_MAP) {
            chip8.handleKeyUp(CONST.KEY_MAP[e.code]);
        }
    });
}

module.exports = {
    initChip8,
};
