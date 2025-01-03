import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

const YEARS = [2021, 2022, 2022, 2023, 2024];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const BudgetDateSelector = (props) => {
    const yearSelectors = (
        <div class="selector-group">
            {YEARS.map((year) => (
                <button
                    className={`${props.selectedYear === year ? 'selected' : ''}`}
                    onClick={() => props.onYearChanged(props.selectedYear === year ? null : year)}
                >{year}</button>
            ))}
        </div>
    );
    const monthSelectors = (
        <div class="selector-group">
            {MONTHS.map((month) => (
                <button
                    className={`${props.selectedMonth === month ? 'selected' : ''}`}
                    onClick={() => props.onMonthChanged(props.selectedMonth === month ? null : month)}
                >{month}</button>
            ))}
        </div>
    );
    console.log(props);
    return (
        <div className="budget-date-selector">
            {props.showYears && yearSelectors}
            {props.showMonths && monthSelectors}
        </div>
    )
}

BudgetDateSelector.defaultProps = {
    showYears: true,
    showMonths: true,
    selectedYear: null,
    selectedMonth: null,
};

BudgetDateSelector.propTypes = {
    showYears: PropTypes.bool.isRequired,
    showMonths: PropTypes.bool.isRequired,
    selectedYear: PropTypes.number,
    selectedMonth: PropTypes.number,
    onYearChanged: PropTypes.func.isRequired,
    onMonthChanged: PropTypes.func.isRequired,
};

export default BudgetDateSelector;