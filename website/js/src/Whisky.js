import React from 'react';

import AUTH from './auth';

import WhiskyShelf from './components/whisky/WhiskyShelf';
import WhiskyForm from './components/whisky/WhiskyForm';

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

    onWhiskyRemoved(distillery, internalName) {
        const filteredItems = this.state.items.filter(whisky => (
            whisky.distillery !== distillery || whisky.internal_name !== internalName)
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
            <WhiskyForm
                onWhiskyAdded={this.onWhiskyAdded}
                onHideWhiskyForm={this.onHideWhiskyForm}
                onShowWhiskyForm={this.onShowWhiskyForm}
            />
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
                <button onClick={this.onShowWhiskyForm}>Add</button>
            </div>
        )
    }

    render() {
        return (
            <div className="left-content">
                {this.renderWhiskyForm()}
                {this.renderWhiskyShelf()}
                {this.renderActionBar()}

                <a href="index.html">Go back home</a>
            </div>
        )
    }
}

module.exports = Whisky;

