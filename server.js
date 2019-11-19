'use strict';
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const ErrorHelper = require('./helpers/error.helper.js');
const upload = multer();

var evnSecretObject = JSON.parse(fs.readFileSync('secret.json').toString());
for (let key in evnSecretObject) {
    process.env[key] = evnSecretObject[key];
}

var evnObject = JSON.parse(fs.readFileSync(`appsetting.${process.env.NODE_ENV || ''}.json`).toString());
for (let key in evnObject) {
    process.env[key] = evnObject[key];
}

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(upload.array());
app.use(express.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: undefined
}));

const PORT = 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST);

var usersController = require('./controllers/users.controller.js');
app.use('/api/users', usersController);

var authController = require('./controllers/auth.controller.js');
app.use('/api/auth', authController);

app.use((err, req, res, next) => {
    ErrorHelper.centralErrorHandler(err, res, next);
});

console.log(`Running on http://${HOST}:${PORT}`);