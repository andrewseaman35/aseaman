import { event } from 'jquery';
import React, { useEffect, useState, } from 'react';

import CreateEventView from './views/CreateEventView';
import InitialView from './views/InitialView';
import EventHomeView from './views/EventHomeView';
import ReceiptDetailView from './views/ReceiptDetailView';

import { createEvent, fetchEvent } from './api';

class Splitomatic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentState: 'initial',
        };
    }

    transitionTo(state, options) {
        console.log(`Transitioning to state: ${state}`);
        this.setState({ currentState: state });
    }

    stateMachine() {
        return {
            initial: {
                view: InitialView,
                description: "Initial state of the Splitomatic. Allows the user to create a new event or join an existing one.",
                actions: {
                    createEvent: () => {
                        console.log("Event created in initial state");

                        createEvent().then((response) => {
                            console.log("Event created successfully:", response);
                            const eventId = response.id; // Assuming the response contains the event ID
                            this.transitionTo('eventCreation', { eventId });
                        }).catch((error) => {
                            console.error("Error creating event:", error);
                        });
                    },
                    joinEvent: () => {
                        console.log("Event joined in initial state");
                        this.transitionTo('eventHome');
                    },
                }
            },
            eventCreation: {
                view: CreateEventView,
                description: "Enable the creation of a new event. Asks for initial user name and event name.",
                actions: {
                    saveEvent: () => {
                        console.log("Event saved in create state");
                        this.transitionTo('eventHome');
                    }
                }
            },
            eventHome: {
                view: EventHomeView,
                description: "Join an existing event. Loads all associated Users to prepopulate the dropdown.",
                view: EventHomeView,
                actions: {
                    viewReceipt: (receiptId) => {
                        console.log("Viewing receipt " + receiptId);
                        this.transitionTo('receiptDetail', { receiptId });
                    }
                }
            },
            receiptDetail: {
                view: ReceiptDetailView,
                description: "View details of a specific receipt. Allows users to claim items.",
                actions: {
                    claimItem: (itemId) => {
                        console.log("Claiming item " + itemId);
                        // Logic to claim the item
                    },
                    unclaimItem: (itemId) => {
                        console.log("Unclaiming item " + itemId);
                        // Logic to unclaim the item
                    }
                }
            }
        };
    }

    render() {
        console.log("Splitomatic component rendered");
        const state = this.stateMachine()[this.state.currentState];
        console.log(`Current state: ${this.state.currentState}`);
        if (!state) {
            console.error(`State ${this.state.currentState} not found in state machine.`);
            return <div>Error: State not found</div>;
        }
        const ViewComponent = state.view;

        return (
            <div className="splitomatic-container">
                <ViewComponent
                    transitionTo={this.transitionTo.bind(this)}
                    actions={state.actions}
                    description={state.description}
                />
            </div>
        );
    }
}

module.exports = Splitomatic;