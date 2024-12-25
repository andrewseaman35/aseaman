import React, {useState} from 'react';
import $ from 'jquery';

import FileUploader from '../components/FileUploader';
import SummaryView from './views/SummaryView';


const BudgetPage = (props) => {
    console.log("Rendering")

    return (
        <>
            <SummaryView/>
            <FileUploader />
        </>
    )
};

export default BudgetPage;