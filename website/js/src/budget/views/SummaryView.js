import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import BudgetSummary from '../components/Summary';
import BudgetDateSelector from '../components/BudgetDateSelector'

const SummaryView = (props) => {
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
                <BudgetSummary
                    year={props.year}
                    month={props.month}
                />
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