const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.send('users');
});

router.get('/about', function (req, res) {
    res.send('About this user');
});

module.exports = router;