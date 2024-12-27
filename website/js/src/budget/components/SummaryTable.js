import React from "react";


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
                                    return <td>{data}</td>;
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