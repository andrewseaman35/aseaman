import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import { list } from './components/salt_level/api';

const CONFIG = require('./config');
const LOCAL = CONFIG.STACKNAME === 'local';


class SaltLevel extends React.Component {
    constructor() {
        super();
        this.handleResponse = this.handleResponse.bind(this);

        this.state = {
            loading: true,
        }
    }

    componentDidMount() {
        if (!LOCAL) { return; }
        list('softener_one')
            .then(
                this.handleResponse,
                (err) => { console.log(err); },
            );
    }

    handleResponse(response) {
        this.setState({ loading: false });
        this.data = response;
        console.log(this.data)
        this.updateSummaryChart();
    }

    updateSummaryChart() {
        const node = this.node;
        const margin = {top: 50, right: 50, bottom: 50, left: 50};
        const width = window.innerWidth - margin.left - margin.right // Use the window's width
        const height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
        const n = this.data.length;
        const xScale = d3.scaleLinear()
            .domain([0, n-1]) // input
            .range([0, width]); // output
        const yScale = d3.scaleLinear()
            .domain([0, 200]) // input
            .range([height, 0]); // output

        const sensorOneLine = d3.line()
            .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.sensor_one); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        const sensorTwoLine = d3.line()
            .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.sensor_two); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // 1. Add the SVG to the page and employ #2
        var svg = d3.select("#summary-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

        // 4. Call the y axis in a group tag
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

        // 9. Append the path, bind the data, and call the line generator
        svg.append("path")
            .datum(this.data) // 10. Binds data to the line
            .attr("class", "line sensor_one") // Assign a class for styling
            .attr("d", sensorOneLine); // 11. Calls the line generator

        // 12. Appends a circle for each datapoint
        svg.selectAll(".dot.sensor_one")
            .data(this.data)
          .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot sensor_one") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(i) })
            .attr("cy", function(d) { return yScale(d.sensor_one) })
            .attr("r", 5);

        svg.append("path")
            .datum(this.data) // 10. Binds data to the line
            .attr("class", "line sensor_two") // Assign a class for styling
            .attr("d", sensorTwoLine); // 11. Calls the line generator

        // 12. Appends a circle for each datapoint
        svg.selectAll(".dot.sensor_two")
            .data(this.data)
          .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot sensor_two") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(i) })
            .attr("cy", function(d) { return yScale(d.sensor_two) })
            .attr("r", 5);
    }

    renderSummaryChart() {
        return (
            <svg id="summary-chart" ref={node => this.node = node}
                width={500} height={500}>
            </svg>
        )
    }

    render() {
        if (!LOCAL) {
            return <div className="inner">-- under construction --</div>
        }
        return this.renderSummaryChart();
    }
}

module.exports = SaltLevel;
