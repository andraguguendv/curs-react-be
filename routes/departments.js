const express = require('express');
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} = require('../controllers/departments');

const Department = require('../models/Department');

// Include other resource routers
const courseRouter = require('./transactions');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:departmentId/transactions', courseRouter);


router
    .route('/')
    .get(advancedResults(Department, 'courses'), getDepartments)
    .post(protect, authorize('publisher', 'admin'), createDepartment);

router
    .route('/:id')
    .get(getDepartment)
    .put(protect, authorize('publisher', 'admin'), updateDepartment)
    .delete(protect, authorize('publisher', 'admin'), deleteDepartment);

module.exports = router;
