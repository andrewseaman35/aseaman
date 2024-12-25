import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

const YEARS = [2021, 2022, 2022, 2023, 2024];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SummarySelector = (props) => {
    const yearSelectors = (
        <div>
            {YEARS.map((year) => (
                <button
                    class={`${props.selectedYear === year ? 'selected' : ''}`}
                    onClick={() => props.onYearChanged(props.selectedYear === year ? null : year)}
                >{year}</button>
            ))}
        </div>
    );
    const monthSelectors = (
        <div>
            {MONTHS.map((month) => (
                <button
                    class={`${props.selectedMonth === month ? 'selected' : ''}`}
                    onClick={() => props.onMonthChanged(props.selectedMonth === month ? null : month)}
                >{month}</button>
            ))}
        </div>
    );
    return <div>
        {yearSelectors}
        {monthSelectors}
    </div>
}

SummarySelector.defaultProps = {
    selectedYear: null,
    selectedMonth: null,
};

SummarySelector.propTypes = {
    selectedYear: PropTypes.number,
    selectedMonth: PropTypes.number,
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default SummarySelector;