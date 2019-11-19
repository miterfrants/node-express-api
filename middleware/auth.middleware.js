const httpStatus = require('http-status-codes');
const ErrorHelper = require('../helpers/error.helper.js');
const JwtHelper = require('../helpers/jwt.helper.js');

module.exports = {
    checkAuth: (req, res, next) => {
        const token = req.headers.authorization.replace('Bearer ', '');
        const validResult = JwtHelper.validToken(token);
        if (validResult === null) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.TOKEN_INVALID, httpStatus.UNAUTHORIZED);
        }
        req.local = {
            JWTValidResult: validResult
        };
        next();
    }
};