const MysqlHelper = require('../helpers/mysql.helper.js');
const DebtorFilesService = {
    createAsync: async (connection, debtor_id, filename, name, creator_id) => {
        const keyValuePair = MysqlHelper.buildInserExpression([{
            key: 'filename',
            value: filename,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'creator_id',
            value: creator_id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER
        }, {
            key: 'debtor_id',
            value: debtor_id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO debtor_files ${keyValuePair}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result.insertId);
                    } else {
                        reject('Insert Error');
                    }
                }
            });
        });
    },
    getListAsync: async (connection, debtor_id) => {
        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: 'debtor_id',
            value: debtor_id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM debtor_files ${filter}
            ORDER BY id DESC`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },
    updateAsync: async (connection, id, debtor_id, name, modifierId, updatedAt) => {
        const updateExpression = MysqlHelper.buildUpdateExpression([{
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'modifier_id',
            value: modifierId,
            dataType: MysqlHelper.DATA_TYPE.NUMBER
        }, {
            key: 'updated_at',
            value: updatedAt,
            dataType: MysqlHelper.DATA_TYPE.DATETIME
        }], [{
            key: 'id',
            value: id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }, {
            key: 'debtor_id',
            value: debtor_id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE debtor_files SET ${updateExpression}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result);
                    } else {
                        reject('Update Affor Row is 0');
                    }
                }
            });
        });
    },
    deleteAsync: async (connection, id, debtor_id, deletedAt, modifierId, updatedAt) => {
        const updateExpression = MysqlHelper.buildUpdateExpression([{
            key: 'deleted_at',
            value: deletedAt,
            dataType: MysqlHelper.DATA_TYPE.DATETIME,
        }, {
            key: 'modifier_id',
            value: modifierId,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
        }, {
            key: 'updated_at',
            value: updatedAt,
            dataType: MysqlHelper.DATA_TYPE.DATETIME,
        }], [{
            key: 'id',
            value: id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }, {
            key: 'debtor_id',
            value: debtor_id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE debtor_files SET ${updateExpression}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result);
                    } else {
                        reject('Delete Error');
                    }
                }
            });
        });
    }
};

module.exports = DebtorFilesService;