import React from 'react';
import $ from 'jquery';

import { getAPIUrl } from './utils';


const HAPTIC_APPLICATION_NUMBER = '15655488';
const PEDIGREE_APPLICATION_NUMBER = '16948311';


class Patent extends React.Component {
    constructor() {
        super();
        this.renderStatusTable = this.renderStatusTable.bind(this);
        this.retrievePatentStatus = this.retrievePatentStatus.bind(this);

        this.state = {
            displayError: false,
            pending: true,
            hapticPatentStatus: null,
            pedigreePatentStatus: null,
        };
    }

    componentDidMount() {
        this.retrievePatentStatus(HAPTIC_APPLICATION_NUMBER)
            .then(
                (response) => { this.setState({ hapticPatentStatus: response.data }); },
                () => { this.setState({ displayError: true, }); })
            .then(() => { this.setState({ pending: false }); });
        this.retrievePatentStatus(PEDIGREE_APPLICATION_NUMBER)
            .then(
                (response) => { this.setState({ pedigreePatentStatus: response.data }); },
                () => { this.setState({ displayError: true, }); })
            .then(() => { this.setState({ pending: false }); });
    }

    retrievePatentStatus(applicationNumber) {
        return $.ajax({
            type: 'GET',
            url: getAPIUrl('state_check'),
            data: {
                state_id: `patent_application-${applicationNumber}`,
            },
        }).promise();
    }

    renderError() {
        return (
            <p className="error-message">Something happened while retrieving the patent status!</p>
        )
    }

    renderStatusTable() {
        if (this.state.displayError) {
            return this.renderError();
        }
        const { hapticPatentStatus, pedigreePatentStatus } = this.state;
        return (
            <div>
                <p>
                    This little table down here shows the most updated status that I've retrieved.
                </p>
                <div id="patent-state">
                    <table id="state-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>App# {HAPTIC_APPLICATION_NUMBER}</th>
                                <th>App# {PEDIGREE_APPLICATION_NUMBER}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Patent exists?</td>
                                <td>{hapticPatentStatus && hapticPatentStatus.available ? ' yes!' : ' no'}</td>
                                <td>{pedigreePatentStatus && pedigreePatentStatus.available ? ' yes!' : ' no'}</td>
                            </tr>
                            <tr>
                                <td>Patent Number</td>
                                <td>{hapticPatentStatus && hapticPatentStatus.patent_number}</td>
                                <td>{pedigreePatentStatus && pedigreePatentStatus.patent_number}</td>
                            </tr>
                            <tr>
                                <td>Patent status</td>
                                <td>{hapticPatentStatus && hapticPatentStatus.app_status}</td>
                                <td>{pedigreePatentStatus && pedigreePatentStatus.app_status}</td>
                            </tr>
                            <tr>
                                <td>Last updated</td>
                                <td>{hapticPatentStatus && hapticPatentStatus.last_updated}</td>
                                <td>{pedigreePatentStatus && pedigreePatentStatus.last_updated}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    <h1>Patent</h1>
                    <p>
                        This page was initially set up for me to track the status of a patent application
                        that I had open. Since I set it up, the application was approved (yay!) so this page
                        is somewhat useless. Admittedly, it wasn't terribly useful before. However, since then
                        (the second "then"), I've been on another patent application, so the tiny amount of
                        value it provided is back in business!
                    </p>
                    <p>
                        For this to work, I had set up a Lambda function that checks the status of the
                        application once a day. The Lambda function would hit the <a
                            href="https://developer.uspto.gov/api-catalog/ped"
                            rel="noopener noreferrer"
                            target="_blank"
                        >Patent Examination Data System API</a> and check for updates to the application
                        status. It also stores some of the useful data to a DynamoDB table for easier reference.
                    </p>
                    <p>
                        I don't have a page up yet, but eventually I'll have some information about
                        the little framework I've built that allows me to easily set up these sorts of
                        things. Until then, you can check out the source <a
                            href="https://github.com/andrewseaman35/automations/tree/master/lambda_crons"
                            rel="noopener noreferrer"
                            target="_blank"
                        >here</a>.
                    </p>

                    {this.renderStatusTable()}

                    <p>
                        If you're interested, you can look at the granted patent <a
                            href="http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PALL&p=1&u=%2Fnetahtml%2FPTO%2Fsrchnum.htm&r=1&f=G&l=50&s1=10304298.PN.&OS=PN/10304298&RS=PN/10304298"
                            rel="noopener noreferrer"
                            target="_blank"
                        >here</a>.
                    </p>
                    <a href="index">Go back home</a>
                </div>
            </div>
        )
    }
}


module.exports = Patent;
