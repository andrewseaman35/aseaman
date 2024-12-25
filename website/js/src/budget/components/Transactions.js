import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { fetchEntries } from '../api';
import { parseDateString } from '../../utils';


const BudgetTransactions = (props) => {
    console.log("Rendering")
    const [transactions, setTransactions] = useState(null);

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
        fetchEntries(args).then(
            (response) => {
                setTransactions(response.entries);
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