import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import { fetchSummary } from '../api';

import SummaryTable from '../components/SummaryTable';
import BudgetDateSelector from '../components/BudgetDateSelector'

const SummaryView = (props) => {
    const [summaries, setSummaries] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.year === null && props.month === null) {
            return;
        }
        setLoading(true);
        const args = {};
        if (props.year !== null) {
            args.transaction_year = props.year;
        }
        if (props.month !== null) {
            args.transaction_month = props.month;
        }
        fetchSummary(args).then(
            (response) => {
                setLoading(false);
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
                    ) : null
                }
                {
                    loading ? (
                        <div className='view-summary'>
                            <div className="loading-container">
                                <div className="animated-ellipsis">
                                    Loading<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
                                </div>
                            </div>
                        </div>
                    ) : null
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