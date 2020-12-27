import Chip8 from './chip8';
import Display from './display';


function initChip8(elementId) {
    const chip8 = new Chip8();
    chip8.load();

    const display = new Display();
    display.init('chip8-display');
    console.log('init chip8');
    console.log(chip8);
    console.log(display);

}

module.exports = {
    initChip8,
};
