import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import BudgetData from '../BudgetData';
import { parseDateString } from '../../utils';


const BudgetTransactions = (props) => {
    const [transactions, setTransactions] = useState(null);

    useEffect(() => {
        if (props.year === null || props.month === null) {
            return;
        }
        BudgetData.entries(props.year, props.month).then(
            (entries) => {
                setTransactions(entries);
            }
        )
    }, [props.year, props.month])

    if (transactions !== null) {
        transactions.sort((a, b) => parseDateString(a.transaction_date) - parseDateString(b.transaction_date))
    }
    return (
        <div>
            {transactions && transactions.map((s) => (
                <div>{`${s.transaction_date} | ${s.description} | ${s.amount}`}</div>
            ))}
        </div>
    )
}

BudgetTransactions.defaultProps = {
    year: null,
    month: null,
};

BudgetTransactions.propTypes = {
    year: PropTypes.number,
    month: PropTypes.number,
};

export default BudgetTransactions;