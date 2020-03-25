import React from 'react';

import AUTH from './auth';

import { Icon, Modal, WhiskyForm, WhiskyShelf } from './components/';

import { getCurrentShelf } from './components/whisky/api';


class Whisky extends React.Component {
    constructor() {
        super();

        this.onWhiskyAdded = this.onWhiskyAdded.bind(this);
        this.onWhiskyRemoved = this.onWhiskyRemoved.bind(this);
        this.onShowWhiskyForm = this.onShowWhiskyForm.bind(this);
        this.onHideWhiskyForm = this.onHideWhiskyForm.bind(this);
        this.isAuthed = AUTH.getApiKey();

        this.state = {
            whiskyFormDisplayed: false,
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
                    })
                },
                () => {
                    this.setState({
                        loading: false,
                        failed: true,
                    })
                });
    }

    onWhiskyAdded(item) {
        this.setState(prevState => ({
            items: [...prevState.items, item]
        }))
    }

    onWhiskyRemoved(distillery, name) {
        const filteredItems = this.state.items.filter(whisky => (
            whisky.distillery !== distillery || whisky.name !== name)
        );
        this.setState({ items: filteredItems });
    }

    onShowWhiskyForm() {
        this.setState({ whiskyFormDisplayed: true });
    }

    onHideWhiskyForm() {
        this.setState({ whiskyFormDisplayed: false });
    }

    renderWhiskyForm() {
        if (!this.state.whiskyFormDisplayed || !this.isAuthed) {
            return null;
        }

        return (
            <Modal>
                <WhiskyForm
                    onWhiskyAdded={this.onWhiskyAdded}
                    onHideWhiskyForm={this.onHideWhiskyForm}
                    onShowWhiskyForm={this.onShowWhiskyForm}
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
                    <h3>My Whisky Shelf</h3>
                    <p>
                        This is an up-to-date list of the whiskies that I currently have on my
                        whisky shelf at home. I use this to track what I have so I can check
                        it when I'm out, which is useful if I'm deciding on a new bottle to get.
                    </p>
                    <p>
                        This is backed by DynamoDB and uses API Gateway in front of Lamdbda as a
                        serverless API. I'm planning on writing up something about how it's set up.
                        We'll see if I get to it :)
                    </p>
                </div>
                <div className="left-content">
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

