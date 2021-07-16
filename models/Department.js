const mongoose = require('mongoose');
const slugify = require('slugify');

const DepartmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        slug: String,
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                'Please use a valid URL with HTTP or HTTPS'
            ]
        },
        phone: {
            type: String,
            maxlength: [20, 'Phone number can not be longer than 20 characters']
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        averageRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [10, 'Rating must can not be more than 10']
        },
        photo: {
            type: String,
            default: 'no-photo.jpg'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

// Create house slug from the name
DepartmentSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});


// Cascade delete courses when a house is deleted
DepartmentSchema.pre('remove', async function (next) {
    console.log(`Transaction being removed from department ${this._id}`);
    await this.model('Transaction').deleteMany({house: this._id});
    next();
});

// Reverse populate with virtuals
DepartmentSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'department',
    justOne: false
});

module.exports = mongoose.model('Department', DepartmentSchema);
