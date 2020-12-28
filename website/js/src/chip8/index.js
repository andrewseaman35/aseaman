import $ from 'jquery';

import Chip8 from './chip8';
import Display from './display';



function initChip8(elementId) {
    const chip8 = new Chip8();
    chip8.load('pong');
    chip8.cycle();

    const display = new Display();
    display.init('chip8-display');
    console.log('init chip8');
    console.log(chip8);
    console.log(display);

    let quit = false;
    function go() {
        if (chip8.requiresRerender) {
            display.setDisplay(chip8.displayBuffer);
            chip8.requiresRerender = false;
        }
        chip8.cycle();
    }

    let timer = 0;
    function cycle() {
        timer++;

        if (timer % 2 === 0) {
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

    document.addEventListener('keydown', (e) => {
        if (e.code === "Space") {
            go();
        } else if (e.code === "Escape") {
            quit = true;
        } else if (e.code in chip8.keyMap) {
            chip8.handleKeyDown(e.code);
        } else {
            console.log(e.code);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code in chip8.keyMap) {
            chip8.handleKeyUp(e.code);
        }
    });

    cycle();
}

module.exports = {
    initChip8,
};
