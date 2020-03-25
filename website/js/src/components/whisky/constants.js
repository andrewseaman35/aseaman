const TABLE_COLUMN_ORDER = [
    'distillery',
    'name',
    'region',
    'country',
    'type',
    'style',
    'age',
];
const TABLE_COLUMN_HEADER_LABELS = {
    distillery: 'Distillery',
    name: 'Name',
    region: 'Region',
    country: 'Country',
    type: 'Type',
    style: 'Style',
    age: 'Age',
};

const ERROR_MESSAGE_BY_CODE = {
    already_current: 'Distillery and name are already current',
}

const SORT = {
    distillery: ['distillery', 'name', 'region', 'country', 'type', 'style', 'age'],
    name: ['name', 'distillery', 'region', 'country', 'type', 'style', 'age'],
    region: ['region', 'country', 'distillery', 'name', 'type', 'style', 'age'],
    country: ['country', 'region', 'distillery', 'name', 'type', 'style', 'age'],
    type: ['type', 'distillery', 'name', 'region', 'country', 'style', 'age'],
    style: ['style', 'distillery', 'name', 'region', 'country', 'type', 'age'],
    age: ['age', 'distillery', 'name', 'region', 'country', 'type', 'style'],
}

module.exports = {
    ERROR_MESSAGE_BY_CODE,
    TABLE_COLUMN_ORDER,
    TABLE_COLUMN_HEADER_LABELS,
    SORT,
}
