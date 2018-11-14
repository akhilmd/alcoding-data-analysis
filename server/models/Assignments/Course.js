const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const CourseSchema = new mongoose.Schema({
    professors: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number
    },
    description: {
        type: String
    },
    resourcesUrl: {
        type: String
    },
    duration: {
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    assignments: [{
        type: Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    details: {
        credits: {
            type: Number
        },
        hours: {
            type: Number
        },
        isCore: {
            type: Boolean,
            default: true
        }
    },
    marks: {
        t1: {
            type: Number
        },
        t2: {
            type: Number
        },
        assignment: {
            type: Number
        },
        esa: {
            type: Number
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Course', CourseSchema);
