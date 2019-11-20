const ErrorHelper = {
    ErrorType: {
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
        'UNALLOW_PERMISSION': 1000012
    },
    CustomError: class CustomError extends Error {
        constructor(errorType, httpStatus, options) {
            super();
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
        case 1000001:
            return '請輸入 Email';
        case 1000002:
            return '請輸入密碼';
        case 1000003:
            return '找不到這個 {email} 使用者';
        case 1000004:
            return '此 email 已經被使用過了，請重新輸入';
        case 1000005:
            return '錯誤的使用者狀態';
        case 1000006:
            return '重設密碼的資訊連結錯誤';
        case 1000007:
            return '重設密碼的資訊已經過期，請重新設定';
        case 1000008:
            return '密碼或是 email 錯誤';
        case 1000009:
            return '錯誤的身份驗證資訊';
        case 1000010:
            return 'ID 必須是數字';
        case 1000011:
            return '使用者狀態必須是數字';
        case 1000012:
            return '未授權取得資料';
        default:
            break;
        }
    }
};
module.exports = ErrorHelper;