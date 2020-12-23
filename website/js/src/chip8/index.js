import Chip8 from './chip8';


function initChip8(elementId) {
    const chip8 = new Chip8();
    chip8.load();
    console.log('init chip8');
    console.log(chip8);
}

module.exports = {
    initChip8,
};
