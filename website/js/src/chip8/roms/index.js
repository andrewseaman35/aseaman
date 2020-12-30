import airplane from './airplane';
import bc_test from './bc_test';
import breakout from './breakout';
import connect_four from './connect_four';
import space_invaders from './space_invaders';
import tank from './tank';
import test_opcode from './test_opcode';
import pong_1p from './pong_1p';
import pong_2p from './pong_2p';

module.exports = {
    GAMES: [
        airplane,
        breakout,
        connect_four,
        pong_1p,
        // pong_2p,
        space_invaders,
        tank,
    ],
    PROGRAMS: [
        bc_test,
        test_opcode,
    ],
};
