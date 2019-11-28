const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: 'utc'
});

const MysqlHelper = {
    getConnectionAsync: () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    },
    FILTER_OPERATOR_TYPE: {
        LIKE_START: 'like-start',
        LIKE_END: 'like-end',
        LIKE: 'like',
        GREAT_OR_EQUAL: 'great-or-equal',
        GREAT: 'great',
        LESS_OR_EQUAL: 'less-or-equal',
        LESS: 'less',
        EQUAL: 'equal'
    },
    DATA_TYPE: {
        STRING: 'string',
        NUMBER: 'number',
        BOOL: 'bool',
        DATETIME: 'datetime'
    },
    buildInserExpression: (array) => {
        let keys = '(';
        let values = '(';
        for (let i = 0; i < array.length; i++) {
            keys += '`' + array[i].key + '`,';
            if (array[i].dataType === MysqlHelper.DATA_TYPE.STRING || array[i].dataType === MysqlHelper.DATA_TYPE.DATETIME) {
                values += `'${array[i].value.replace(/'/gi,'\\\'')}',`;
            } else if (!MysqlHelper.DATA_TYPE[array[i].dataType]) {
                values += array[i].value + ',';
            }
        }
        keys = keys.substring(0, keys.length - 1) + ')';
        values = values.substring(0, values.length - 1) + ')';
        return `${keys} VALUES ${values}`;
    },
    buildUpdateExpression: (updateKeyValuePair, filterArray) => {
        let result = '';
        for (let i = 0; i < updateKeyValuePair.length; i++) {
            let updateItem = updateKeyValuePair[i];
            if (!updateItem.value) {
                continue;
            }
            if (updateItem.dataType === MysqlHelper.DATA_TYPE.NUMBER && Number.isNaN(updateItem.value)) {
                throw new Error(`${updateItem.key} is not a number`);
            }

            if (updateItem.dataType === MysqlHelper.DATA_TYPE.BOOL &&
                (updateItem.value === true || updateItem.value === false)
            ) {
                throw new Error(`${updateItem.key} is not a boolean`);
            }
            result += `\`${updateItem.key}\` = `;
            if (updateItem.dataType === MysqlHelper.DATA_TYPE.STRING || updateItem.dataType === MysqlHelper.DATA_TYPE.DATETIME) {
                result += `'${updateItem.value.replace(/'/gi,'\\\'')}'`;
            } else {
                result += updateItem.value;
            }
            result += ',';
        }
        result = result.substring(0, result.length - 1);
        result += ' WHERE deleted_at is null ' + MysqlHelper.buildFilter(filterArray);
        return result;
    },
    buildFilter: (array) => {
        let result = '';
        for (let i = 0; i < array.length; i++) {
            const filter = array[i];
            if (!filter.value) {
                continue;
            }
            if (filter.dataType !== MysqlHelper.DATA_TYPE.STRING &&
                (
                    filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE ||
                    filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_START ||
                    filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_END
                )
            ) {
                throw new Error('like operator use by string data type');
            }
            if (filter.dataType === MysqlHelper.DATA_TYPE.NUMBER && Number.isNaN(filter.value)) {
                throw new Error(`${filter.key} is not a number`);
            }

            if (filter.dataType === MysqlHelper.DATA_TYPE.BOOL &&
                (filter.value === true || filter.value === false)
            ) {
                throw new Error(`${filter.key} is not a boolean`);
            }

            const escapeKey = `\`${filter.key}\``;
            let escapeValue;
            if (filter.dataType === MysqlHelper.DATA_TYPE.STRING || filter.dataType === MysqlHelper.DATA_TYPE.DATETIME) {
                if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE) {
                    escapeValue = `'%${filter.value.replace(/'/gi, '\\\'')}%'`;
                } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_END) {
                    escapeValue = `'%${filter.value.replace(/'/gi, '\\\'')}'`;
                } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_START) {
                    escapeValue = `'${filter.value.replace(/'/gi, '\\\'')}%'`;
                }
            } else if (filter.dataType === MysqlHelper.DATA_TYPE.BOOL || filter.dataType === MysqlHelper.DATA_TYPE.NUMBER) {
                escapeValue = filter.value;
            }

            if (
                filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE ||
                filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_END ||
                filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_START
            ) {
                result += ` AND ${escapeKey} LIKE ${escapeValue}`;
            } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.GREAT) {
                result += ` AND ${escapeKey} > ${escapeValue}`;
            } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.GREAT_OR_EQUAL) {
                result += ` AND ${escapeKey} >= ${escapeValue}`;
            } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LESS) {
                result += ` AND ${escapeKey} < ${escapeValue}`;
            } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.LESS_OR_EQUAL) {
                result += ` AND ${escapeKey} <= ${escapeValue}`;
            } else if (filter.operator === MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL) {
                result += ` AND ${escapeKey} = ${escapeValue}`;
            }
        }
        return result;
    }
};

module.exports = MysqlHelper;