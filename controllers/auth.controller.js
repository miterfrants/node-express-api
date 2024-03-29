const express = require('express');
const httpStatus = require('http-status-codes');
const sgMail = require('@sendgrid/mail');

const mysqlHelper = require('../helpers/mysql.helper.js');
const ErrorHelper = require('../helpers/error.helper.js');
const UtilHelper = require('../helpers/util.helper.js');
const JwtHelper = require('../helpers/jwt.helper.js');
const UserServices = require('../services/users.service.js');
const AuthMW = require('../middleware/auth.middleware.js');

const router = express.Router();
router.get('/test', (req, res) => {
    res.send({});
});

router.post('/signin', UtilHelper.warpAsync(async (req, res) => {
    if (!req.body.email) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_EMAIL, httpStatus.BAD_REQUEST);
    }
    if (!req.body.password) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_PASSWORD, httpStatus.BAD_REQUEST);
    }
    let connection = await mysqlHelper.getConnectionAsync();
    const user = await UserServices.getOneByEmailAsync(connection, req.body.email);
    connection.end();
    if (!user) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.USER_NOT_FOUND, httpStatus.NOT_FOUND, {
            email: req.body.email
        });
    }

    if (user.status !== 1) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.WRONG_USER_STATE, httpStatus.BAD_REQUEST);
    }
    let role = AuthMW.ROLE.STAFF;
    if (user.is_user_manager === 1) {
        role = AuthMW.ROLE.MANAGER;
    }
    connection = await mysqlHelper.getConnectionAsync();
    const token = await UserServices.getTokenAsync(connection, req.body.email, req.body.password, role);
    connection.end();
    if (token === null) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.PASSWORD_OR_EMAIL_ERROR, httpStatus.BAD_REQUEST);
    }

    res.send({
        token: token
    });
}));

router.post('/signup', UtilHelper.warpAsync(async (req, res) => {
    if (!req.body.email) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_EMAIL, httpStatus.BAD_REQUEST);
    }
    if (!req.body.password) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_PASSWORD, httpStatus.BAD_REQUEST);
    }
    const connection = await mysqlHelper.getConnectionAsync();
    let userId = 0;
    try {
        userId = await UserServices.createAsync(connection, req.body.email, req.body.password);
        connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.DUPLICATE_EMAIL, httpStatus.CONFLICT);
        }
        throw error;
    }

    res.send({
        email: req.body.email,
        id: userId
    });
}));

router.post('/forgot-password', UtilHelper.warpAsync(async (req, res) => {
    let connection = await mysqlHelper.getConnectionAsync();
    const user = await UserServices.getOneByEmailAsync(connection, req.body.email);
    connection.end();
    if (user == null) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.USER_NOT_FOUND, httpStatus.NOT_FOUND);
    }
    // todo: install smtp server & send email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    connection = await mysqlHelper.getConnectionAsync();
    const result = await UserServices.forgotPasswordAsync(connection, user.id);
    connection.end();

    const msg = {
        to: user.email,
        from: 'systemn@heshang.com',
        subject: '重設密碼信件',
        html: `<a href="${process.env.FrontEndURL}/reset-password/?email=${user.email}&reset-token=${result.resetToken}">重設連結</a>`
    };
    sgMail.send(msg);
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

router.post('/reset-password-anonymous', UtilHelper.warpAsync(async (req, res) => {
    if (!req.body.email) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_EMAIL, httpStatus.BAD_REQUEST);
    }
    if (!req.body.password) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_PASSWORD, httpStatus.BAD_REQUEST);
    }
    let connection = await mysqlHelper.getConnectionAsync();
    const user = await UserServices.getOneByEmailAsync(connection, req.body.email);
    connection.end();
    if (user == null) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.USER_NOT_FOUND, httpStatus.NOT_FOUND, {
            email: req.body.email
        });
    }
    if (!user.reset_token) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.WRONG_USER_STATE, httpStatus.FORBIDDEN);
    }
    if (user.reset_token !== req.body.resetToken) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.WRONG_RESET_TOKEN, httpStatus.BAD_REQUEST);
    }
    if (user.reset_token_expiration < new Date()) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.RESET_TOKEN_EXPIRED, httpStatus.BAD_REQUEST);
    }
    connection = await mysqlHelper.getConnectionAsync();
    await UserServices.resetPasswordAsync(connection, user.id, req.body.password);
    connection.end();
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

router.post('/reset-password', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    if (!req.body.password) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_PASSWORD, httpStatus.BAD_REQUEST);
    }
    const connection = await mysqlHelper.getConnectionAsync();
    await UserServices.resetPasswordAsync(connection, req.local.JWTPayload.sub, req.body.password);
    connection.end();
    res.send({
        status: UtilHelper.CUSTOM_RESP.OK
    });
}));

router.post('/refresh-token', AuthMW.checkAuth, UtilHelper.warpAsync(async (req, res) => {
    const newToken = await JwtHelper.generateToken(req.local.JWTPayload.sub, req.local.JWTPayload.email);
    if (newToken === null) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.PASSWORD_OR_EMAIL_ERROR, httpStatus.BAD_REQUEST);
    }
    res.send({
        token: newToken
    });
}));

module.exports = router;