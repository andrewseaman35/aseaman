import React from 'react';
import _ from 'lodash';

import AUTH from './auth';
import { Icon, Modal, WhiskyForm, WhiskyShelf } from './components/';
import { getCurrentShelf } from './components/whisky/api';


class Whisky extends React.Component {
    constructor() {
        super();

        this.onWhiskyAdded = this.onWhiskyAdded.bind(this);
        this.onWhiskyUpdated = this.onWhiskyUpdated.bind(this);
        this.onWhiskyRemoved = this.onWhiskyRemoved.bind(this);
        this.onShowWhiskyForm = this.onShowWhiskyForm.bind(this);
        this.onHideWhiskyForm = this.onHideWhiskyForm.bind(this);
        this.onStartEditWhisky = this.onStartEditWhisky.bind(this);

        this.getSelectedWhisky = this.getSelectedWhisky.bind(this);
        this.isAuthed = AUTH.getApiKey();

        this.state = {
            whiskiesByDistAndName: {},
            whiskyFormDisplayed: false,
            selectedWhisky: {
                distillery: null,
                name: null,
            },
            failed: false,
            loadingShelf: true,
            items: null,
        }
    }

    componentDidMount() {
        getCurrentShelf()
            .then(
                (response) => {
                    this.setState({
                        loadingShelf: false,
                        items: response,
                    }, () => {
                        this.refreshWhiskiesByDistAndName();
                    });
                },
                () => {
                    this.setState({
                        loading: false,
                        failed: true,
                    })
                });
    }

    getSelectedWhisky() {
        const selectedWhisky = this.state.selectedWhisky;
        if (!selectedWhisky || !selectedWhisky.distillery || !selectedWhisky.name) {
            return null;
        }

        const { distillery, name } = selectedWhisky;
        if (this.state.whiskiesByDistAndName[distillery]) {
            if (this.state.whiskiesByDistAndName[distillery][name]) {
                return this.state.whiskiesByDistAndName[distillery][name];
            }
        }
        return null;
    }

    refreshWhiskiesByDistAndName() {
        const whiskiesByDistAndName = {};
        this.state.items.forEach((item) => {
            const distWhiskies = whiskiesByDistAndName[item.distillery];
            if (!distWhiskies || !Object.keys(distWhiskies).length) {
                whiskiesByDistAndName[item.distillery] = {};
            }
            whiskiesByDistAndName[item.distillery][item.name] = item;
        });
        this.setState({ whiskiesByDistAndName });
    }

    onWhiskyUpdated(updated) {
        const filtered = _.filter(this.state.items, (item) => (
            !(updated.distillery === item.distillery && updated.name === item.name)
        ));
        this.setState({
            items: [...filtered, updated]
        });
        this.refreshWhiskiesByDistAndName();
    }

    onWhiskyAdded(item) {
        this.setState(prevState => ({
            items: [...prevState.items, item]
        }))
        this.refreshWhiskiesByDistAndName();
    }

    onWhiskyRemoved(distillery, name) {
        const filteredItems = this.state.items.filter(whisky => (
            whisky.distillery !== distillery || whisky.name !== name)
        );
        this.setState({ items: filteredItems });
        this.refreshWhiskiesByDistAndName();
    }

    onStartEditWhisky(distillery, name) {
        this.setState({
            selectedWhisky: { distillery, name },
            whiskyFormDisplayed: true,
        });
    }

    onShowWhiskyForm() {
        this.setState({ whiskyFormDisplayed: true });
    }

    onHideWhiskyForm() {
        this.setState({
            selectedWhisky: {
                distillery: null,
                name: null,
            },
            whiskyFormDisplayed: false,
        });
    }

    renderWhiskyForm() {
        if (!this.state.whiskyFormDisplayed || !this.isAuthed) {
            return null;
        }

        const selectedWhisky = this.getSelectedWhisky();

        return (
            <Modal>
                <WhiskyForm
                    selectedWhisky={selectedWhisky}
                    onWhiskyAdded={this.onWhiskyAdded}
                    onWhiskyUpdated={this.onWhiskyUpdated}
                    onHideWhiskyForm={this.onHideWhiskyForm}
                />
            </Modal>
        )
    }

    renderWhiskyShelf() {
        return (
            <WhiskyShelf
                failed={this.state.failed}
                loading={this.state.loadingShelf}
                items={this.state.items}
                onWhiskyRemoved={this.onWhiskyRemoved}
                onStartEditWhisky={this.onStartEditWhisky}
            />
        )
    }

    renderActionBar() {
        if (!this.isAuthed || this.state.failed || this.state.loadingShelf) {
            return null;
        }
        return (
            <div className="action-bar">
                <button className="button-icon" onClick={this.onShowWhiskyForm}>
                    <Icon icon="plus" size={32} />
                </button>
            </div>
        )
    }

    render() {
        return (
            <div className="inner">
                <div className="header">
                    <h1>Whisky Shelf</h1>
                    <p>
                        This is an up-to-date list of the whiskies that I currently have on my
                        whisky shelf at home. I use this to track what I have so I can check
                        it when I'm out, which is useful if I'm deciding on a new bottle to get.
                    </p>
                    <p>
                        This is backed by DynamoDB and uses API Gateway in front of Lamdbda as a
                        serverless API. It's set to up to allow me to write to the table through
                        the website, but that's not open to the public. I'm planning on writing
                        up something about how it's set up. We'll see if I get to that :)
                    </p>
                </div>
                <div>
                    {this.renderWhiskyForm()}
                    {this.renderWhiskyShelf()}
                    {this.renderActionBar()}

                    <a href="index.html">Go back home</a>
                </div>
            </div>
        )
    }
}

module.exports = Whisky;

