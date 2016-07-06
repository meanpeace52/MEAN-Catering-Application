'use strict';

var express = require('express');
var router = express.Router();

let payment = require('./payments.controller');
router.post('/checkout', payment.checkout);
router.get('/tokens', payment.tokens);

module.exports = router;

