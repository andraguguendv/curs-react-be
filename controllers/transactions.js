const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');

// @desc      Get transactions
// @route     GET /api/v1/transactions
// @route     GET /api/v1/departments/:transactionId/transactions
// @access    Public
exports.getTransactions = asyncHandler(async (req, res, next) => {
    if (req.params.transactionId) {
        const transactions = await Transaction.find({house: req.params.transactionId});

        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc      Get single transaction
// @route     GET /api/v1/transactions/:id
// @access    Public
exports.getTransaction = asyncHandler(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id).populate({
        path: 'departments',
        select: 'name description'
    });

    if (!transaction) {
        return next(
            new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: transaction
    });
});

// @desc      Add transaction
// @route     POST /api/v1/departments/:departmentId/transactions
// @access    Private
exports.addTransaction = asyncHandler(async (req, res, next) => {
    req.body.house = req.params.departmentId;
    req.body.user = req.user.id;

    const department = await Department.findById(req.params.departmentId);

    if (!department) {
        return next(
            new ErrorResponse(
                `No department with the id of ${req.params.departmentId}`,
                404
            )
        );
    }

    // Make sure user is house owner
    if (department.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a transaction to department ${department._id}`,
                401
            )
        );
    }

    const course = await Transaction.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc      Update transaction
// @route     PUT /api/v1/transactions/:id
// @access    Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        return next(
            new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is book owner
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update transaction ${transaction._id}`,
                401
            )
        );
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    transaction.save();

    res.status(200).json({
        success: true,
        data: transaction
    });
});

// @desc      Delete transaction
// @route     DELETE /api/v1/transaction/:id
// @access    Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        return next(
            new ErrorResponse(`No transaction with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is transaction owner
    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete transaction ${transaction._id}`,
                401
            )
        );
    }

    await transaction.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});
