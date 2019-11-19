'use strict';
const fs = require('fs');
const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const ErrorHelper = require('./helpers/error.helper.js');
const cors = require('cors');
const upload = multer();

const evnSecretObject = JSON.parse(fs.readFileSync('secret.json').toString());
for (let key in evnSecretObject) {
    process.env[key] = evnSecretObject[key];
}

const evnCommonObject = JSON.parse(fs.readFileSync('appsetting.json').toString());
for (let key in evnCommonObject) {
    process.env[key] = evnCommonObject[key];
}

let evnObject = JSON.parse(fs.readFileSync(`appsetting.${process.env.NODE_ENV || ''}.json`).toString());
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
app.use(cors({
    origin: process.env.CrossOrigin
}));

const PORT = 8080;
const HOST = '0.0.0.0';

const API_PREFIX = '/api/v1/';
var usersController = require('./controllers/users.controller.js');
app.use(`${API_PREFIX}users`, usersController);

var authController = require('./controllers/auth.controller.js');
app.use(`${API_PREFIX}auth`, authController);

app.use((err, req, res, next) => {
    ErrorHelper.centralErrorHandler(err, res, next);
});

if (process.env.NODE_ENV === 'dev') {
    http.createServer({
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/server.crt')
    }, app).listen(8081);
    console.log(`Running on http://${HOST}:8081`);
} else {
    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);
}