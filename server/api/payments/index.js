'use strict';

var express = require('express');
var router = express.Router();

let StripeController = require('./stripe.controller');
let DwollaController = require('./dwolla.controller');
let AdminPayController = require('./adminPay.controller');
let TaxesController = require('./taxes.controller');
router.post('/taxes/address/verify', TaxesController.verifyAddress);
router.post('/taxes/lookup', TaxesController.lookup);
router.post('/card/auth', StripeController.auth);
router.post('/card/capture', StripeController.capture);
router.post('/card/verify', StripeController.verify);
router.post('/card/update', StripeController.update);
router.get('/card/token', StripeController.getToken);
router.get('/dwolla/startAuth', DwollaController.startAuth);
router.get('/dwolla/endAuth', DwollaController.endAuth);
router.post('/pay', AdminPayController.pay);

module.exports = router;

