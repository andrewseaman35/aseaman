const presets = [
    [
        '@babel/env',
        {
            corejs: {
                version: 3,
                proposals: true,
            },
            targets: '> 0.25%, not dead',
            useBuiltIns: 'usage',
        },
    ],
    [
        '@babel/preset-react',
    ],
];

module.exports = { presets };
