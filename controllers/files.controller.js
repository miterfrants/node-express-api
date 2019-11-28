const express = require('express');
const multer = require('multer');
const moment = require('moment-timezone');
const fs = require('fs');
const httpStatus = require('http-status-codes');

const AuthMW = require('../middleware/auth.middleware.js');
const ErrorHelper = require('../helpers/error.helper.js');
const router = express.Router();

router.post('/:model/:id', AuthMW.checkAuth, (req, res) => {
    const id = Number(req.params.id);
    const model = req.params.model;
    if (isNaN(id)) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.ID_SHOULD_BE_INTEGER, httpStatus.BAD_REQUEST);
    }

    if (['debtors'].indexOf(model) === -1) {
        throw new ErrorHelper.CustomError(ErrorHelper.ErrorType.WRONG_MODEL_NAME, httpStatus.BAD_REQUEST);
    }

    const destPath = `../dashboard/uploads/${req.params.model}/${req.params.id}`;

    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, {
            recursive: true
        }, (err) => {
            if (err) throw err;
        });
    }
    let filenames = [];
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destPath);
        },
        filename: function (req, file, cb) {
            const extensionName = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            const filename = moment().format('YYYYMMDDHHmmssSSS');
            const fullname = `${filename}.${extensionName}`;
            filenames.push({
                filename: fullname,
                name: file.originalname.substring(0, file.originalname.lastIndexOf('.'))
            });
            cb(null, fullname);
        }
    });
    const upload = multer({
        storage: storage
    }).array('files', 12);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            throw new Error('上傳檔案時發生錯誤:' + err.toString());
        } else if (err) {
            // An unknown error occurred when uploading.
            throw new Error('上傳檔案時發生錯誤:' + err.toString());
        }
        res.send(filenames);
    });
});

module.exports = router;