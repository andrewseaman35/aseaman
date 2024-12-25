import React, {useState} from 'react';
import $ from 'jquery';

import FileUploader from '../components/FileUploader';
import ViewSelector from './components/ViewSelector';
import SummaryView from './views/SummaryView';
import TransactionView from './views/TransactionView';

const BudgetPage = (props) => {
    console.log("Rendering")
    const [view, setView] = useState(null);
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);

    const renderView = (view) => {
        if (view === "summary") {
            return <SummaryView />
        } else if (view === "upload") {
            return <FileUploader
                year={year}
                month={month}
                onYearChanged={setYear}
                onMonthChanged={setMonth}
            />
        } else if (view === "transactions") {
            return <TransactionView
                year={year}
                month={month}
                onYearChanged={setYear}
                onMonthChanged={setMonth}
            />
        }
        return null;
    }

    return (
        <div className="budget-content">
            <ViewSelector
                onViewChanged={setView}
            />
            {renderView(view)}
        </div>
    )
};

export default BudgetPage;