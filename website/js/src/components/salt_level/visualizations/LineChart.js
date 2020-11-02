import React from 'react'
import PropTypes from 'prop-types';

import _ from 'lodash';

import { formatDayTimestampLabel } from './utils';


const SETTINGS = {
    title: {
        font: "Arial",
        fontSize: 30,
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
        label: {
            font: "Arial",
            fontSize: 12,
        },
        x: {
            labelType: 'number',
            labelCount: 6,
            labelMargin: 4,
            roundingPlaces: 2,
            min: undefined,
            max: undefined,
        },
        y: {
            labelType: 'number',
            labelCount: 6,
            labelMargin: 16,
            roundingPlaces: 2,
            min: undefined,
            max: undefined,
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
                label: {
                    ...SETTINGS.axis.label,
                    ...(this.props.settings.axis.label || {}),
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
        const topMargin = this.props.title ? this.settings.margin.top + 40 : this.settings.margin.top;
        this.config = {
            ...this.settings,
            canvas: {
                height: canvas.height,
                width: canvas.width,
            },
            margin: {
                ...this.settings.margin,
                top: topMargin,
            },
            point: {
                ...this.settings.point,
            },
            axis: {
                ...this.settings.axis,
                width: canvas.width - this.settings.margin.left - this.settings.margin.right,
                height: canvas.height - topMargin - this.settings.margin.bottom,
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
        const step = (max - min) / axisSettings.labelCount - 1;
        const labels = _.map(
            _.concat(_.range(min, max, step), max),
            label => {
                if (axisSettings.labelType === 'timestamp_day') {
                    return formatDayTimestampLabel(label);
                }
                return Math.round(label * roundMultiplier) / roundMultiplier;
            },
        );
        const positionStep = (positionMax - positionMin) / SETTINGS.axis.x.labelCount;
        const positions = _.map(
            _.concat(
                _.range(positionMin, positionMax, positionStep),
                positionMax,
            ),
        );
        return { labels, positions }
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

        // y axis
        context.moveTo(this.config.margin.left, this.config.margin.top);
        context.lineTo(this.config.margin.left, this.config.margin.top + this.config.axis.height);

        // x axis
        context.moveTo(this.config.margin.left, this.config.margin.top + this.config.axis.height);
        context.lineTo(this.config.margin.left + this.config.axis.width, this.config.margin.top + this.config.axis.height);

        context.stroke();

        context.font = `${this.config.axis.label.fontSize}px ${this.config.axis.label.font}`;
        context.textAlign = "center";

        const xPosMin = this.config.margin.left;
        const xPosMax = this.config.margin.left + this.config.axis.width;
        const xAxis = this.calculateAxisValues(this.config.axis.x.min, this.config.axis.x.max, xPosMin, xPosMax, this.config.axis.x);

        for (let i = 0; i < xAxis.labels.length; i += 1) {
            context.fillText(
                xAxis.labels[i],
                xAxis.positions[i],
                this.config.margin.top + this.config.axis.height + this.config.axis.y.labelMargin,
            );
        }

        context.textAlign = "right";
        const yPosMin = this.config.margin.top;
        const yPosMax = this.config.margin.top + this.config.axis.height;
        const yAxis = this.calculateAxisValues(this.config.axis.y.min, this.config.axis.y.max, yPosMin, yPosMax, this.config.axis.y);

        for (let i = 0; i < yAxis.labels.length; i += 1) {
            context.fillText(
                yAxis.labels[i],
                this.config.margin.left - this.config.axis.x.labelMargin,
                yAxis.positions[yAxis.positions.length - i - 1],
            );
        }

        console.log('Draw Y labels');
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
            x: PropTypes.shape({
                labelCount: PropTypes.number,
                labelType: PropTypes.string,
                labelMargin: PropTypes.number,
                roundingPlaces: PropTypes.number,
                min: PropTypes.number,
                max: PropTypes.number,
            }),
            y: PropTypes.shape({
                labelCount: PropTypes.number,
                labelType: PropTypes.string,
                labelMargin: PropTypes.number,
                roundingPlaces: PropTypes.number,
                min: PropTypes.number,
                max: PropTypes.number,
            }),
        }),
    }),
}


module.exports = LineChart;
