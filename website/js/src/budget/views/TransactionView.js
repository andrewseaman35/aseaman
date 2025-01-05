import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import BudgetData from '../BudgetData';

import BudgetTransactions from '../components/Transactions';
import ItemSelector, { MONTH_SELECTOR_ITEMS, YEAR_SELECTOR_ITEMS } from '../components/ItemSelector';

const TransactionView = (props) => {
    const [transactions, setTransactions] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.year === null || props.month === null) {
            return;
        }
        setLoading(true);
        BudgetData.entries(props.year, props.month).then(
            (entries) => {
                setTransactions(entries);
                setLoading(false);
            }
        )
    }, [props.year, props.month])

    return (
        <div className="view-summary">
            <ItemSelector
                items={[
                    YEAR_SELECTOR_ITEMS,
                    MONTH_SELECTOR_ITEMS,
                ]}
                selectedValues={[
                    props.year,
                    props.month,
                ]}
                handlers={[
                    props.onYearChanged,
                    props.onMonthChanged,
                ]}
            />
            <div className="view-content">
                <h3>Transactions</h3>
                {
                    transactions && !loading ? (
                        <BudgetTransactions
                            transactions={transactions}
                        />
                    ): null
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