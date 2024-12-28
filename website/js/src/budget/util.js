const MONTHS = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",  "December",
];

const organizeByMonth = (monthly) => {
    const categoryTotalByMonth = {};
    const categorizedByMonth = {};
    const rangeByCategory = {};
    const totalByMonth = {};

    for (let [month, entries] of Object.entries(monthly)) {
        categoryTotalByMonth[month] = {};
        categorizedByMonth[month] = {};
        totalByMonth[month] = 0;
        entries.forEach((entry) => {
            if (!(entry.category in categorizedByMonth[month])) {
                categorizedByMonth[month][entry.category] = [];
                categoryTotalByMonth[month][entry.category] = 0;
            }
            totalByMonth[month] = totalByMonth[month] + Number(entry.amount);
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
    return {
        categoryTotalByMonth,
        categorizedByMonth,
        rangeByCategory,
        totalByMonth,
    }
}


const indexToMonthLabel = index => MONTHS[index - 1];

module.exports = {
    indexToMonthLabel,
    organizeByMonth,
}