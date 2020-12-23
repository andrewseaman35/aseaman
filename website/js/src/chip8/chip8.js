import _ from 'lodash';

import CONST from './constants';
import ROMS from './roms';

window._ = _;


const STACK_SIZE = 16;
const NUM_REGISTERS = 16;
const KEYPAD_SIZE = 16;
const MEMORY_SIZE = 4096;

const chip8Fontset = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];


class Chip8 {
    constructor() {
        this.opcode = 0;
        this.I = 0;
        this.sp = 0;
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.pc = CONST.INTERPRETER_SIZE;

        this.registerAwaitingKeyPress = -1;
        this.lastProcessorCycleMS = -1;
        this.lastTimerCycleMS = -1;

        this.clearDisplay();
        this.clearStack();
        this.clearRegisters();
        this.clearKeypad();

        this.initMemory();

        console.log('Chip8 Initialized');
    }

    clearDisplay() {
        this.displayBuffer = _.times((CONST.DISPLAY_WIDTH * CONST.DISPLAY_HEIGHT), () => 0);
    }

    clearStack() {
        this.stack = _.times(STACK_SIZE, () => 0);
    }

    clearRegisters() {
        this.V = _.times(NUM_REGISTERS, () => 0);
    }

    clearKeypad() {
        this.keypad = _.times(KEYPAD_SIZE, () => 0);
    }

    initMemory() {
        this.memory = _.times(MEMORY_SIZE, () => 0);
        _.each(chip8Fontset, (b, i) => {
            this.memory[i] = b;
        });
    }

    load() {
        _.each(ROMS.testopcode, (b, i) => {
            this.memory[CONST.INTERPRETER_SIZE + i] = b;
        });
        console.log('Loaded ROM');
    }
}

module.exports = Chip8;
