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

        this.legacyShift = false;

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

    log(s) {
        console.log(s);
    }

    load() {
        const rom = ROMS.bc_test;
        for (let i = 0; i < rom.length; i++) {
            this.memory[CONST.INTERPRETER_SIZE + 2 * i] = rom[i] >> 8;
            this.memory[CONST.INTERPRETER_SIZE + 2 * i + 1] = rom[i] & 0x00ff;
        }
        console.log('Loaded ROM');
    }

    cycle() {
        this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
        this.log(`OPCODE: ${this.opcode}`);

        switch (this.opcode & 0xF000) {
            case 0x0000:
                switch (this.opcode & 0x00FF) {
                    case 0x00E0:
                        // 00E0 - CLS
                        // Clear the display.
                        this.log(`-- 00E0 Clear display`);
                        this.clearDisplay();
                        this.pc += 2;
                        break;
                    case 0x00EE:
                        // 00EE - RET
                        // Return from a subroutine.
                        this.log(`-- 00EE Return from subroutine`);
                        this.pc = this.stack[--this.sp];
                        this.pc += 2;
                        break;
                    // case 0x00C0: (super chip-48)
                    //     this.log(`-- 00Cn - SCD nibble`);
                    // case 0x00F0:
                    //     this.log(`-- 00F0`);
                    default:
                        throw new Error(`unhandled ${this.opcode}`);
                }
                break;
            case 0x1000:
                // 1nnn - JP addr
                // Jump to location nnn.
                this.pc = this.opcode & 0x0FFF;
                this.log(`-- 1nnn Jump to location: ${this.pc.toString(16)}`);
                break;
            case 0x2000:
                // 2nnn - CALL addr
                // Call subroutine at nnn.
                this.stack[this.sp++] = this.pc;
                this.pc = this.opcode & 0x0FFF;
                this.log(` -- 2nnn Add to stack: ${this.pc.toString(16)}`);
                break;
            case 0x3000:
                // 3xkk - SE Vx, byte
                // Skip next instruction if Vx = kk.
                this.pc += this.V[(this.opcode & 0x0F00) >> 8] === (this.opcode & 0x00FF) ? 4 : 2;
                this.log(" -- 3xkk Skip next if Vx == kk");
                break;
            case 0x4000:
                // 4xkk - SNE Vx, byte
                // Skip next instruction if Vx != kk.
                this.pc += this.V[(this.opcode & 0x0F00) >> 8] !== (this.opcode & 0x00FF) ? 4 : 2;
                this.log(" -- 4xkk Skip next if Vx != kk");
                break;
            case 0x5000:
                // 5xy0 - SE Vx, Vy
                // Skip next instruction if Vx = Vy.
                this.pc += this.V[(this.opcode & 0x0F00) >> 8] == this.V[(this.opcode & 0x00F0) >> 4] ? 4 : 2;
                this.log(" -- 5xy0 Skip if Vx = Vy");
                break;
            case 0x6000:
                // 6xkk - LD Vx, byte
                // Set Vx = kk.
                this.V[(this.opcode & 0x0F00) >> 8] = (this.opcode & 0x00FF);
                this.log(" -- 6xkk Set Vx = kk");
                this.pc += 2;
                break;
            case 0x7000:
                // 7xkk - ADD Vx, byte
                // Set Vx = Vx + kk.
                this.log(" -- 7xkk");
                console.log(this.V)
                console.log(this.opcode.toString(16));
                console.log((this.opcode & 0x0F00).toString(16));
                console.log(((this.opcode & 0x0F00) >> 8).toString(16));
                console.log((this.V[(this.opcode & 0x0F00) >> 8]).toString(16));
                console.log((this.opcode & 0x00FF).toString(16));
                this.V[(this.opcode & 0x0F00) >> 8] = (this.V[(this.opcode & 0x0F00) >> 8] + (this.opcode & 0x00FF)) % 256;
                console.log((this.V[(this.opcode & 0x0F00) >> 8]).toString(16));
                console.log(this.V)

                this.pc += 2;
                break;
            case 0x8000:
                console.log(`0x8000 OPCODE: ${this.opcode}`)
                switch(this.opcode & 0x000F) {
                    case 0x0000:
                        // 8xy0 - LD Vx, Vy
                        // Set Vx = Vy.
                        this.log(" -- 8xy0");
                        this.V[(this.opcode & 0x0F00) >> 8] = this.V[(this.opcode & 0x00F0) >> 4];
                        this.pc += 2;
                        break;
                    case 0x0001:
                        // 8xy1 - OR Vx, Vy
                        // Set Vx = Vx OR Vy.
                        this.log(" -- 8xy1");
                        this.V[(this.opcode & 0x0F00) >> 8] |= this.V[(this.opcode & 0x00F0) >> 4];
                        this.pc += 2;
                        break;
                    case 0x0002:
                        // 8xy2 - AND Vx, Vy
                        // Set Vx = Vx AND Vy.
                        this.log(" -- 8xy2");
                        this.V[(this.opcode & 0x0F00) >> 8] &= this.V[(this.opcode & 0x00F0) >> 4];
                        this.pc += 2;
                        break;
                    case 0x0003:
                        // 8xy3 - OR Vx, Vy
                        // Set Vx = Vx XOR Vy.
                        this.log(" -- 8xy3");
                        this.V[(this.opcode & 0x0F00) >> 8] ^= this.V[(this.opcode & 0x00F0) >> 4];
                        this.pc += 2;
                        break;
                    case 0x0004:
                        // 8xy4 - ADD Vx, Vy
                        // Set Vx = Vx + Vy, set VF = carry.
                        this.log(" -- 8xy4");
                        this.V[0xF] = (this.V[(this.opcode & 0x0F00) >> 8] + this.V[(this.opcode & 0x00F0) >> 4]) > 0xFF ? 1 : 0;
                        this.V[(this.opcode & 0x0F00) >> 8] = (this.V[(this.opcode & 0x0F00) >> 8] + this.V[(this.opcode & 0x00F0) >> 4]) % 256;
                        this.pc += 2;
                        break;
                    case 0x0005:
                        // 8xy5 - SUB Vx, Vy
                        // Set Vx = Vx - Vy, set VF = NOT borrow.
                        this.log(" -- 8xy5");
                        console.log(this.V);
                        // if Vx > Vy, no borrow necessary, VF = 1
                        this.V[0xF] = this.V[(this.opcode & 0x0F00) >> 8] > this.V[(this.opcode & 0x00F0) >> 4] ? 1 : 0;
                        this.V[(this.opcode & 0x0F00) >> 8] -= this.V[(this.opcode & 0x00F0) >> 4];
                        if (this.V[(this.opcode & 0x0F00) >> 8] < 0) {
                            this.V[(this.opcode & 0x0F00) >> 8] += 256;
                        }
                        this.pc += 2;
                        console.log(this.V);

                        break;
                    case 0x0006:
                        // 8xy6 - SHR Vx {, Vy}
                        // Set Vx = Vy SHR 1.
                        this.log(" -- 8xy6");

                        // If the least-significant bit of Vy is 1, then VF is set to 1, otherwise 0.
                        console.log(this.V);
                        if (this.legacyShift) {
                            this.V[0xF] = this.V[(this.opcode & 0x00F0) >> 4] & 0x1;
                            this.V[(this.opcode & 0x0F00) >> 8] = this.V[(this.opcode & 0x00F0) >> 4] >> 1;
                        } else {
                            this.V[0xF] = this.V[(this.opcode & 0x0F00) >> 8] & 0x1;
                            this.V[(this.opcode & 0x0F00) >> 8] >>= 1;
                        }
                        console.log(this.V);
                        this.pc += 2;
                        break;
                    case 0x0007:
                        // 8xy7 - SUBN Vy, Vy
                        // Set Vx = Vy - Vx, set VF = NOT borrow.
                        this.log(" -- 8xy7");

                        // if Vy > Vx, no borrow necessary, VF = 1
                        this.V[0xF] = this.V[(this.opcode & 0x00F0) >> 4] > this.V[(this.opcode & 0x0F00) >> 8] ? 1 : 0;
                        this.V[(this.opcode & 0x0F00) >> 8] = this.V[(this.opcode & 0x00F0) >> 4] - this.V[(this.opcode & 0x0F00) >> 8];
                        if (this.V[(this.opcode & 0x0F00) >> 8] < 0) {
                            this.V[(this.opcode & 0x0F00) >> 8] += 256;
                        }
                        this.pc += 2;
                        break;
                    case 0x000E:
                        // 8xyE - SHL Vx {, Vy}
                        // Set Vx = Vy SHL 1.
                        // If the most-significant bit of Vy is 1, then VF is set to 1, otherwise to 0.
                        this.log(" -- 8xyE");
                        console.log(this.V)
                        if (this.legacyShift) {
                            this.V[0xF] = this.V[(this.opcode & 0x00F0) >> 4] >> 7;
                            this.V[(this.opcode & 0x0F00) >> 8] = (this.V[(this.opcode & 0x00F0) >> 4] << 1) % 256;
                        } else {
                            this.V[0xF] = this.V[(this.opcode & 0x0F00) >> 8] >> 7;
                            this.V[(this.opcode & 0x0F00) >> 8] = (this.V[(this.opcode & 0x0F00) >> 8] << 1) % 256;
                        }
                        this.pc += 2;
                        console.log(this.V)
                        break;
                    default:
                        throw new Error(`unhandled ${this.opcode}`);
                }
                break;
            case 0x9000:
                // 9xy0 - SNE Vx, Vy
                // Skip next instruction if Vx != Vy.
                this.log(" -- 9xy0");
                this.pc += (this.V[(this.opcode & 0x0F00) >> 8] !== this.V[(this.opcode & 0x00F0) >> 4]) ? 4 : 2;
                break;
            case 0xA000:
                // Annn - LD I, addr
                // Set I = nnn.
                this.log(" -- Annn");
                this.I = this.opcode & 0x0FFF;
                this.pc += 2;
                break;
            case 0xB000:
                // Bnnn - JP V0, addr
                // Jump to location nnn + V0.
                this.log(" -- Bnnn");
                this.pc = (this.opcode & 0x0FFF) + this.V[0];
                break;
            case 0xC000:
                // Cxkk - RND Vx, byte
                // Set Vx = random byte AND kk.
                this.log(" -- Cxkk");
                this.V[(this.opcode & 0x0F00) >> 8] = (Math.floor(Math.random() * Math.floor(256))) & (this.opcode & 0x00FF);
                this.pc += 2;
                break;
            case 0xD000:
            {
                // Dxyn - DRW Vx, Vy, nibble
                // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
                this.log(" -- Dxyn");
                const xStart = this.V[(this.opcode & 0x0F00) >> 8];
                const yStart = this.V[(this.opcode & 0x00F0) >> 4];
                const height = this.opcode & 0x000F;

                // If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0.
                this.V[0xF] = 0;

                let pos;
                let val;
                for (let y = 0; y < height; y++) {
                    // The interpreter reads n bytes from memory, starting at the address stored in I
                    val = this.memory[this.I + y];
                    for (let x = 0; x < 8; x++) {
                        if((val & (0x80 >> x)) != 0) {
                            pos = (xStart + x + ((yStart + y) * CONST.DISPLAY_WIDTH));
                            if (this.displayBuffer[pos] == 1) {
                                // If this causes any pixels to be erased, VF is set to 1
                                this.V[0xF] = 1;
                            }

                            // Sprites are XORed onto the existing screen
                            this.displayBuffer[pos] ^= 1;
                        }
                    }
                }
                this.requiresRerender = true;
                this.pc += 2;

                // this->printDisplay();
                break;
            }
            case 0xE000:
                switch(this.opcode & 0x00FF) {
                    case 0x009E:
                    {
                        // Ex9E - SKP Vx
                        // Skip next instruction if key with the value of Vx is pressed.
                        this.log(" -- Ex9E");
                        // cout << "  Looking for : " << to_string(V[(opcode & 0x0F00) >> 8]) << endl;;
                        this.pc += this.keypad[this.V[(this.opcode & 0x0F00) >> 8]] == 1 ? 4 : 2;
                        break;
                    }
                    case 0x00A1:
                    {

                        // ExA1 - SKNP Vx
                        // Skip next instruction if key with the value of Vx is not pressed.
                        this.log(" -- ExA1");
                        // cout << "  Looking for : " << to_string(V[(opcode & 0x0F00) >> 8]) << endl;;
                        this.pc += this.keypad[this.V[(this.opcode & 0x0F00) >> 8]] == 0 ? 4 : 2;
                        break;
                    }
                }
                break;
            case 0xF000:
                switch(this.opcode & 0x00FF) {
                    case 0x0007:
                        // Fx07 - LD Vx, DT
                        // Set Vx = delay timer value.
                        this.log(" -- Fx07");
                        this.V[(this.opcode & 0x0F00) >> 8] = this.delayTimer;
                        this.pc += 2;
                        break;
                    case 0x000A:
                        // Fx0A - LD Vx, K
                        // Wait for a key press, store the value of the key in Vx.

                        // When awaiting a press, `registerAwaitingKeyPress` will hold the
                        // register index that needs the press. We'll capture this when
                        // handling the key press in `handleKeyDown`.
                        this.log(" -- Fx0A");
                        this.registerAwaitingKeyPress = ((this.opcode & 0x0F00) >> 8);
                        this.log("Awaiting key press: " + this.registerAwaitingKeyPress);
                        break;
                    case 0x0015:
                        // Fx15: - LD DT, Vx
                        // Set delay timer = Vx.
                        this.delayTimer = this.V[(this.opcode & 0x0F00) >> 8];
                        this.log(" -- Fx15 Set delay timer to " + this.delayTimer);
                        this.pc += 2;
                        break;
                    case 0x0018:
                        // Fx18 - LD ST, Vx
                        // Set sound timer = Vx.
                        this.log(" -- Fx18");
                        this.soundTimer = this.V[(this.opcode & 0x0F00) >> 8];
                        this.pc += 2;
                        break;
                    case 0x001E:
                        // Fx1E - ADD I, Vx
                        // Set I = I + Vx.
                        this.log(" -- Fx1E");
                        this.I += this.V[(this.opcode & 0x0F00) >> 8];
                        this.pc += 2;
                        break;
                    case 0x0029:
                        // Fx29 - LD F, Vx
                        // Set I = location of sprite for digit Vx.
                        // The fontset is loaded as first 80 bytes, each represented
                        // value is 5 bytes long, meaning that "1" is bytes 0-4,
                        // "2" is bytes 5-9 and so on.
                        this.log(" -- Fx29");
                        this.I = this.V[(this.opcode & 0x0F00) >> 8] * 0x5;
                        this.pc += 2;
                        break;
                    // case 0x0030: (super chip-48)
                        // Fx30 - LD HF, Vx
                    case 0x0033:
                        // Fx33 - LD B, Vx
                        // Store BCD representation of Vx in memory locations I, I+1, and I+2.
                        {
                            this.log(" -- Fx33");
                            this.log(this.opcode.toString(16));
                            let vx = this.V[(this.opcode & 0x0F00) >> 8];
                            this.log(this.V);
                            this.log(vx);
                            this.log(vx / 100);
                            this.log((vx / 10) % 10);
                            this.log(vx % 10);
                            this.memory[this.I] = Math.floor(vx / 100);
                            this.memory[this.I + 1] = Math.floor(vx / 10) % 10;
                            this.memory[this.I + 2] = vx % 10;

                            this.log("  VX: " + vx);
                            this.log(`  Stored BCD: ${this.memory[this.I]} ${this.memory[this.I + 1]} ${this.memory[this.I + 2]}`);
                            this.pc += 2;
                            break;
                        }
                    case 0x0055:
                        // Fx55 - LD [I], Vx
                        // Store registers V0 through Vx in memory starting at location I.
                        {
                            this.log(" -- Fx5");
                            let endX = (this.opcode & 0x0F00) >> 8;
                            for (let i = 0; i <= endX; i++) {
                                this.memory[this.I + i] = this.V[i];
                            }
                            this.pc += 2;
                            break;
                        }
                    case 0x0065:
                        // Fx65 - LD Vx, [I]
                        // Read registers V0 through Vx from memory starting at location I.
                        {
                            this.log(" -- Fx6");
                            let endX = (this.opcode & 0x0F00) >> 8;
                            for (let i = 0; i <= endX; i++) {
                                this.V[i] = this.memory[this.I + i];
                            }
                            this.pc += 2;
                            break;
                        }

                    // case 0x0075: (super chip-48)
                        // Fx75 - LD R, Vx
                    // case 0x85: (super chip-48)
                        // Fx85 - LD Vx, R
                    default:
                        throw new Error(`unhandled ${this.opcode}`);
                }
                break;
            default:
                throw new Error(`unhandled ${this.opcode}`);
        }
    }
}

module.exports = Chip8;
