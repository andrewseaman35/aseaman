import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import BudgetTransactions from '../components/Transactions';
import SummarySelector from '../components/SummarySelector'

const TransactionView = (props) => {
    return (
        <div className="view-summary">
            <SummarySelector
                showYears={true}
                showMonths={true}
                onYearChanged={props.onYearChanged}
                onMonthChanged={props.onMonthChanged}
                selectedYear={props.year}
                selectedMonth={props.month}
            />
            <BudgetTransactions
                year={props.year}
                month={props.month}
            />
        </div>
    );
}

TransactionView.defaultProps = {
    year: null,
    month: null,
};
TransactionView.propTypes = {
    year: PropTypes.number,
    month: PropTypes.number,
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default TransactionView;