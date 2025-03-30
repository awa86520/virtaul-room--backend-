const express = require('express');
const { createDeal} = require('../controllers/dealController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
router.post('/', authMiddleware, createDeal);
//router.get('/', authMiddleware, getDeals);
//router.patch('/:id/status', authMiddleware, updateDealStatus);
module.exports = router;