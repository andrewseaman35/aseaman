import $ from 'jquery';

import {
    REMOTE_CHESS_ACTION_TYPE,
} from './constants';



class RemoteChess {
    constructor() {
        this.ipAddress = '127.0.0.1';
        this.port = '5000';
        this.initialized = false;
    }

    setRemoteServerAddress(address, port) {
        if (address != null) {
            this.ipAddress = address;
        }
        if (port != null) {
            this.port = port;
        }
    }

    get baseUrl() {
        return `http://${this.ipAddress}:${this.port}`;
    }

    moveToSpacePayload(start, end) {
        return {
            action: REMOTE_CHESS_ACTION_TYPE.MOVE_TO_SPACE,
            starting_space: start,
            ending_space: end,
        };
    }

    removeFromBoardPayload(space) {
        return {
            action: REMOTE_CHESS_ACTION_TYPE.REMOVE_FROM_BOARD,
            space: space,
        };
    }

    getMovePayloadFromTurn(board, turn) {
        const moves = [];
        if (turn.isCastle) {
            let rookStartingPosition;
            let rookEndingPosition;
            if (turn.isKingsideCastle) {
                rookStartingPosition = turn.isWhite ? 'H1' : 'H8';
                rookEndingPosition = turn.isWhite ? 'F1' : 'F8';
            } else {
                rookStartingPosition = turn.isWhite ? 'A1' : 'A8';
                rookEndingPosition = turn.isWhite ? 'D1' : 'D8';
            }
            moves.push(
                this.moveToSpacePayload(turn.startingSpacePosition, turn.endingSpacePosition),
                this.moveToSpacePayload(rookStartingPosition, rookEndingPosition)
            );
        } else if(turn.isEnPassant) {
            moves.push(
                this.moveToSpacePayload(turn.startingSpacePosition, turn.endingSpacePosition),
                this.removeFromBoardPayload(turn.capturedSpacePosition)
            );
        } else {
            if (turn.capturedSpacePosition != null) {
                moves.push(
                    this.removeFromBoardPayload(turn.capturedSpacePosition)
                );
            }
            moves.push(
                this.moveToSpacePayload(turn.startingSpacePosition, turn.endingSpacePosition)
            );
        }
        return moves;
    }

    processTurn(board, turn) {
        this.performMoves(this.getMovePayloadFromTurn(board, turn));
    }

    getServerStatus() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/status`,
        }).promise();
    }

    getOctoPrintStatus() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/octoprint_status`,
        }).promise();
    }

    initializeOctoPrint() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/initialize_octoprint`,
        }).promise();
    }

    homeAxes() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/home_axes`,
        }).promise();
    }

    getControllerSerialStatus() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/controller_serial_status`,
        }).promise();
    }

    initializeController() {
        return $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/initialize_controller`,
        }).promise();
    }

    getConfig() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/configure`,
        }).promise();
    }

    updateConfig(key, value) {
        $.ajax({
            type: 'PATCH',
            url: `${this.baseUrl}/configure`,
            contentType: 'application/json',
            data: JSON.stringify({
                key: key,
                value: value,
            })
        }).promise();
    }

    movePiece(startingSpace, endingSpace) {
        $.ajax({
            type: 'POST',
            url: `${this.baseUrl}/chess_v1/perform_moves`,
            contentType: 'application/json',
            data: JSON.stringify({
                moves: [
                    [startingSpace, endingSpace],
                ],
            })
        }).promise();
    }

    moveHandZAxis(direction) {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/move_hand_z_axis`,
            contentType: 'application/json',
            data: {
                direction: direction,
            }
        }).promise();
    }

    moveToSpace(space) {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/move_to_space`,
            contentType: 'application/json',
            data: {
                space: space,
            }
        }).promise();
    }

    performMoves(moves) {
        $.ajax({
            type: 'POST',
            url: `${this.baseUrl}/chess_v1/perform_moves`,
            contentType: 'application/json',
            data: JSON.stringify({
                moves: moves,
                skip_hand: 'true',
            })
        }).promise();
    }
}

module.exports = RemoteChess;
