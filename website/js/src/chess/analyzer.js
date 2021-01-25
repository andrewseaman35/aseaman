import _ from 'lodash';

import {
    PIECE_NOTATION,
} from './constants';


class Analyzer {
    findKing(pieces) {
        return _.find(pieces, piece => piece.notation === PIECE_NOTATION.KING);
    }

    findChecks(board, offensivePieces, defensivePieces) {
        const checks = [];
        const defensiveKingSpace = board.findPositionOfPiece(this.findKing(defensivePieces));
        _.each(offensivePieces, (piece) => {
            if (!piece.isCaptured) {
                const space = board.getSpaceOfPiece(piece);
                if (piece.getPossibleMoves(board, space).includes(defensiveKingSpace)) {
                    checks.push(space);
                }
            }
        });
        return checks;
    }
}

module.exports = Analyzer;
