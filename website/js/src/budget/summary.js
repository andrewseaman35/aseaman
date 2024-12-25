import React, { useEffect, useState, } from 'react';
import $ from 'jquery';

import { fetchEntries } from './api';


const BudgetSummary = (props) => {
    console.log("Rendering")
    const [summaries, setSummaries] = useState(null);

    useEffect(() => {
        fetchEntries({
            transaction_month: 9
        }).then(
            (response) => {
                setSummaries(response.entries);
            }
        )
    }, [])

    console.log(summaries)
    return (
        <div>
            <div>summaries</div>
            {summaries && summaries.map((s) => (
                <div>{`${s.transaction_date} | ${s.description} | ${s.amount}`}</div>
            ))}
        </div>
    )
}

export default BudgetSummary;