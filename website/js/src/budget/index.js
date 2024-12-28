import React, {useState} from 'react';

import { uploadBudgetFile } from './api';

import FileUploader from '../components/FileUploader';
import ViewSelector from './components/ViewSelector';
import SummaryView from './views/SummaryView';
import TransactionView from './views/TransactionView';
import SettingsView from './views/SettingsView';
import VisualizationView from './views/VisualizationView';

const VIEWS = ['summary', 'visualizations', 'transactions', 'upload', 'settings'];

const BudgetPage = (props) => {
    const [view, setView] = useState(null);
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);

    const renderView = (view) => {
        if (view === "summary") {
            return <SummaryView
                year={year}
                month={month}
                onYearChanged={setYear}
                onMonthChanged={setMonth}
            />
        } else if (view === "visualizations") {
            return <VisualizationView
                year={year}
                month={month}
                onYearChanged={setYear}
                onMonthChanged={setMonth}
            />
        } else if (view === "upload") {
            return <FileUploader
                inputId="budget-file"
                upload={uploadBudgetFile}
            />
        } else if (view === "transactions") {
            return <TransactionView
                year={year}
                month={month}
                onYearChanged={setYear}
                onMonthChanged={setMonth}
            />
        } else if (view === "settings")
            return <SettingsView />
        return null;
    }

    return (
        <div className="budget-content">
            <ViewSelector
                onViewChanged={setView}
                views={VIEWS}
            />
            {renderView(view)}
        </div>
    )
};

export default BudgetPage;