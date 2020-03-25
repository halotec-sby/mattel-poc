const express  = require('express');

const {Router} = express;
const router   = new Router();

const reader   = require('./reader');
const other    = require('./other');

router.use('/ble/reader', reader);
router.use('/ble/other', other);

module.exports = router;
