import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { organizeByMonth, indexToMonthLabel } from '../util';
import BudgetData from '../BudgetData';

import ItemSelector, {YEAR_SELECTOR_ITEMS, selectorItem} from '../components/ItemSelector';



const VisualizationView = (props) => {
    const [summaries, setSummaries] = useState(null);
    const [selectedView, setSelectedView] = useState("all");

    useEffect(() => {
        if (props.year === null) {
            return;
        }
        BudgetData.summaries(props.year).then(
            (response) => {
                setSummaries(response);
            }
        )
    }, [props.year, props.month])

    const renderSelectors = () => (
        <ItemSelector
            items={[
                YEAR_SELECTOR_ITEMS,
                [selectorItem('All', 'all'), selectorItem('Food', 'food')],
            ]}
            selectedValues={[props.year, selectedView]}
            handlers={[
                props.onYearChanged,
                setSelectedView
            ]}
        />
    );

    if (!!!summaries) {
        return (
            <div className="view-summary">
                {renderSelectors()}
            </div>
        )
    }
    const {
        categoryTotalByMonth,
        categorizedByMonth,
        rangeByCategory,
        totalByMonth,
    } = organizeByMonth(summaries.monthly);

    let data = [];
    if (selectedView === "all") {
        for (let i = 1; i <= 12; i += 1) {
            data.push({
                name: indexToMonthLabel(i),
                total: Number(totalByMonth[i].toFixed(2)),
            })
        }
    } else if (selectedView === "food") {
        for (let i = 1; i <= 12; i += 1) {
            let total = 0;
            Object.entries(categoryTotalByMonth[i]).forEach(([k, v]) => {
                if (["eating out", "groceries", "deivery food", "costco"].includes(k)) {
                    total += v;
                }
            })
            data.push({
                name: indexToMonthLabel(i),
                total: total.toFixed(2),
            })
        }
    }


    return (
        <div className="view-summary">
            {renderSelectors()}
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