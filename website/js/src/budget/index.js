import React, {useState} from 'react';
import $ from 'jquery';

import FileUploader from '../components/FileUploader';
import SummaryView from './views/SummaryView';
import ViewSelector from './components/ViewSelector';

const BudgetPage = (props) => {
    console.log("Rendering")
    const [view, setView] = useState(null);

    const renderView = (view) => {
        if (view === "summary") {
            return <SummaryView />
        } else if (view === "upload") {
            return <FileUploader />
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