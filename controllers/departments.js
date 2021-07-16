const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Department = require('../models/Department');

// @desc      Get all departments
// @route     GET /api/v1/departments
// @access    Public
exports.getDepartments = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single department
// @route     GET /api/v1/departments/:id
// @access    Public
exports.getDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        return next(
            new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({success: true, data: department});
});

// @desc      Create new department
// @route     POST /api/v1/departments
// @access    Private
exports.createDepartment = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id;

    // Check for published department
    const publishedDepartment = await Department.findOne({user: req.user.id});

    // If the user is not an admin, they can only add one department
    if (publishedDepartment && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a department`,
                400
            )
        );
    }

    const house = await Department.create(req.body);

    res.status(201).json({
        success: true,
        data: house
    });
});

// @desc      Update department
// @route     PUT /api/v1/departments/:id
// @access    Private
exports.updateDepartment = asyncHandler(async (req, res, next) => {
    let department = await Department.findById(req.params.id);

    if (!department) {
        return next(
            new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is department owner
    if (department.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this department`,
                401
            )
        );
    }

    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: department});
});

// @desc      Delete department
// @route     DELETE /api/v1/department/:id
// @access    Private
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id);

    if (!department) {
        return next(
            new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is department owner
    if (department.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this department`,
                401
            )
        );
    }

    await department.remove();

    res.status(200).json({success: true, data: {}});
});


// @desc      Upload photo for department
// @route     PUT /api/v1/departments/:id/photo
// @access    Private
exports.housePhotoUpload = asyncHandler(async (req, res, next) => {
    const house = await Department.findById(req.params.id);

    if (!house) {
        return next(
            new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is department owner
    if (house.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this department`,
                401
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${house._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Department.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});
