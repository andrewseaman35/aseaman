const MEMORY_SIZE = 4096;
const INTERPRETER_SIZE = 512;

const COLORS = {
    INACTIVE: {
        black: '#000000',
        coffee: '#433A3F',
        'dark purple': '#370926',
        indigo: '#1B4965',
        liver: '#DDF8E8',
        mauve: '#5D2E46',
        purple: '#42113C',
        space: '#3D5A6C',
        umber: '#60594D',
        violet: '#513B56',
    },
    ACTIVE: {
        aquamarine: '#5DD39E',
        copper: '#AD6A6C',
        coral: '#FF8966',
        cyan: '#00FFFF',
        eggshell: '#F8F4E3',
        flame: '#EB6534',
        gray: '#757780',
        grullo: '#9C9583',
        honeydew: '#DDF8E8',
        lavender: '#E1E5F2',
        'light blue': '#BEE9E8',
        lilac: '#B08EA2',
        redwood: '#AD5D4E',
        white: '#FFFFFF',
        'yellow green': '#98CE00',
    }
};
const DEFAULT_INACTIVE = COLORS.INACTIVE.black;
const DEFAULT_ACTIVE = COLORS.ACTIVE.cyan;

const DISPLAY_WIDTH = 64;
const DISPLAY_HEIGHT = 32;

// Dimensions of the native window
const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 512;

// For SDL_PIXELFORMAT_RGBA8888
const PIXEL_COLOR = 0x00FFFF00;
const PIXEL_ALPHA = 0x000000FF;

const MICROSECOND_DELAY = 1600;

const KEY_MAP = {
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3,
    KeyQ: 4,
    KeyW: 5,
    KeyE: 6,
    KeyR: 7,
    KeyA: 8,
    KeyS: 9,
    KeyD: 10,
    KeyF: 11,
    KeyZ: 12,
    KeyX: 13,
    KeyC: 14,
    KeyV: 15,
};

const DEFAULT_DISPLAY_STR =
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000111100001100001100111111001111110000000000000011110000000' +
    '0000000111100001100001100111111001111110000000000000011110000000' +
    '0000011000011001100001100001100001100001100000000001100001100000' +
    '0000011000011001100001100001100001100001100000000001100001100000' +
    '0000011000000001111111100001100001111110000111111000011110000000' +
    '0000011000000001111111100001100001111110000111111000011110000000' +
    '0000011000011001100001100001100001100000000000000001100001100000' +
    '0000011000011001100001100001100001100000000000000001100001100000' +
    '0000000111100001100001100111111001100000000000000000011110000000' +
    '0000000111100001100001100111111001100000000000000000011110000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000001110010001000000000000000000000000000' +
    '0000000000000000000000000001001010001000000000000000000000000000' +
    '0000000000000000000000000001110001110000000000000000000000000000' +
    '0000000000000000000000000001001000100000000000000000000000000000' +
    '0000000000000000000000000001110000100000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '0011001001011100111001111010001000111011110011001000100110010010' +
    '0100101101010010100101000010001001000010000100101101101001011010' +
    '0111101011010010111001110010101000110011100111101010101111010110' +
    '0100101001010010101001000011011000001010000100101000101001010010' +
    '0100101001011100100101110010001001110011100100101000101001010010' +
    '0000000000000000000000000000000000000000000000000000000000000000';

const DEFAULT_DISPLAY_ARRAY = Array.from(DEFAULT_DISPLAY_STR);

module.exports = {
    MEMORY_SIZE,
    INTERPRETER_SIZE,
    DISPLAY_WIDTH,
    DISPLAY_HEIGHT,
    COLORS,
    DEFAULT_INACTIVE,
    DEFAULT_ACTIVE,
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    PIXEL_COLOR,
    PIXEL_ALPHA,
    MICROSECOND_DELAY,

    DEFAULT_DISPLAY_ARRAY,
    KEY_MAP,
};
