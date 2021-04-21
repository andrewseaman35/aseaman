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

    initializeController() {
        $.ajax({
            type: 'GET',
            url: `${this.baseUrl}/chess_v1/initialize_controller`,
        }).then((r) => console.log(r));
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

    sendTurn() {
        $.ajax({
            type: 'POST',
            url: `${this.baseUrl}/chess_v1/`,
            contentType: 'application/json',
            data: JSON.stringify({
                key: key,
                value: value,
            })
        }).promise();
    }
}

module.exports = RemoteChess;
