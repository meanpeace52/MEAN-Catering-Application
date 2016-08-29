'use strict';

import * as auth from '../../auth/auth.service';

var express = require('express');
var router = express.Router();

let StripeController = require('./stripe.controller');
let DwollaController = require('./dwolla.controller');
let AdminPayController = require('./adminPay.controller');
let TaxesController = require('./taxes.controller');
router.post('/taxes/address/verify', auth.isAuthenticated(), TaxesController.verifyAddress);
router.post('/taxes/lookup', auth.isAuthenticated(), TaxesController.lookup);
router.post('/card/auth', auth.isAuthenticated(), StripeController.auth);
router.post('/card/capture', auth.isAuthenticated(), StripeController.capture);
router.post('/card/verify', auth.isAuthenticated(), StripeController.verify);
router.post('/card/update', auth.isAuthenticated(), StripeController.update);
router.get('/card/token', auth.isAuthenticated(), StripeController.getToken);
router.get('/dwolla/startAuth', auth.isAuthenticated(), DwollaController.startAuth);
router.get('/dwolla/endAuth', auth.isAuthenticated(), DwollaController.endAuth);
router.post('/pay', auth.isAuthenticated(), AdminPayController.pay);

module.exports = router;

