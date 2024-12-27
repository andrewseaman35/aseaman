import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

import SummaryTable from '../components/SummaryTable';

import { fetchSummary } from '../api';


const BudgetSummary = (props) => {
    console.log("Rendering")
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

    if (summaries == null) {
        return <div>Nothing to render</div>
    }
    return (
        <div>
            <SummaryTable categories={summaries.categories} monthly={summaries.monthly}/>
        </div>
    )
}

BudgetSummary.defaultProps = {
    year: null,
    month: null,
};

BudgetSummary.propTypes = {
    year: PropTypes.number,
    month: PropTypes.number,
};

export default BudgetSummary;