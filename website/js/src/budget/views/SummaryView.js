import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import BudgetSummary from '../components/Summary';
import SummarySelector from '../components/SummarySelector'

const SummaryView = () => {
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    return <div className="view-summary">
        <SummarySelector
            onYearChanged={setYear}
            onMonthChanged={setMonth}
            selectedYear={year}
            selectedMonth={month}
        />
        <BudgetSummary
            year={year}
            month={month}
        />
    <div/>
}

SummaryView.defaultProps = {};
SummaryView.propTypes = {};

export default SummaryView;