const httpStatus = require('http-status-codes');
const ErrorHelper = require('../helpers/error.helper.js');
const JwtHelper = require('../helpers/jwt.helper.js');
const AuthMW = {
    checkAuth: (req, res, next) => {
        const token = req.headers.authorization.replace('Bearer ', '');
        const JWTPayload = JwtHelper.validToken(token);
        if (JWTPayload === null) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.TOKEN_INVALID, httpStatus.UNAUTHORIZED);
        }
        req.local = {
            JWTPayload: JWTPayload
        };
        next();
    },
    hasManagerPermission: (req, res, next) => {
        if (req.local.JWTPayload.role !== AuthMW.ROLE.MANAGER) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.UNALLOW_PERMISSION, httpStatus.UNAUTHORIZED);
        }
        next();
    },
    ROLE: {
        MANAGER: 'manager',
        STAFF: 'staff'
    }
};
module.exports = AuthMW;