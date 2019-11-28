const express = require('express');
const httpStatus = require('http-status-codes');
const moment = require('moment-timezone');

const AuthMW = require('../middleware/auth.middleware.js');
const UtilHelper = require('../helpers/util.helper.js');
const MysqlHelper = require('../helpers/mysql.helper.js');
const ErrorHelper = require('../helpers/error.helper.js');
const DebtorFilesService = require('../services/debtor-files.service.js');

const router = express.Router();
router.get('/:debtorId/files', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    let list = await DebtorFilesService.getListAsync(connection, req.params.debtorId);
    connection.release();
    res.send(list);
}));

router.post('/:debtorId/files', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    let results = [];
    for (let i = 0; i < req.body.files.length; i++) {
        const file = req.body.files[i];
        const newId = await DebtorFilesService.createAsync(connection, req.params.debtorId, file.filename, file.name, req.local.JWTPayload.sub);
        results.push({
            id: newId,
            debtor_id: req.params.debtorId,
            filename: file.filename,
            name: file.name
        });
    }
    connection.release();
    res.send(results);
}));

router.patch('/:debtorId/files/:id', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.id);
    const debtorId = Number(req.params.debtorId);
    if (isNaN(id) || isNaN(debtorId)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    const updatedAt = new moment().format('YYYY-MM-DD HH:mm:ss');
    const connection = await MysqlHelper.getConnectionAsync();
    const updatedRow = await DebtorFilesService.updateAsync(
        connection,
        id,
        debtorId,
        req.body.name,
        req.local.JWTPayload.sub,
        updatedAt
    );
    connection.release();
    if (updatedRow > 1) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.INTERNAL_ERROR, httpStatus.INTERNAL_ERROR);
    }
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

router.delete('/:debtorId/files/:id', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.id);
    const debtorId = Number(req.params.debtorId);
    if (isNaN(id) || isNaN(debtorId)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    const deletedAt = new moment().format('YYYY-MM-DD HH:mm:ss');
    const connection = await MysqlHelper.getConnectionAsync();
    const updatedRow = await DebtorFilesService.deleteAsync(
        connection,
        id,
        debtorId,
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