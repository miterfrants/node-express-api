const ErrorHelper = {
    ErrorType: {
        'INTERNAL_ERROR': 1000000,
        'EMPTY_EMAIL': 1000001,
        'EMPTY_PASSWORD': 1000002,
        'USER_NOT_FOUND': 1000003,
        'DUPLICATE_EMAIL': 1000004,
        'WRONG_USER_STATE': 1000005,
        'WRONG_RESET_TOKEN': 1000006,
        'RESET_TOKEN_EXPIRED': 1000007,
        'PASSWORD_OR_EMAIL_ERROR': 1000008,
        'TOKEN_INVALID': 1000009,
        'ID_SHOULD_BE_INTEGER': 1000010,
        'STATUS_SHOULD_BE_INTEGER': 1000011,
        'UNALLOW_PERMISSION': 1000012,
        'INVALID_EMAIL': 1000013,
        'INVALID_TAIWAN_PHONE': 1000014,
        'INVALID_TAIWAN_IDENTITY_NO': 1000015,

        'EMPTY_DEBTOR_NAME': 2000001,
        'EMPTY_DEBTOR_IDENTITY_NO': 2000002,
        'WRONG_AUTOCOMPLETE_FIELDNAME': 2000003,
        'DEBTOR_NOT_FOUND': 2000004,
        'DEBTOR_DUPLICATE_PHONE': 2000005,
        'DEBTOR_DUPLICATE_EMAIL': 2000006,
        'DEBTOR_DUPLICATE_ID': 2000007,
        'WRONG_MODEL_NAME': 2000008
    },
    CustomError: class CustomError extends Error {
        constructor(errorType, httpStatus, options) {
            super();
            console.log(errorType);
            let message = ErrorHelper.getErrorMessage(errorType);
            for (let key in options) {
                message = message.replace(new RegExp(`{${key}}`, 'gi'), options[key]);
            }
            this.message = message;
            this.httpStatus = httpStatus;
        }
    },
    centralErrorHandler: (error, resp, next) => {
        if (error.constructor.name == 'CustomError') {
            resp.status(error.httpStatus).send({
                message: error.message
            });
        } else {
            resp.status(500).send({
                message: error.message
            });
            console.log(error);
        }
        next();
    },
    getErrorMessage: (errorType) => {
        switch (errorType) {
            case ErrorHelper.ErrorType.EMPTY_EMAIL:
                return '請輸入 Email';
            case ErrorHelper.ErrorType.EMPTY_PASSWORD:
                return '請輸入密碼';
            case ErrorHelper.ErrorType.USER_NOT_FOUND:
                return '找不到這個 {email} 使用者';
            case ErrorHelper.ErrorType.DUPLICATE_EMAIL:
                return '此 email 已經被使用過了，請重新輸入';
            case ErrorHelper.ErrorType.WRONG_USER_STATE:
                return '錯誤的使用者狀態';
            case ErrorHelper.ErrorType.WRONG_RESET_TOKEN:
                return '重設密碼的資訊連結錯誤';
            case ErrorHelper.ErrorType.RESET_TOKEN_EXPIRED:
                return '重設密碼的資訊已經過期，請重新設定';
            case ErrorHelper.ErrorType.PASSWORD_OR_EMAIL_ERROR:
                return '密碼或是 email 錯誤';
            case ErrorHelper.ErrorType.TOKEN_INVALID:
                return '錯誤的身份驗證資訊';
            case ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER:
                return 'ID 必須是數字';
            case ErrorHelper.ErrorType.STATUS_SHOULD_BE_INTEGER:
                return '使用者狀態必須是數字';
            case ErrorHelper.ErrorType.UNALLOW_PERMISSION:
                return '未授權取得資料';
            case ErrorHelper.ErrorType.INVALID_EMAIL:
                return 'Email 格式錯誤';
            case ErrorHelper.ErrorType.INVALID_TAIWAN_PHONE:
                return '錯誤的電話格式';
            case ErrorHelper.ErrorType.EMPTY_DEBTOR_NAME:
                return '名字一定要填寫，不能留空';
            case ErrorHelper.ErrorType.EMPTY_DEBTOR_PHONE:
                return '電話一定要填寫，不能留空';
            case ErrorHelper.ErrorType.EMPTY_DEBTOR_IDENTITY_NO:
                return '身分證一定要填寫，不能留空';
            case ErrorHelper.ErrorType.INVALID_TAIWAN_IDENTITY_NO:
                return '身分證格式錯誤';
            case ErrorHelper.ErrorType.WRONG_AUTOCOMPLETE_FIELDNAME:
                return '錯誤的欄位名稱';
            case ErrorHelper.ErrorType.DEBTOR_NOT_FOUND:
                return '找不到債務人';
            case ErrorHelper.ErrorType.DEBTOR_DUPLICATE_EMAIL:
                return '這個 Email 已經綁在一個債務人上';
            case ErrorHelper.ErrorType.DEBTOR_DUPLICATE_PHONE:
                return '這個電話已經綁在一個債務人上';
            case ErrorHelper.ErrorType.DEBTOR_DUPLICATE_ID:
                return '這個身分證字號已經綁在一個債務人上';
            default:
                break;
        }
    }
};
module.exports = ErrorHelper;