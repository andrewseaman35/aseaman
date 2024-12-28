import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { fetchSummary } from '../api';
import { organizeByMonth, indexToMonthLabel } from '../util';

import BudgetDateSelector from '../components/BudgetDateSelector'

const VisualizationView = (props) => {
    const [summaries, setSummaries] = useState(null);

    useEffect(() => {
        if (props.year === null && props.month === null) {
            return;
        }
        const args = {};
        if (props.year !== null) {
            args.transaction_year = props.year;
        }
        if (props.month !== null) {
            args.transaction_month = props.month;
        }
        fetchSummary(args).then(
            (response) => {
                setSummaries(response);
            }
        )
    }, [props.year, props.month])

    if (!!!summaries) {
        return (
            <div className="view-summary">
                <BudgetDateSelector
                    showYears={true}
                    showMonths={false}
                    onYearChanged={props.onYearChanged}
                    onMonthChanged={props.onMonthChanged}
                    selectedYear={props.year}
                    selectedMonth={props.month}
                />
            </div>
        )
    }
    const {
        categoryTotalByMonth,
        categorizedByMonth,
        rangeByCategory,
        totalByMonth,
    } = organizeByMonth(summaries.monthly);

    console.log(totalByMonth);
    const data = [];
    for (let i = 1; i <= 12; i += 1) {
        data.push({
            name: indexToMonthLabel(i),
            total: Number(totalByMonth[i].toFixed(2)),
        })
    }
    console.log(data);

    return (
        <div className="view-summary">
            <BudgetDateSelector
                showYears={true}
                showMonths={false}
                onYearChanged={props.onYearChanged}
                onMonthChanged={props.onMonthChanged}
                selectedYear={props.year}
                selectedMonth={props.month}
            />
            <div className="view-content">
                <h3>Summaries</h3>
                {
                    summaries ? (
                        <div>
                            <LineChart width={800} height={400} data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis dataKey="total" />
                                <Tooltip />
                                <CartesianGrid stroke="#f5f5f5" />
                                <Line type="monotone" dataKey="total" stroke="#ff7300" yAxisId={0} />
                            </LineChart>
                        </div>
                    ) : <div>Nothing to render</div>
                }
            </div>
        </div>
    );
}

VisualizationView.defaultProps = {
    year: null,
    month: null,
};
VisualizationView.propTypes = {
    year: PropTypes.number,
    month: PropTypes.number,
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default VisualizationView;