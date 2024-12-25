import React from 'react';
import $ from 'jquery';

import FileUploader from '../components/FileUploader';
import BudgetSummary from './summary';


export default class BudgetPage extends React.Component {


    render() {
        console.log("Rendering")
        return (
            <>
                <BudgetSummary />
                <FileUploader />
            </>
        )
    }
}