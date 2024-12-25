import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

const YEARS = [2021, 2022, 2022, 2023, 2024];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SummarySelector = (props) => {

    const yearSelectors = (
        <div>
            {YEARS.map((year) => <button onClick={() => props.onYearChanged(year)}>{year}</button>)}
        </div>
    );
    const monthSelectors = (
        <div>
            {MONTHS.map((month) => <button onClick={() => props.onMonthChanged(month)}>{month}</button>)}
        </div>
    );
    return <div>
        {yearSelectors}
        {monthSelectors}
    </div>
}

SummarySelector.defaultProps = {
};

SummarySelector.propTypes = {
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default SummarySelector;