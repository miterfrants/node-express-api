const MysqlHelper = require('../helpers/mysql.helper.js');
const DebtorsService = {
    createAsync: async (connection, name, email, phone, identity_no, creatorId) => {
        const keyValuePair = MysqlHelper.buildInserExpression([{
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'email',
            value: email,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'phone',
            value: phone,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'identity_no',
            value: identity_no,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'creator_id',
            value: creatorId,
            dataType: MysqlHelper.DATA_TYPE.NUMBER
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO debtors ${keyValuePair}`, (error, result) => {
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
    updateAsync: async (connection, id, name, email, phone, identity_no, modifierId, updatedAt) => {
        const updateExpression = MysqlHelper.buildUpdateExpression([{
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'email',
            value: email,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'phone',
            value: phone,
            dataType: MysqlHelper.DATA_TYPE.STRING,
        }, {
            key: 'identity_no',
            value: identity_no,
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
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE debtors SET ${updateExpression}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result);
                    } else {
                        reject('Insert Error');
                    }
                }
            });
        });
    },
    deleteAsync: async (connection, id, deletedAt, modifierId, updatedAt) => {
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
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`UPDATE debtors SET ${updateExpression}`, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.affectedRows > 0) {
                        resolve(result);
                    } else {
                        reject('Insert Error');
                    }
                }
            });
        });
    },
    getRowNumAsync: async (connection, name, email, phone, identity_no) => {
        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'email',
            value: email,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'phone',
            value: phone,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'identity_no',
            value: identity_no,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) as count FROM debtors ${filter}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });
    },
    getListAsync: async (connection, page, size, name, email, phone, identity_no) => {
        page = Number(page);
        size = Number(size);
        if (isNaN(page)) {
            throw new Error('page have to be type of integer');
        }
        if (isNaN(size)) {
            throw new Error('size have to be type of integer');
        }

        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: 'name',
            value: name,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'email',
            value: email,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'phone',
            value: phone,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }, {
            key: 'identity_no',
            value: identity_no,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM view_debtors ${filter}
            ORDER BY id DESC LIMIT ${(page-1)*size}, ${size}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getOneByIdAsync: async (connection, id) => {
        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: 'id',
            value: id,
            dataType: MysqlHelper.DATA_TYPE.NUMBER,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM view_debtors ${filter}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    getOneByEmailAsync: async (connection, email) => {
        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: 'email',
            value: email,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.EQUAL
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM debtors ${filter}`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },
    getFieldList: async (connection, fieldName, fieldValue) => {
        let filter = 'WHERE deleted_at is null';
        filter += MysqlHelper.buildFilter([{
            key: fieldName,
            value: fieldValue,
            dataType: MysqlHelper.DATA_TYPE.STRING,
            operator: MysqlHelper.FILTER_OPERATOR_TYPE.LIKE_START
        }]);
        return new Promise((resolve, reject) => {
            connection.query(`SELECT \`${fieldName}\` FROM debtors ${filter}
            ORDER BY id DESC LIMIT 0, 10`, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
};

module.exports = DebtorsService;