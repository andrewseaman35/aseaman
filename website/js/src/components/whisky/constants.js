const TABLE_COLUMN_ORDER = [
    'distillery',
    'internal_name',
    'region',
    'type',
];
const TABLE_COLUMN_HEADER_LABELS = {
    distillery: 'Distillery',
    internal_name: 'Name (internal)',
    region: 'Region',
    type: 'Type',
};

const ERROR_MESSAGE_BY_CODE = {
    already_current: 'Distillery and internal name are already current',
}

const SORT = {
    distillery: ['distillery', 'internal_name', 'region', 'type'],
    internal_name: ['internal_name', 'distillery', 'region', 'type'],
    region: ['region', 'distillery', 'internal_name', 'type'],
    type: ['type', 'distillery', 'internal_name', 'region'],
}

module.exports = {
    ERROR_MESSAGE_BY_CODE,
    TABLE_COLUMN_ORDER,
    TABLE_COLUMN_HEADER_LABELS,
    SORT,
}
