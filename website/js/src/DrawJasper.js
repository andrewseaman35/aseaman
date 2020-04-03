import React from 'react';
import $ from 'jquery';

import AUTH from '../../auth';
import { getAPIUrl, getImageSrc } from './utils';


class DrawJasper extends React.Component {
    constructor() {
        super();

        this.renderMatch = this.renderMatch.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.saveCanvas = this.saveCanvas.bind(this);
        this.uploadImage = this.uploadImage.bind(this);

        this.state = {
            drawingInProgress: false,
            finishedDrawing: false,
            imgSrc: null,
            rankings: null,
        };
    }

    componentDidMount() {
        this.canvas = document.getElementById('jas-canvas');
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#000000";
        this.canvasTop = this.canvas.getBoundingClientRect().y;
        this.canvasLeft = this.canvas.getBoundingClientRect().x;
        this.dragStart = null;
        this.previousPos = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.canvas.addEventListener("mousemove", (e) => {
            this.handleMove(e)
        }, false);
        this.canvas.addEventListener("mousedown", (e) => {
            this.handleDown(e)
        }, false);
        this.canvas.addEventListener("mouseup", (e) => {
            this.handleUp(e)
        }, false);
    }

    getMouseCoords(e) {
        const x = e.clientX - this.canvasLeft;
        const y = e.clientY - this.canvasTop;
        return { x, y };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.setState({
            drawingInProgress: false,
            finishedDrawing: false,
        });
    }

    saveCanvas() {
        this.setState({
            imgSrc: this.canvas.toDataURL("image/png"),
        });
    }

    uploadImage(e) {
        e.preventDefault();

        $.ajax({
          type: "POST",
          url: getAPIUrl('draw_jasper'),
          data:JSON.stringify({
            api_key: AUTH.getApiKey(),
            img: this.state.imgSrc
          }),
          contentType: 'application/json',
        }).promise().then((success) => {
            this.setState({
                rankings: success.results,
            });
        })
    }

    handleMove(e) {
        if (this.state.finishedDrawing) {
            return;
        }
        if (this.state.drawingInProgress) {
            const { x, y} = this.getMouseCoords(e);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.previousPos = { x, y };
        }
    }

    handleDown(e) {
        if (this.state.finishedDrawing) {
            return;
        }
        if (!this.state.drawingInProgress) {
            this.setState({ drawingInProgress: true });
            const { x, y } = this.getMouseCoords(e);
            this.dragStart = { x, y };
            this.previousPos = { x, y };
            this.ctx.beginPath();
            this.ctx.lineWidth = "5";
            this.ctx.strokeStyle = "black"; // Green path
            this.ctx.fillStyle = "black"; // Green path
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else {
            this.handleUp(e);
        }
    }

    handleUp(e) {
        if (this.state.finishedDrawing) {
            return;
        }
        this.ctx.moveTo(this.previousPos.x, this.previousPos.y);
        this.ctx.lineTo(this.dragStart.x, this.dragStart.y);
        this.ctx.stroke();
        this.ctx.fill()
        this.dragStart = null;
        this.setState({
            drawingInProgress: false,
            finishedDrawing: true,
        })

    }

    renderMatch() {
        console.log(this.state.rankings)
        const matchId = this.state.rankings[0][1];
        return (
            <img width="400px" src={getImageSrc(`images/jasper/data/original/${matchId}.jpg`)} />
        )
    }

    renderImageForm() {
        return (
            <form name="drawing" id="imageUploadForm" encType="multipart/form-data" method="post">
                <input type="file" id="ImageBrowse" hidden="hidden" name="image" size="30"/>
                <input onClick={this.uploadImage} type="submit" name="upload" value="Upload" />
                <img id="drawing-image" src={this.state.imgSrc} />
            </form>
        )
    }

    renderCanvas() {
        return (
            <canvas
                id="jas-canvas"
                width="800"
                height="400"
            />
        )
    }

    render() {
        return (
            <div>
                { this.state.rankings ? this.renderMatch() : null}
                { this.state.imgSrc ? this.renderImageForm() : this.renderCanvas() }
                <div className="action-bar">
                    <button onClick={this.clearCanvas}>Clear</button>
                    <button onClick={this.saveCanvas}>Save</button>
                </div>
            </div>
        )
    }
}


module.exports = DrawJasper;
