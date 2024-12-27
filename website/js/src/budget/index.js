import React, {useEffect, useState} from 'react';

import { fetchConfig, uploadBudgetFile } from './api';

import FileUploader from '../components/FileUploader';
import ViewSelector from './components/ViewSelector';
import SummaryView from './views/SummaryView';
import TransactionView from './views/TransactionView';
import SettingsView from './views/SettingsView';

const BudgetPage = (props) => {
    console.log("Rendering")
    const [config, setConfig] = useState(null);
    const [view, setView] = useState(null);
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);

    useEffect(() => {
        fetchConfig().then(
            (response) => { setConfig(response) }
        )
    }, []);

    const renderView = (view) => {
        if (view === "summary") {
            return <SummaryView
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
            />
            {renderView(view)}
        </div>
    )
};

export default BudgetPage;