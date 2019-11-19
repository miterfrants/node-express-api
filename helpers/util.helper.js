module.exports = {
    warpAsync: (fn) => {
        return function (req, res, next) {
            fn(req, res, next).catch(next);
        };
    },
    CUSTOM_RESP: {
        'OK': 'OK',
        'FAILED': 'FAILED'
    }
};