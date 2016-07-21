'use strict';

var express = require('express');
var router = express.Router();

let StripeController = require('./stripe.controller');
let DwollaController = require('./dwolla.controller');
router.post('/card/checkout', StripeController.checkout);
router.post('/card/verify', StripeController.verify);
router.get('/card/token', StripeController.getToken);
router.get('/bank/auth', DwollaController.startAuth);
router.get('/bank/token', DwollaController.endAuth);

module.exports = router;

