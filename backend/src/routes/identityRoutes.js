/**
 * Identity Routes  (/api/identity)
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { createIdentity, getIdentity, deleteIdentity } = require('../controllers/identityController');

router.post('/create',     asyncHandler(createIdentity));
router.get('/:userId',     asyncHandler(getIdentity));
router.delete('/:userId',  asyncHandler(deleteIdentity));

module.exports = router;
