module.exports = {
    id: 'connect_four',
    title: 'Connect 4',
    description: 'Two player connect four. There\'s no win detection, so I guess' +
                 'you can just play until it gets boring.',
    author: 'David Winter',
    controls: [
        { key: 'Q', action: 'move piece left' },
        { key: 'E', action: 'move piece right' },
        { key: 'W', action: 'drop piece' },
    ],
    rom: [
        0x121a, 0x434f, 0x4e4e, 0x4543, 0x5434, 0x2062, 0x7920, 0x4461,
        0x7669, 0x6420, 0x5749, 0x4e54, 0x4552, 0xa2bb, 0xf665, 0xa2b4,
        0xf655, 0x6900, 0x6801, 0x6b00, 0x6d0f, 0x6e1f, 0xa2a5, 0x600d,
        0x6132, 0x6200, 0xd02f, 0xd12f, 0x720f, 0x321e, 0x1234, 0xd021,
        0xd121, 0x7201, 0x600a, 0xa29f, 0xd021, 0xd121, 0xa29f, 0xdde1,
        0xfc0a, 0xdde1, 0x4c05, 0x127e, 0x3c04, 0x126a, 0x7bff, 0x7dfb,
        0x3d0a, 0x127a, 0x6b06, 0x6d2d, 0x127a, 0x3c06, 0x1298, 0x7b01,
        0x7d05, 0x3d32, 0x127a, 0x6b00, 0x6d0f, 0xdde1, 0x1250, 0xa2b4,
        0xfb1e, 0xf065, 0x40fc, 0x1298, 0x8a00, 0x70fb, 0xf055, 0x8983,
        0xa29e, 0x3900, 0xa2a1, 0xdda4, 0xa29f, 0xdde1, 0x1250, 0x60f0,
        0xf060, 0x9090, 0x6080, 0x8080, 0x8080, 0x8080, 0x8080, 0x8080,
        0x8080, 0x8080, 0x1a1a, 0x1a1a, 0x1a1a, 0x1a1a, 0x1a1a, 0x1a1a,
        0x1a1a,
    ]
};
