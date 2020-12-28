import $ from 'jquery';

import Chip8 from './chip8';
import Display from './display';


function initChip8(elementId) {
    const chip8 = new Chip8();
    chip8.load();
    chip8.cycle();

    const display = new Display();
    display.init('chip8-display');
    console.log('init chip8');
    console.log(chip8);
    console.log(display);

    function go() {
        if (chip8.requiresRerender) {
            display.setDisplay(chip8.displayBuffer);
            chip8.requiresRerender = false;
        }
        chip8.cycle();
    }

    $('#cycle-btn').on('click', go);

    document.addEventListener('keydown', (e) => {
        if (e.code === "Space") {
            go();
        }
    });
}

module.exports = {
    initChip8,
};
