import React from "react";

import { ColorCollection, findColorInRange } from '../color';
import { organizeByMonth, MONTHS } from '../util';


const SummaryTable = (props) => {
    const renderTableHeader = (firstColumn, categories) => {
        return (
            <thead>
                <tr>
                    <th><span>{firstColumn}</span></th>
                    {
                        categories.map((cat) => (
                            <th key={cat}><span>{cat}</span></th>
                        ))
                    }
                </tr>
            </thead>
        )
    }

    const renderSummaryByMonth = (categories, monthly) => {
        const {
            categoryTotalByMonth,
            categorizedByMonth,
            rangeByCategory,
        } = organizeByMonth(monthly);
        return (
            <tbody className="monthly">
                {
                    MONTHS.map((label, index) => (
                        <tr key={label}>
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
                                    return <td style={{backgroundColor: color.toString()}} key={category}>{data}</td>;
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