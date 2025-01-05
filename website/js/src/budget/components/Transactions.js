import React from 'react';
import PropTypes from 'prop-types';

import { parseDateString } from '../../utils';


const BudgetTransactions = (props) => {
    if (props.transactions !== null) {
        props.transactions.sort((a, b) => parseDateString(a.transaction_date) - parseDateString(b.transaction_date))
    }
    return (
        <div>
            {props.transactions && props.transactions.map((s) => (
                <div key={s.id}>{`${s.transaction_date} | ${s.description} | ${s.amount}`}</div>
            ))}
        </div>
    )
}

BudgetTransactions.defaultProps = {
    transactions: null,
};

BudgetTransactions.propTypes = {
    transactions: PropTypes.array.isRequired,
};

export default BudgetTransactions;