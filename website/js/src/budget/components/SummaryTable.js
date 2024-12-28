import React from "react";

import { ColorCollection, findColorInRange } from '../color';

const MONTHS = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",  "December",
];


const SummaryTable = (props) => {
    const renderTableHeader = (firstColumn, categories) => {
        return (
            <thead>
                <tr>
                    <th><span>{firstColumn}</span></th>
                    {
                        categories.map((cat) => (
                            <th><span>{cat}</span></th>
                        ))
                    }
                </tr>
            </thead>
        )
    }

    const renderSummaryByMonth = (categories, monthly) => {
        const categoryTotalByMonth = {};
        const categorizedByMonth = {};
        const rangeByCategory = {};
        console.log(monthly)

        for (let [month, entries] of Object.entries(monthly)) {
            categoryTotalByMonth[month] = {};
            categorizedByMonth[month] = {};
            entries.forEach((entry) => {
                if (!(entry.category in categorizedByMonth[month])) {
                    categorizedByMonth[month][entry.category] = [];
                    categoryTotalByMonth[month][entry.category] = 0;
                }
                categoryTotalByMonth[month][entry.category] += Number(entry.amount);
                categorizedByMonth[month][entry.category].push(entry);
            });
        }
        for (let [month, byCategory] of Object.entries(categoryTotalByMonth)) {
            for (let [category, total] of Object.entries(byCategory)) {
                total = Math.abs(total);
                if (!(category in rangeByCategory)) {
                    rangeByCategory[category] = {
                        min: 999999999,
                        max: -999999999,
                    };
                }
                if (total < rangeByCategory[category].min) {
                    rangeByCategory[category].min = total;
                }
                if (total > rangeByCategory[category].max) {
                    rangeByCategory[category].max = total;
                }
            }
        }

        return (
            <tbody className="monthly">
                {
                    MONTHS.map((label, index) => (
                        <tr>
                            <td>{label}</td>
                            {
                                categories.map((category) => {
                                    const value = categoryTotalByMonth[index + 1]?.[category];
                                    const data = !!value ? Math.abs(value.toFixed(2)) : '--';
                                    let color = ColorCollection.WHITE;
                                    if (category in rangeByCategory) {
                                        color = !!value ? findColorInRange(
                                            rangeByCategory[category].min,
                                            rangeByCategory[category].max,
                                            value
                                        ) : color;
                                    }
                                    return <td style={{backgroundColor: color.toString()}}>{data}</td>;
                                })
                            }
                        </tr>
                    ))
                }
            </tbody>
        )
    }

    return (
        <>
            <table>
                {renderTableHeader("Month", props.categories)}
                {renderSummaryByMonth(props.categories, props.monthly)}
            </table>
        </>
    )
}

export default SummaryTable;