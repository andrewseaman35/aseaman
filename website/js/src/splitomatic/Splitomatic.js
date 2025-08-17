import { event } from 'jquery';
import React, { useEffect, useState, } from 'react';

import CreateEventView from './views/CreateEventView';
import InitialView from './views/InitialView';
import EventHomeView from './views/EventHomeView';
import ReceiptDetailView from './views/ReceiptDetailView';
import SelectUserView from './views/SelectUserView';

import { createEvent, fetchEvent, uploadReceipt } from './api';
import { getCookie, setCookie } from '../utils';

const COOKIES = Object.freeze({
    EVENT_ID: 'splitomaticEventId',
    USER_ID: 'splitomaticUserId',
});

class Splitomatic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentState: 'initial',
            eventId: null,
            user: null,
        };

        this.usersById = {};

        // this.refreshCookies();
        this.refreshCurrentState();
    }

    reset() {
        console.log("Resetting Splitomatic state");
        setCookie(COOKIES.EVENT_ID, null, null);
        setCookie(COOKIES.USER_ID, null, null);

        this.usersById = {};
        this.setState({
            currentState: 'initial',
            eventId: null,
            user: null,
        });
    }

    setupForEvent(eventId, userId) {
        console.log("Setting up Splitomatic for event:", eventId, "and user:", userId);
        fetchEvent(eventId).then((response) => {
            if (!response || !response.id) {
                console.error("Invalid response from fetchEvent:", response);
                return;
            }

            console.log("Event fetched successfully:", response);
            this.usersById = response.users.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {});
            console.log("Users by ID:", this.usersById);

            const currentState = userId ? 'eventHome' : 'selectUser';

            setCookie(COOKIES.EVENT_ID, response.id, null);
            this.setState({
                currentState: currentState,
                eventId: response.id,
                eventName: response.name,
                userId: userId,
                users: response.users
            });
        }).catch((error) => {
            console.error("Error fetching event:", error);
        });
    }

    refreshCurrentState() {
        const eventId = getCookie(COOKIES.EVENT_ID);
        const userId = getCookie(COOKIES.USER_ID);

        console.log(eventId, userId);
        if (!eventId) {
            return this.reset();
        }

        this.setupForEvent(eventId, userId);
    }

    refreshCookies() {
        console.log("Refreshing cookies");
        console.log("Current cookies:", getCookie(COOKIES.EVENT_ID));
        this.setState({
            eventId: getCookie(COOKIES.EVENT_ID),
            user: getCookie(COOKIES.USER_ID),
        });
    }

    transitionTo(state) {
        console.log(`Transitioning to state: ${state}`);
        this.setState({
            currentState: state,
        });
    }

    stateMachine() {
        return {
            initial: {
                view: InitialView,
                description: "Initial state of the Splitomatic. Allows the user to create a new event or join an existing one.",
                actions: {
                    createEvent: () => {
                        console.log("Event created in initial state");
                        this.transitionTo('createEvent');
                    },
                    joinEvent: ({ joinCode }) => {
                        console.log("Event joined in initial state: " + joinCode);
                        this.setupForEvent(joinCode, null);
                    },
                }
            },
            createEvent: {
                view: CreateEventView,
                description: "Create a new event. Allows users to input the event name and create it.",
                actions: {
                    createEvent: ({ eventName, users }) => {
                        console.log("Creating event with name: " + eventName);
                        createEvent({ eventName, users }).then((response) => {
                            console.log("Event created successfully:", response);
                            setCookie(COOKIES.EVENT_ID, response.id, null);
                            this.transitionTo('eventHome');
                        }).catch((error) => {
                            console.error("Error creating event:", error);
                        });
                    }
                }
            },
            selectUser: {
                view: SelectUserView,
                description: "Select a user to associate with the event. Loads all associated Users to prepopulate the dropdown.",
                actions: {
                    selectUser: (userId) => {
                        console.log("User selected: " + userId);
                        setCookie(COOKIES.USER_ID, userId, null);
                        this.setState({ user: userId });
                        this.transitionTo('eventHome');
                    }
                }
            },
            eventHome: {
                view: EventHomeView,
                description: "Join an existing event. Loads all associated Users to prepopulate the dropdown.",
                actions: {
                    viewReceipt: (receiptId) => {
                        console.log("Viewing receipt " + receiptId);
                        this.transitionTo('receiptDetail');
                    },
                    uploadReceipt: (eventId, content, fileType) => {
                        console.log("Uploading receipt");
                        console.log("Event ID: " + eventId);
                        console.log("File Type: " + fileType);
                        uploadReceipt(eventId, content, fileType)
                            .then((response) => {
                                console.log("Receipt uploaded successfully");
                                console.log(response);
                                // Optionally, refresh the event data or transition to another state
                            })
                            .catch((error) => {
                                console.error("Error uploading receipt:", error);
                            });
                        // Logic to upload a receipt
                    },
                    reset: () => {
                        console.log("Resetting Splitomatic state");
                        this.reset();
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
        console.log("Splitomatic component rendered: ", this.state);
        const state = this.stateMachine()[this.state.currentState];
        console.log(`Current state: ${this.state.currentState}`);
        if (!state) {
            console.error(`State ${this.state.currentState} not found in state machine.`);
            return <div>Error: State not found</div>;
        }
        console.log(`Rendering view: ${state.view.name} with state data:`, state);
        console.log(this.state)
        const ViewComponent = state.view;

        return (
            <div className="splitomatic-container">
                <ViewComponent
                    transitionTo={this.transitionTo.bind(this)}
                    actions={state.actions}
                    {...state}
                    {...this.state}  // Pass current state data to the view
                />
            </div>
        );
    }
}

module.exports = Splitomatic;