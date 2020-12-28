import $ from 'jquery';
import _ from 'lodash';

import Chip8 from './chip8';
import Display from './display';

import CONST from './constants';
import ROMS from './roms';


function initChip8(elementId) {
    const chip8 = new Chip8();
    const display = new Display();
    display.init('chip8-display');
    console.log(ROMS);
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
            const rom = ROMS[this.value];
            quit = false;
            chip8.reset();
            display.setDisplay(chip8.displayBuffer);
            chip8.load(rom.rom);
            if (rom) {
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
            } else {
                $('#chip8-description').empty();
            }
            $(this).blur();

            // :)
            $('.main-content').scrollTop(999999);

            cycle();
        } else {
            $('#chip8-description').empty();
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
