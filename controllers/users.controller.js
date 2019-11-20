const express = require('express');
const httpStatus = require('http-status-codes');

const AuthMW = require('../middleware/auth.middleware.js');
const MysqlHelper = require('../helpers/mysql.helper.js');
const ErrorHelper = require('../helpers/error.helper.js');
const UtilHelper = require('../helpers/util.helper.js');
const UsersService = require('../services/users.service.js');

const router = express.Router();
router.get('/', AuthMW.checkAuth, AuthMW.hasManagerPermission, UtilHelper.warpAsync(async (req, res) => {
    let connection = await MysqlHelper.getConnectionAsync();
    const userResult = await UsersService.getListAsync(connection, req.query.page, req.query.size, req.query.email, req.query.status);
    connection.end();

    connection = await MysqlHelper.getConnectionAsync();
    const rowNums = await UsersService.getRowNumAsync(connection, req.query.email, req.query.status);
    connection.end();
    const users = userResult.map(element => {
        return {
            id: element.id,
            email: element.email,
            status: element.status,
            created_at: element.created_at,
            is_user_manager: element.is_user_manager
        };
    });
    res.send({
        rowNums: rowNums,
        users: users
    });
}));

router.patch('/:userId/status', AuthMW.checkAuth, AuthMW.hasManagerPermission, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.userId);
    const status = Number(req.body.status);
    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    if (isNaN(status)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.STATUS_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }

    const connection = await MysqlHelper.getConnectionAsync();
    await UsersService.updateStatus(connection, req.params.userId, req.body.status);
    connection.end();
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

router.patch('/:userId/change-role', AuthMW.checkAuth, AuthMW.hasManagerPermission, UtilHelper.warpAsync(async (req, res) => {
    const id = Number(req.params.userId);
    const is_user_manager = Number(req.body.is_user_manager);
    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }
    if (isNaN(is_user_manager)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.STATUS_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }

    const connection = await MysqlHelper.getConnectionAsync();
    await UsersService.changeRole(connection, req.params.userId, req.body.is_user_manager);
    connection.end();
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

module.exports = router;