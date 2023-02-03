import React from 'react';
import PropTypes from 'prop-types';

import { AnimatedEllipsis } from '../index';

import CRUDTableHeader from './CRUDTableHeader';
import CRUDTableRow from './CRUDTableRow';


class CRUDTable extends React.Component {
    constructor(props) {
        super(props);

        this.onHeaderItemClick = this.onHeaderItemClick.bind(this);
        this.onAddButtonClick = this.onAddButtonClick.bind(this);
        this.onRowActionClick = this.onRowActionClick.bind(this);
        this.onRowEditClick = this.onRowEditClick.bind(this);
        this.onRowSaveClick = this.onRowSaveClick.bind(this);
        this.onRowDeleteClick = this.onRowDeleteClick.bind(this);

        this.state = {
            data: null,
            sortKey: null,
            sortReversed: false,

            createButtonProcessing: false,
            isLoading: true,

            processingActionRows: {},
            editableRows: {},
        }
        this.initialize();
    }

    initialize() {
        this.props.loadDataItems().then(
            (response) => {
                console.log(response);
                this.setState({
                    data: response,
                    isLoading: false,
                });
            },
            (error) => {
                console.log(error)
            },
        )
    }

    setCreateButtonProcessing(processing) {
        this.setState({ createButtonProcessing: processing });
    }

    setRowState(key, rowState) {
        const newState = { ...this.state };
        if ("editable" in rowState) {
            newState.editableRows = {
                ...this.state.editableRows,
                [key]: rowState.editable,
            };
        }
        if ("processing" in rowState) {
            newState.processingActionRows = {
                ...this.state.processingActionRows,
                [key]: rowState.processing,
            };
        }
        this.setState(newState)
    }

    getSortedItems() {
        const { sort } = this.state;
        const order = SORT[sort.key];
        const sortKey = (item) => (
            order.map(key => item[key] && item[key].toLowerCase && item[key].toLowerCase())
        )
        const reverseMultiplier = sort.reversed ? -1 : 1;
        return this.props.items.concat().sort((a, b) => (
            sortKey(a) < sortKey(b) ? (-1 * reverseMultiplier) : (1 * reverseMultiplier)
        ));
    }

    addSingleItemToState(newItem, callback) {
        const newData = [...this.state.data];
        newData.push(newItem);
        this.setState({
            data: newData,
        }, () => {
            if (callback) {
                callback();
            }
        })
    }

    updateSingleItemState(updatedItem, callback) {
        const existingData = this.state.data;
        const newData = [];
        existingData.forEach((item) => {
            if (item[this.props.itemKey] === updatedItem[this.props.itemKey]) {
                newData.push(updatedItem);
            } else {
                newData.push(item);
            }
        });
        this.setState({
            ...this.state,
            data: newData,
        }, () => {
            if (callback) {
                callback();
            }
        })
    }

    deleteSingleItemFromState(key, callback) {
        const existingData = this.state.data;
        const newData = [];
        existingData.forEach((item) => {
            if (item[this.props.itemKey] !== key) {
                newData.push(item);
            }
        });
        this.setState({
            ...this.state,
            data: newData,
        }, () => {
            if (callback) {
                callback();
            }
        })
    }

    createEmptyItem() {
        return this.props.sortedMetadata.reduce(
            (emptyItem, metadata) => {
                emptyItem[metadata.key] = metadata.initialValue;
                return emptyItem;
            },
            {},
        );
    }

    onHeaderItemClick(event) {
        console.log(event.currentTarget.dataset.sortKey)
        return;
        const { sort } = this.state;
        const newSortKey = event.currentTarget.dataset.sortKey;
        if (newSortKey in SORT) {
            const sameHeaderClicked = newSortKey === sort.key;
            this.setState({
                sort: {
                    key: newSortKey,
                    reversed: sameHeaderClicked ? !sort.reversed : false,
                }
            })
        }
    }

    onAddButtonClick() {
        this.setCreateButtonProcessing(true);
        this.props.createItem(this.createEmptyItem()).then(
            (response) => {
                this.addSingleItemToState(response, () => {
                    this.setRowState(response.id, {editable: true});
                    this.setCreateButtonProcessing(false);
                });
            },
            (error) => {
                console.log(error);
            },
        )
    }

    onRowEditClick(key) {
        this.setRowState(key, { editable: true });
    }

    onRowActionClick(key) {
        this.setRowState(key, { processing: true, editable: false });
        this.props.handleAction(key).then(
            this.setRowState(key, { editable: false, processing: false })
        );
    }

    onRowSaveClick(key, values) {
        this.setRowState(key, { processing: true, editable: false });
        this.props.updateItem(values).then(
            (response) => {
                this.updateSingleItemState(response, () => {
                    this.setRowState(key, { editable: false, processing: false });
                });
            },
            () => {
                this.setRowState(key, { editable: false, processing: false });
            }
        )
    }

    onRowDeleteClick(key) {
        this.setRowState(key, { processing: true, editable: false });
        this.props.deleteItem(key).then(
            () => {
                this.deleteSingleItemFromState(key);
            },
            () => {
                this.setRowState(key, { editable: false, processing: false });
            }
        )
    }

    renderLoading() {
        return (
            <AnimatedEllipsis text="Loading" />
        )
    }

    renderError() {
        return (
            <div className='error-message'>Something happened while retrieving the shelf!</div>
        )
    }

    renderCreateRow() {
        return (
            <tr className="crud-table-create-row no-hover">
                <td colSpan="100%">
                    {
                        !!this.state.createButtonProcessing && (
                            <button>
                                <AnimatedEllipsis />
                            </button>
                        )
                    }
                    {
                        !this.state.createButtonProcessing && (
                            <button
                                onClick={this.onAddButtonClick}
                            >{this.props.createLabel}</button>
                        )
                    }
                </td>
            </tr>
        )
    }

    renderTableBody() {
        const { data } = this.state;
        return (
            <tbody>
                {
                    data.map((item, index) => (
                        <CRUDTableRow
                            item={item}
                            key={`crud-row-${item[this.props.itemKey]}`}
                            itemKey={this.props.itemKey}
                            sortedMetadata={this.props.sortedMetadata}
                            itemFormatters={this.props.itemFormatters}

                            isProcessingAction={!!this.state.processingActionRows[item[this.props.itemKey]]}
                            isBeingEdited={!!this.state.editableRows[item[this.props.itemKey]]}

                            editEnabled={this.props.editEnabled}
                            deleteEnabled={this.props.deleteEnabled}
                            actionEnabled={this.props.actionEnabled}
                            actionIcon={this.props.actionIcon}
                            onActionClick={this.onRowActionClick}
                            onEditClick={this.onRowEditClick}
                            onSaveClick={this.onRowSaveClick}
                            onDeleteClick={this.onRowDeleteClick}
                        />
                    ))
                }
                {
                    this.props.createEnabled && this.renderCreateRow()
                }
            </tbody>
        )
    }

    renderTable() {
        const includeActionsColumn = (
            this.props.editEnabled ||
            this.props.deleteEnabled ||
            this.props.actionEnabled ||
            Object.values(this.state.editableRows).some(e => e)
        )
        return (
            <table className="crud-table">
                <CRUDTableHeader
                    sortedMetadata={this.props.sortedMetadata}
                    onHeaderItemClick={this.onHeaderItemClick}
                    includeActionsColumn={includeActionsColumn}
                />
                { this.renderTableBody() }
            </table>
        )
    }

    render() {
        return (
            <div className="crud-table-container">
                { this.state.isLoading && this.renderLoading() }
                { !this.state.isLoading && this.renderTable() }
            </div>
        )
    }
}


CRUDTable.defaultProps = {
    actionEnabled: false,
    handleAction: () => {
        console.warn('action handler not provided')
    },
    createItem: () => {
        console.warn('create handler not provided')
    },
    updateItem: () => {
        console.warn('update handler not provided')
    },
    deleteItem: () => {
        console.warn('delete handler not provided')
    },
}


CRUDTable.propTypes = {
    loadDataItems: PropTypes.func.isRequired,
    updateItem: PropTypes.func.isRequired,

    sortedMetadata: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    itemFormatters: PropTypes.object,

    itemKey: PropTypes.string.isRequired,

    createEnabled: PropTypes.bool.isRequired,
    createLabel: PropTypes.string.isRequired,
    createItem: PropTypes.func.isRequired,

    actionEnabled: PropTypes.bool.isRequired,
    actionIcon: PropTypes.string,
    handleAction: PropTypes.func.isRequired,

    editEnabled: PropTypes.bool.isRequired,

    deleteEnabled: PropTypes.bool.isRequired,
    deleteItem: PropTypes.func.isRequired,
}


module.exports = CRUDTable;
