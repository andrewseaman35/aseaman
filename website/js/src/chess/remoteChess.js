import $ from 'jquery';


class RemoteChess {
    constructor() {
        this.ipAddress = '127.0.0.1';
        this.port = '5000';
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

    checkServerStatus() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/status`,
        }).promise();
    }

    getOctoPrintStatus() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/octoprint_status`,
        }).promise();
    }

    initializeOctoPrint() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/initialize_octoprint`,
        }).promise();
    }

    homeAxes() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/home_axes`,
        }).promise();
    }

    getControllerSerialStatus() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/controller_serial_status`,
        }).promise();
    }

    initializeController() {
        $.ajax({
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


    performMoves(moves) {
        $.ajax({
            type: 'POST',
            url: `${this.baseUrl}/chess_v1/perform_moves`,
            contentType: 'application/json',
            data: JSON.stringify({
                moves: moves,
            })
        }).promise();
    }
}

module.exports = RemoteChess;
