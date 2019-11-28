const express = require('express');
const httpStatus = require('http-status-codes');
const moment = require('moment-timezone');

const AuthMW = require('../middleware/auth.middleware.js');
const MysqlHelper = require('../helpers/mysql.helper.js');
const ErrorHelper = require('../helpers/error.helper.js');
const UtilHelper = require('../helpers/util.helper.js');
const DebtorsService = require('../services/debtors.service.js');
const ValidatorMW = require('../middleware/validator.middleware.js');

const router = express.Router();
router.get('/', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    const debtors = await DebtorsService.getListAsync(connection, req.query.page, req.query.size, req.query.name, req.query.email, req.query.phone, req.query.identity_no);
    connection.release();

    connection = await MysqlHelper.getConnectionAsync();
    const rowNums = await DebtorsService.getRowNumAsync(connection, req.query.name, req.query.email, req.query.phone, req.query.identity_no);
    connection.release();

    res.send({
        rowNums: rowNums,
        debtors
    });
}));

router.get('/autocomplete', AuthMW.checkAuth, ValidatorMW.debtorAutoCompleteValdation, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    const list = await DebtorsService.getFieldList(connection, req.query.fieldName, req.query.fieldValue);
    connection.release();

    res.send(list.map((item) => {
        return item[req.query.fieldName];
    }));
}));

router.post('/', AuthMW.checkAuth, ValidatorMW.debtorValdation, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    try {
        const debtorId = await DebtorsService.createAsync(
            connection,
            req.body.name,
            req.body.email,
            req.body.phone,
            req.body.identity_no,
            req.local.JWTPayload.sub
        );
        res.send({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            identity_no: req.body.identity_no,
            id: debtorId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.indexOf('for key \'phone\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_PHONE, httpStatus.CONFLICT);
            } else if (error.sqlMessage.indexOf('for key \'identity_no\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_ID, httpStatus.CONFLICT);
            } else if (error.sqlMessage.indexOf('for key \'email\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_EMAIL, httpStatus.CONFLICT);
            }
        } else {
            throw error;
        }
    } finally {
        connection.release();
    }
}));

router.get('/:debtorId', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.debtorId);
    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    let connection = await MysqlHelper.getConnectionAsync();
    const debtor = await DebtorsService.getOneByIdAsync(connection, id);
    connection.release();
    if (!debtor) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    res.send(debtor);
}));

router.patch('/:debtorId', AuthMW.checkAuth, ValidatorMW.debtorValdation, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.debtorId);

    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    const updatedAt = new moment().format('YYYY-MM-DD HH:mm:ss');
    const connection = await MysqlHelper.getConnectionAsync();
    try {
        const updatedRow = await DebtorsService.updateAsync(
            connection,
            id,
            req.body.name,
            req.body.email,
            req.body.phone,
            req.body.identity_no,
            req.local.JWTPayload.sub,
            updatedAt
        );

        if (updatedRow > 1) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.INTERNAL_ERROR);
        }

        res.send({
            status: UtilHelper.CUSTOM_RESP.OK
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.indexOf('for key \'phone\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_PHONE, httpStatus.CONFLICT);
            } else if (error.sqlMessage.indexOf('for key \'identity_no\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_ID, httpStatus.CONFLICT);
            } else if (error.sqlMessage.indexOf('for key \'email\'') !== -1) {
                throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DEBTOR_DUPLICATE_EMAIL, httpStatus.CONFLICT);
            }
        } else {
            throw error;
        }
    } finally {
        connection.release();
    }
}));

router.delete('/:debtorId', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.debtorId);

    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    const deletedAt = new moment().format('YYYY-MM-DD HH:mm:ss');
    const connection = await MysqlHelper.getConnectionAsync();
    const updatedRow = await DebtorsService.deleteAsync(
        connection,
        id,
        deletedAt,
        req.local.JWTPayload.sub,
        deletedAt
    );
    connection.release();
    if (updatedRow > 1) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.INTERNAL_ERROR);
    }
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

module.exports = router;