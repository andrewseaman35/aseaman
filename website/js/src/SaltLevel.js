import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import { list } from './components/salt_level/api';
import { LineChart } from './components/salt_level/visualizations';

const CONFIG = require('./config');


class SaltLevel extends React.Component {
    constructor() {
        super();
        this.handleResponse = this.handleResponse.bind(this);

        this.state = {
            loading: true,
        }
    }

    componentDidMount() {
        list('softener_one')
            .then(
                this.handleResponse,
                (err) => { console.log(err); },
            );
    }

    handleResponse(response) {
        this.data = response;
        this.setState({ loading: false });
        console.log(this.data)
    }

    renderSummaryChart() {
        const datasets = [
            {
                label: 'sensor_0',
                points: _.map(this.data, d => ({
                    x: Number(d.timestamp),
                    y: Number(d.sensor_0),
                })),
                style: {
                    point: {
                        color: '#FF5733',
                    },
                    line: {
                        color: '#FF5733',
                    },
                },
            },
            {
                label: 'sensor_1',
                points: _.map(this.data, d => ({
                    x: Number(d.timestamp),
                    y: Number(d.sensor_1),
                })),
                style: {
                    point: {
                        color: '#096F15',
                    },
                    line: {
                        color: '#096F15',
                    },
                },
            },
            {
                label: 'sensor_2',
                points: _.map(this.data, d => ({
                    x: Number(d.timestamp),
                    y: Number(d.sensor_2),
                })),
                style: {
                    point: {
                        color: '#334FFF',
                    },
                    line: {
                        color: '#334FFF',
                    },
                },
            },
            {
                label: 'sensor_3',
                points: _.map(this.data, d => ({
                    x: Number(d.timestamp),
                    y: Number(d.sensor_3),
                })),
                style: {
                    point: {
                        color: '#C733FF',
                    },
                    line: {
                        color: '#C733FF',
                    },
                },
            },
            {
                label: 'average',
                points: _.map(this.data, d => ({
                    x: Number(d.timestamp),
                    y: _.reduce(
                            _.map([d.sensor_0, d.sensor_1, d.sensor_2, d.sensor_3], Number),
                            (a, b) => a + b,
                        ) / 4,
                })),
                style: {
                    point: {
                        color: '#000000',
                    },
                    line: {
                        color: '#000000',
                        width: 3,
                    },
                },
            },
        ];
        const settings = {
            axis: {
                x: {
                    label: 'Date',
                    tickType: 'timestamp_day',
                    grid: true,
                },
                y: {
                    label: 'Height of Salt (cm)',
                    min: 0,
                    grid: true,
                }
            },
        };
        return (
            <LineChart
                title="Amount of Salt Used"
                width={900}
                height={500}
                datasets={datasets}
                settings={settings}
            />
        )
    }

    render() {
        if (!this.state.loading) {
            return this.renderSummaryChart();
        }
        return <div className="inner">-- Loading --</div>
    }
}

module.exports = SaltLevel;
