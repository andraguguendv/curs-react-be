const express = require('express');
const {
    getTransaction,
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transactions');

const Transaction = require('../models/Transaction');

const router = express.Router({mergeParams: true});

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

router
    .route('/')
    .get(
        advancedResults(Transaction, {
            path: 'department',
            select: 'name description'
        }),
        getTransactions
    )
    .post(protect, authorize('publisher', 'admin'), addTransaction);

router
    .route('/:id')
    .get(getTransaction)
    .put(protect, authorize('publisher', 'admin'), updateTransaction)
    .delete(protect, authorize('publisher', 'admin'), deleteTransaction);

module.exports = router;
