import $ from 'jquery';
import _ from 'lodash';

import Chip8 from './chip8';
import Display from './display';

import CONST from './constants';
import ROMS from './roms';


const ROMS_BY_ID = {};

let chip8;
let display;
let running = false;
let timer = 0;


function setupROMList() {
    $('#rom-select').append('<option selected value="">--</option>');
    $('#rom-select').append('<option value="" disabled>== Games ==</option>');
    _.each(ROMS.GAMES, (game) => {
        $('#rom-select').append(`<option value="${game.id}">${game.title}</option>`);
        ROMS_BY_ID[game.id] = game;
    });
    $('#rom-select').append('<option value="" disabled>== Programs ==</option>');
    _.each(ROMS.PROGRAMS, (program) => {
        $('#rom-select').append(`<option value="${program.id}">${program.title}</option>`);
        ROMS_BY_ID[program.id] = program;
    });
}

function initButtons() {
    $('#pause-play-btn').on('click', () => {
        const rom = ROMS_BY_ID[$('#rom-select').val()];
        if (rom) {
            if (running) {
                pause();
            } else {
                play();
            }
        }
    });
    $('#reset-btn').on('click', () => {
        const rom = ROMS_BY_ID[$('#rom-select').val()];
        if (rom) {
            resetAndLoadROM(rom);
            play();
        }
    });
}


function initChip8(elementId) {
    setupROMList();
    initButtons();

    chip8 = new Chip8();
    display = new Display();
    display.init('chip8-display');

    $('#rom-select').on('change', function() {
        $(this).blur();
        if (this.value.length) {
            const rom = ROMS_BY_ID[this.value];
            resetAndLoadROM(rom);
            setROMDescription(rom);
            play();
        } else {
            $('#chip8-description').empty();
            display.renderDefault();
            running = false;
            $('#button-container button').prop('disabled', true);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code in CONST.KEY_MAP) {
            chip8.handleKeyDown(CONST.KEY_MAP[e.code]);
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code in CONST.KEY_MAP) {
            chip8.handleKeyUp(CONST.KEY_MAP[e.code]);
        }
    });
}


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

    if (running) {
        setTimeout(cycle, 4);
    }
}


function resetAndLoadROM(rom) {
    timer = 0;
    chip8.reset();
    display.setDisplay(chip8.displayBuffer);
    chip8.load(rom.rom);
}


function pause() {
    if (running) {
        running = false;
        $('#pause-play-btn').html('Play');
    }
}

function play() {
    if (!running) {
        running = true;
        cycle();
        $('#button-container button').prop('disabled', false);
        $('#pause-play-btn').html('Pause');
    }
}

function setROMDescription(rom) {
    $('#chip8-description').empty();
    if (rom.description) {
        $('#chip8-description').append(`<p>${rom.description}</p>`);
    }
    if (rom.controls) {
        $('#chip8-description').append('<h4>Controls</h4>');
        $('#chip8-description').append('<table><tbody></tbody></table>');
        _.each(rom.controls, (c) => {
            $('#chip8-description tbody').append(`
                <tr>
                    <td>${c.key}</td>
                    <td>${c.action}</td>
                </tr>
            `);
        });
    }
    // :)
    $('.main-content').scrollTop(999999);
}


module.exports = {
    initChip8,
};
