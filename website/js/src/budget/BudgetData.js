import { fetchEntries, fetchSummary } from "./api";

class BudgetData {
    // By month, by year:
    // {2024: {8: [entry]}}
    static _entries = {};
    static _summaries = {};

    static entries(year, month) {
        if (year == null || month == null) {
            throw new Error("year and month required to load entries");
        }

        const yearEntries = year in BudgetData._entries ? BudgetData._entries[year] : null;
        if (yearEntries !== null) {
            if (month in yearEntries) {
                return new Promise((resolve, reject) => {
                    resolve(yearEntries[month]);
                });
            }
        }
        return fetchEntries({transaction_year: year, transaction_month: month}).then(
            (entries) => {
                if (!(year in BudgetData._entries)) {
                    BudgetData._entries[year] = {};
                }
                BudgetData._entries[year][month] = entries.entries;
                return BudgetData._entries[year][month];
            })
    }

    static summaries(year) {
        if (year == null) {
            throw new Error("year required to load summaries");
        }

        const yearSummaries = year in BudgetData._summaries ? BudgetData._summaries[year] : null;
        if (yearSummaries) {
            return new Promise((resolve, reject) => {
                resolve(yearSummaries);
            });
        }
        return fetchSummary({transaction_year: year}).then(
            (summaries) => {
                if (!(year in BudgetData._summaries)) {
                    BudgetData._summaries[year] = {};
                }
                BudgetData._summaries[year] = summaries;

                if (!(year in BudgetData._entries)) {
                    BudgetData._entries[year] = {};
                }
                const entriesByMonth = _.reduce(summaries.entries, (acc, entry) => {
                    if (!(entry.transaction_month in acc)) {
                        acc[entry.transaction_month] = [];
                    }
                    acc[entry.transaction_month].push(entry);
                    return acc;
                }, {})

                Object.entries(entriesByMonth).forEach(([m, e]) => {
                    BudgetData._entries[year][m] = e;
                });
                return summaries;
            });
    }
}

export default BudgetData;