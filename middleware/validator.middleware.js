const httpStatus = require('http-status-codes');
const ErrorHelper = require('../helpers/error.helper.js');

const ValidatorMW = {
    emailRegExp: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    tawianPhoneRegExp: /(^09[0-9]{8}|^8869[0-9]{8})/,
    tawianIdRegExp: /([a-zA-Z]{1}[0-9]{9})/,
    debtorValdation: (req, res, next) => {
        req.validatedBody = {};
        if (!req.body.name) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_DEBTOR_NAME, httpStatus.BAD_REQUEST);
        }
        if (!req.body.phone) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_DEBTOR_PHONE, httpStatus.BAD_REQUEST);
        }

        if (!req.body.identity_no) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.EMPTY_DEBTOR_IDENTITY_NO, httpStatus.BAD_REQUEST);
        }

        if (req.body.email && !ValidatorMW.emailRegExp.test(req.body.email)) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.INVALID_EMAIL, httpStatus.BAD_REQUEST);
        }

        if (req.body.phone && !ValidatorMW.tawianPhoneRegExp.test(req.body.phone.toString())) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.INVALID_TAIWAN_PHONE, httpStatus.BAD_REQUEST);
        }
        if (req.body.identity_no && !ValidatorMW.tawianIdRegExp.test(req.body.identity_no)) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.INVALID_TAIWAN_IDENTITY_NO, httpStatus.BAD_REQUEST);
        }

        next();
    },
    debtorAutoCompleteValdation: (req, res, next) => {
        if (['email', 'phone', 'name', 'identity_no'].indexOf(req.query.fieldName) === -1) {
            throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.WRONG_AUTOCOMPLETE_FIELDNAME, httpStatus.BAD_REQUEST);
        }
        next();
    }
};
module.exports = ValidatorMW;