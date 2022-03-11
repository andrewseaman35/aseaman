import React from 'react';
import $ from 'jquery';

import { getAPIUrl, getImageSrc, getUrlTo } from './utils';


class DrawJasper extends React.Component {
    constructor() {
        super();

        this.initializeCanvas = this.initializeCanvas.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.saveCanvas = this.saveCanvas.bind(this);
        this.uploadImage = this.uploadImage.bind(this);

        this.state = {
            drawingInProgress: false,
            finishedDrawing: false,
            imgSrc: null,
            rankings: null,
            awaitingResponse: false,
        };
    }

    componentDidMount() {
        this.initializeCanvas();
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

    initializeCanvas() {
        this.canvas = document.getElementById('jas-canvas');
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#000000";
        this.dragStart = null;
        this.previousPos = null;
        this.initializeEventListeners();
    }

    getMouseCoords(e) {
        const x = e.clientX - this.canvas.getBoundingClientRect().x;
        const y = e.clientY - this.canvas.getBoundingClientRect().y;
        return { x, y };
    }

    clearCanvas() {
        this.setState({
            imgSrc: null,
            rankings: null,
            drawingInProgress: false,
            finishedDrawing: false,
        }, () => {
            this.initializeCanvas();
        });
    }

    saveCanvas() {
        this.setState({
            imgSrc: this.canvas.toDataURL("image/png"),
        });
    }

    uploadImage(e) {
        e.preventDefault();
        this.setState({ awaitingResponse: true });
        $.ajax({
          type: "POST",
          url: getAPIUrl('draw_jasper'),
          data:JSON.stringify({
            img: this.state.imgSrc
          }),
          contentType: 'application/json',
        }).promise().then((success) => {
            this.setState({
                rankings: success.results,
                awaitingResponse: false,
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
            imgSrc: this.canvas.toDataURL("image/png"),
        });
    }

    renderActions() {
        if (!this.state.imgSrc) {
            return null;
        }
        const disabled = this.state.awaitingResponse;
        return (
            <div className="action-bar">
                <button disabled={disabled} onClick={this.clearCanvas}>Clear</button>
                <input disabled={disabled} onClick={this.uploadImage} type="submit" name="upload" value="Upload" />
            </div>
        )
    }

    renderLoading() {
        if (!this.state.awaitingResponse) {
            return null;
        }

        return (
            <div className="loading">
                <div className="text-box">Loading...</div>
            </div>
        )
    }

    renderImageForm() {
        return (
            <React.Fragment>
                { this.renderLoading() }
                <img className="input-drawing" id="drawing-image" src={this.state.imgSrc} />
                <form name="drawing" id="imageUploadForm" encType="multipart/form-data" method="post">
                    <input type="file" id="ImageBrowse" hidden="hidden" name="image" size="30"/>
                </form>
            </React.Fragment>
        )
    }

    renderCanvas() {
        if (this.state.imgSrc) {
            return (
                <React.Fragment>
                    { this.renderLoading() }
                    <img className="input-drawing" id="drawing-image" src={this.state.imgSrc} />
                    <form name="drawing" id="imageUploadForm" encType="multipart/form-data" method="post">
                        <input type="file" id="ImageBrowse" hidden="hidden" name="image" size="30"/>
                    </form>
                </React.Fragment>
            )
        }
        return (
            <div className="canvas-container">
                <canvas id="jas-canvas" width="800" height="400" />
            </div>
        )
    }

    renderBeforeMatch() {
        return (
            <React.Fragment>
                { this.renderCanvas() }
                { this.renderActions() }
            </React.Fragment>
        )
    }

    renderAfterMatch() {
        const match = this.state.rankings[0][1];
        const matchId = match.matchId;
        return (
            <div className="after-match">
                <div className="img-container">
                    <img className="input-drawing" id="drawing-image" src={this.state.imgSrc} />
                    <div className="img-caption">Your drawing!</div>
                </div>
                <div className="img-container">
                    <img className="match-image" width="400px" src={getImageSrc(`images/jasper/data/original/${matchId}.jpg`)} />
                    <div className="img-caption">Your match!</div>
                </div>
                <button onClick={this.clearCanvas}>Try again!</button>
            </div>
        )
    }

    render() {
        return (
            <React.Fragment>
                { !this.state.rankings && this.renderBeforeMatch() }
                { this.state.rankings && this.renderAfterMatch() }
                <p className="still-interested">
                    <strong>
                        Think this is kinda cool? Check out how it works on this page
                        on <a
                            href={getUrlTo("jasper/comparing")}
                        >
                            comparing Jasper to shapes
                        </a>!
                    </strong>
                </p>
            </React.Fragment>
        )
    }
}


module.exports = DrawJasper;
