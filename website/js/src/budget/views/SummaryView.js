import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import { fetchSummary } from '../api';

import SummaryTable from '../components/SummaryTable';
import BudgetDateSelector from '../components/BudgetDateSelector'

const SummaryView = (props) => {
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
                            <SummaryTable categories={summaries.categories} monthly={summaries.monthly}/>
                        </div>
                    ) : <div>Nothing to render</div>
                }
            </div>
        </div>
    );
}

SummaryView.defaultProps = {
    year: null,
    month: null,
};
SummaryView.propTypes = {
    year: PropTypes.number,
    month: PropTypes.number,
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default SummaryView;