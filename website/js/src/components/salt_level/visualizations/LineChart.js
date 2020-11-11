import React from 'react'
import PropTypes from 'prop-types';

import _ from 'lodash';

import { formatDayTimestampLabel } from './utils';


const SETTINGS = {
    title: {
        font: "Arial",
        fontSize: 30,
        margin: 50,
    },

    margin: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
    },

    point: {
        size: 4,
        color: '#000000',
    },

    line: {
        width: 1,
        color: '#000000',
    },

    axis: {
        lineColor: '#000000',
        lineWidth: 2,
        tick: {
            font: "Arial",
            fontSize: 12,
        },
        label: {
            font: "Arial",
            fontSize: 16,
        },
        x: {
            label: null,
            labelMargin: 30,
            tickType: 'number',
            tickCount: 6,
            tickMargin: 4,
            roundingPlaces: 2,
            min: undefined,
            max: undefined,
            grid: false,
            gridColor: '#DDDDDD',
            gridWidth: 1,
        },
        y: {
            label: null,
            labelMargin: 30,
            tickType: 'number',
            tickCount: 6,
            tickMargin: 16,
            roundingPlaces: 2,
            min: undefined,
            max: undefined,
            grid: false,
            gridColor: '#DDDDDD',
            gridWidth: 1,
        },
    }
};


class LineChart extends React.Component {
    constructor() {
        super();
        this.canvasRef = React.createRef();

        this.metadata = {};
        this.settings = {};
    }

    componentDidMount() {
        console.log(this.canvasRef.current)
        let context = this.canvasRef.current.getContext('2d');
        console.log(context)
        console.log(this.props.datasets)

        this.generateSettings();
        this.preprocessData();
        this.generateConfig();
        this.drawGraph();
    }

    generateSettings() {
        console.log('generateSettings');
        this.settings = {
            ...SETTINGS,
            ...this.props.settings,
            title: {
                ...SETTINGS.title,
                ...(this.props.settings.title || {}),
            },
            margin: {
                ...SETTINGS.margin,
                ...(this.props.settings.margin || {}),
            },
            point: {
                ...SETTINGS.point,
                ...(this.props.settings.point || {}),
            },
            axis: {
                ...SETTINGS.axis,
                ...(this.props.settings.axis || {}),
                tick: {
                    ...SETTINGS.axis.tick,
                    ...(this.props.settings.axis.tick || {}),
                },
                x: {
                    ...SETTINGS.axis.x,
                    ...(this.props.settings.axis.x || {}),
                },
                y: {
                    ...SETTINGS.axis.y,
                    ...(this.props.settings.axis.y || {}),
                }
            }
        };
        console.log(this.settings)
    }

    generateConfig() {
        const context = this.canvasRef.current.getContext('2d');
        const canvas = context.canvas;

        const topMargin = (
            this.settings.title ? this.settings.margin.top + this.settings.title.margin : this.settings.margin.top
        );
        const bottomMargin = (
            this.settings.axis.x.label ?
            this.settings.margin.bottom + this.settings.axis.x.labelMargin : this.settings.margin.bottom
        );
        const leftMargin = (
            this.settings.axis.y.label ?
            this.settings.margin.left + this.settings.axis.y.labelMargin : this.settings.margin.left
        );
        this.config = {
            ...this.settings,
            canvas: {
                height: canvas.height,
                width: canvas.width,
            },
            margin: {
                ...this.settings.margin,
                top: topMargin,
                bottom: bottomMargin,
                left: leftMargin,
            },
            point: {
                ...this.settings.point,
            },
            axis: {
                ...this.settings.axis,
                width: canvas.width - leftMargin - this.settings.margin.right,
                height: canvas.height - topMargin - bottomMargin,
                x: {
                    ...this.settings.axis.x,
                    min: this.settings.axis.x.min !== undefined ? this.settings.axis.x.min : this.metadata.x.min,
                    max: this.settings.axis.x.max !== undefined ? this.settings.axis.x.max : this.metadata.x.max,
                },
                y: {
                    ...this.settings.axis.y,
                    min: this.settings.axis.y.min !== undefined ? this.settings.axis.y.min : this.metadata.y.min,
                    max: this.settings.axis.y.max !== undefined ? this.settings.axis.y.max : this.metadata.y.max,
                },
            },
        };
        console.log(this.config)
    }

    preprocessData() {
        console.log("preprocessData")
        const datasets = this.props.datasets;
        const points = _.concat(..._.map(datasets, dataset => dataset.points));
        const xValues = _.concat(..._.map(points, point => point.x));
        const yValues = _.concat(..._.map(points, point => point.y));

        this.metadata.total = {
            count: points.length,
        };
        this.metadata.y = {
            min: _.min(yValues),
            max: _.max(yValues),
        };
        this.metadata.x = {
            min: _.min(xValues),
            max: _.max(xValues),
        };

        console.log(this.metadata)
        console.log("End preprocessData")
    }

    calculateAxisValues(min, max, positionMin, positionMax, axisSettings) {
        const roundMultiplier = Math.pow(10, axisSettings.roundingPlaces);
        const step = (max - min) / axisSettings.tickCount - 1;
        const ticks = _.map(
            _.concat(_.range(min, max, step), max),
            tick => {
                if (axisSettings.tickType === 'timestamp_day') {
                    return formatDayTimestampLabel(tick);
                }
                return Math.round(tick * roundMultiplier) / roundMultiplier;
            },
        );
        const positionStep = (positionMax - positionMin) / SETTINGS.axis.x.tickCount;
        const positions = _.map(
            _.concat(
                _.range(positionMin, positionMax, positionStep),
                positionMax,
            ),
        );
        return { ticks, positions }
    }

    translateX(xValue) {
        const valueRange = this.metadata.x.max - this.config.axis.x.min;
        const multiplier = this.config.axis.width / valueRange;
        return this.config.margin.left + (multiplier * (xValue - this.config.axis.x.min));
    }

    translateY(yValue) {
        const valueRange = this.metadata.y.max - this.config.axis.y.min;
        const multiplier = this.config.axis.height / valueRange;
        return this.config.canvas.height - this.config.margin.bottom - (multiplier * (yValue - this.config.axis.y.min));
    }

    drawGraph() {
        this.drawTitle();
        this.drawAxes();
        this.drawData();
    }

    drawTitle() {
        if (!this.props.title) {
            return;
        }
        const context = this.canvasRef.current.getContext('2d');
        context.font = `${this.config.title.fontSize}px ${this.config.title.font}`;
        context.textAlign = "center";
        context.fillText(this.props.title, context.canvas.width / 2, 40);
        console.log(`Draw title: ${this.props.title}`)
    }

    drawAxes() {
        const context = this.canvasRef.current.getContext('2d');
        const canvas = context.canvas;

        // Set axis styling
        context.lineWidth = this.config.axis.lineWidth;
        context.strokeStyle = this.config.axis.lineColor;

        // y axis
        context.beginPath()
        context.moveTo(this.config.margin.left, this.config.margin.top);
        context.lineTo(this.config.margin.left, this.config.margin.top + this.config.axis.height);

        // x axis
        context.moveTo(this.config.margin.left, this.config.margin.top + this.config.axis.height);
        context.lineTo(this.config.margin.left + this.config.axis.width, this.config.margin.top + this.config.axis.height);

        context.stroke();
        context.closePath();

        context.font = `${this.config.axis.tick.fontSize}px ${this.config.axis.tick.font}`;
        context.textAlign = "center";

        const xPosMin = this.config.margin.left;
        const xPosMax = this.config.margin.left + this.config.axis.width;
        const xAxis = this.calculateAxisValues(this.config.axis.x.min, this.config.axis.x.max, xPosMin, xPosMax, this.config.axis.x);

        context.lineWidth = this.config.axis.x.gridWidth;
        context.strokeStyle = this.config.axis.x.gridColor;
        context.beginPath();
        for (let i = 0; i < xAxis.ticks.length; i += 1) {
            const x = xAxis.positions[i];
            const y = this.config.margin.top + this.config.axis.height + this.config.axis.y.tickMargin;
            context.fillText(xAxis.ticks[i], x, y);
            if (i > 0 && this.config.axis.x.grid) {
                context.moveTo(x, this.config.margin.top + this.config.axis.height);
                context.lineTo(x, this.config.margin.top);
            }
        }
        context.stroke();
        context.closePath();


        context.textAlign = "right";
        const yPosMin = this.config.margin.top;
        const yPosMax = this.config.margin.top + this.config.axis.height;
        const yAxis = this.calculateAxisValues(this.config.axis.y.min, this.config.axis.y.max, yPosMin, yPosMax, this.config.axis.y);

        context.lineWidth = this.config.axis.y.gridWidth;
        context.strokeStyle = this.config.axis.x.gridColor;
        context.beginPath();
        for (let i = 0; i < yAxis.ticks.length; i += 1) {
            const x = this.config.margin.left - this.config.axis.x.tickMargin;
            const y = yAxis.positions[yAxis.positions.length - i - 1];
            context.fillText(yAxis.ticks[i], x, y);
            if (i > 0 && this.config.axis.y.grid) {
                context.moveTo(this.config.margin.left, y);
                context.lineTo(this.config.margin.left + this.config.axis.width, y);
            }
        }
        context.stroke();
        context.closePath();

        context.textAlign = "center";
        context.font = `${this.config.axis.label.fontSize}px ${this.config.axis.label.font}`;
        if (this.config.axis.x.label) {
            context.fillText(
                this.config.axis.x.label,
                this.config.margin.left + (this.config.axis.width / 2),
                (
                    this.config.margin.top +
                    this.config.axis.height +
                    this.config.axis.y.tickMargin +
                    this.config.margin.bottom / 2
                ),
            )
        }
        if (this.config.axis.y.label) {
            // Save the context, rotate everything to write sideways, and restore. The rotate method
            // also rotates the coordinates.
            context.save();
            context.rotate(-Math.PI / 2);
            context.fillText(
                this.config.axis.y.label,
                -(this.config.margin.top + (this.config.axis.height / 2)),
                this.config.margin.left / 2,
            )
            context.restore();
        }
    }

    drawData() {
        console.log("Draw data");
        _.each(this.props.datasets, dataset => this.drawDataset(dataset));
    }

    drawDataset(dataset) {
        const context = this.canvasRef.current.getContext('2d');

        const radius = dataset.style.point.size || this.config.point.size;
        context.fillStyle = dataset.style.point.color || this.config.point.color;
        context.strokeStyle = dataset.style.line.color || this.config.line.color;
        for (let i = 0; i < dataset.points.length; i += 1) {
            const point = dataset.points[i];
            const x = this.translateX(point.x);
            const y = this.translateY(point.y);
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, true);
            context.fill();

            const nextPoint = dataset.points[i + 1];
            if (nextPoint) {
                const nextX = this.translateX(nextPoint.x);
                const nextY = this.translateY(nextPoint.y);
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(nextX , nextY);
                context.stroke();
            }
        }
    }

    render() {
        return (
            <canvas
                id="line-chart"
                ref={this.canvasRef}
                width={this.props.width}
                height={this.props.height}
                style={{border: "1px black solid", marginBottom: "100px"}}
            ></canvas>
        )
    }
}


LineChart.defaultProps = {
    settings: {},
};

LineChart.propTypes = {
    title: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        points: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        })).isRequired,
    })).isRequired,
    settings: PropTypes.shape({
        title: PropTypes.shape({
            font: PropTypes.string,
            fontSize: PropTypes.number,
        }),
        margin: PropTypes.shape({
            top: PropTypes.number,
            right: PropTypes.number,
            bottom: PropTypes.number,
            left: PropTypes.number,
        }),
        point: PropTypes.shape({
            size: PropTypes.number,
            color: PropTypes.string,
        }),
        axis: PropTypes.shape({
            tick: PropTypes.shape({
                font: PropTypes.string,
                fontSize: PropTypes.number,
            }),
            x: PropTypes.shape({
                label: PropTypes.string,
                grid: PropTypes.boolean,
                tickCount: PropTypes.number,
                tickType: PropTypes.string,
                tickMargin: PropTypes.number,
                roundingPlaces: PropTypes.number,
                min: PropTypes.number,
                max: PropTypes.number,
            }),
            y: PropTypes.shape({
                label: PropTypes.string,
                grid: PropTypes.boolean,
                tickCount: PropTypes.number,
                tickType: PropTypes.string,
                tickMargin: PropTypes.number,
                roundingPlaces: PropTypes.number,
                min: PropTypes.number,
                max: PropTypes.number,
            }),
        }),
    }),
}


module.exports = LineChart;
