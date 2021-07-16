const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a transaction title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    author: {
        type: String,
        required: [true, 'Please add an author']
    },
    amount: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add an amount between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    department: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
