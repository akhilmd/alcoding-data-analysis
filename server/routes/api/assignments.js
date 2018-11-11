let Course = require('../../models/assignments/Course');
let Assignment = require('../../models/assignments/Assignment');
let requireRole = require('../../middleware/Token').requireRole;
let verifyUser = require('../../middleware/Token').verifyUser;
const File = require('../../models/Files');
let diskStorage = require('../../middleware/fileStorage').diskStorage;
let fileUpload = require('../../middleware/fileStorage').fileUpload;
let downloadFile = require('../../middleware/fileStorage').downloadFile;
let dir = process.cwd() + '/tmp';
let keyName = 'inputFile';

module.exports = (app) => {
    app.get('/api/assignments/:userID/courses', verifyUser, function(req, res) {
        if (!req.params.userID) {
            return res.status(400).send({
                success: false,
                message: 'Error: userID not in parameters. Please try again.'
            });
        }

        let search = {isDeleted: false};

        // Let all courses be visible to everyone
        // if (req.role == 'student') search.students = req.user_id;
        // else if (req.role == 'prof') search.professors = req.user_id;
        Course.find(search, (err, courses) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (courses.length < 1) {
                console.log(courses);
                return res.status(404).send({
                    success: false,
                    message: 'Error: No courses found for this user.'
                });
            }

            return res.status(200).send({
                success: true,
                message: 'Details successfully retrieved.',
                courses: {courses}
            });
        });
    });

    app.get('/api/assignments/:courseID/assignments', function(req, res) {
        let courseID = req.params.courseID;
        if (!courseID) {
            return res.status(400).send({
                success: false,
                message: 'courseID not in parameters'
            });
        }
        Course.find({
            _id: courseID,
            isDeleted: false
        }, (err, course) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (!course) {
                return res.status(404).send({
                    success: false,
                    message: 'Error: No course found.'
                });
            }
            Assignment.find({
                course: courseID,
                isDeleted: false
            }, (err, assignments) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server error.'
                    });
                }

                if (assignments.length == 0) {
                    return res.status(404).send({
                        success: false,
                        message: 'Error: No assignments found for this course.'
                    });
                }

                return res.status(200).send({
                    success: true,
                    message: 'Details successfully retrieved.',
                    assignments: {assignments}
                });
            });
        });
    });

    // Endpoint for viewing Assignments to be submitted by User in a Course
    app.get('/api/assignments/:courseID/:userID/new', function(req, res) {
        let courseID = req.params.courseID;
        let userID = req.params.userID;
        if (!courseID || !userID) {
            return res.status(400).send({
                success: false,
                message: 'courseID, userID required.'
            });
        }
        Course.find({
            _id: courseID,
            isDeleted: false
        }, (err, course) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (!course) {
                return res.status(404).send({
                    success: false,
                    message: 'Error: No course found.'
                });
            }
            Assignment.find({
                course: courseID,
                submissions: {
                    '$not': {'$elemMatch': {'user': userID}}
                },
                isDeleted: false
            }, (err, assignments) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server error.'
                    });
                }
                if (assignments) {
                    assignments = {assignments};
                }
                return res.status(200).send({
                    success: true,
                    message: 'Details successfully retrieved.',
                    assignments: assignments
                });
            });
        });
    });

    app.post('/api/courses/:userID/createCourse',
        requireRole('admin'),
        function(req, res) {
            if (!req.params.userID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: userID not in parameters. Please try again.'
                });
            }

            if (!req.body.name) {
                return res.status(400).send({
                    success: false,
                    message: 'Course name required.'
                });
            }

            if (!req.body.code) {
                return res.status(400).send({
                    success: false,
                    message: 'Course code required.'
                });
            }

            if (!req.body.department) {
                return res.status(400).send({
                    success: false,
                    message: 'Department required.'
                });
            }

            Course.find({
                code: req.body.code,
                isDeleted: false
            }, (err, previousCourse) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server Error'
                    });
                }
                if (previousCourse.length > 0) {
                    return res.status(409).send({
                        success: false,
                        message: 'Error: Course already exists'
                    });
                }
                // save the course
                const newCourse = new Course();

                newCourse.name = req.body.name;
                newCourse.code = req.body.code;
                newCourse.department = req.body.department;
                newCourse.description = req.body.description;
                newCourse.resourcesUrl = req.body.resourcesUrl;
                newCourse.duration.startDate = req.body.duration.startDate;
                newCourse.duration.endDate = req.body.duration.endDate;
                newCourse.details.credits = req.body.details.credits;
                newCourse.details.hours = req.body.details.hours;
                // This may cause profs to not be able to see courses
                newCourse.professors.push(req.params.userID);
                // console.log(newCourse)

                newCourse.save((err, course) => {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }
                    console.log(newCourse._id + ' Added to DB');
                    return res.status(200).send({
                        success: true,
                        message: 'New course created'
                    });
                });
            });
        });

    app.post('/api/assignments/:userID/deleteAssignment',
        requireRole('prof'),
        function(req, res) {
            if (!req.params.userID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: userID not in parameters. Please try again.'
                });
            }

            if (!req.body.assignID) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: Assignment ID cannot be blank.'
                });
            }

            if (!req.body.courseID) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: courseID cannot be blank'
                });
            }

            Course.find({
                _id: req.body.courseID,
                isDeleted: false
                // professors: req.params.userID
            }, function(err, courses) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server error'
                    });
                }
                if (courses.length == 0) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: No courses found for this user.'
                    });
                }

                Assignment.remove( {_id: req.body.assignID}, function(err) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: server error: could not delete assignment from Assignments'
                        });
                    }

                    Course.update( {_id: req.body.courseID}, {$pullAll: {assignments: [req.body.assignID]}}, function(err) {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error: server error: could not delete assignment from courses'
                            });
                        }
    
                        return res.status(200).send({
                            success: true,
                            message:
                                'Assignment ' + req.body.assignID+ ' deleted'
                        });
                    });
                });
            });
        });

    app.post('/api/assignments/:userID/createAssignment',
        requireRole('prof'),
        function(req, res) {
            if (!req.params.userID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: userID not in parameters. Please try again.'
                });
            }

            if (!req.body.name) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: First name cannot be blank.'
                });
            }
            if (!req.body.uniqueId) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: uniqueId cannot be blank'
                });
            }
            if (!req.body.type) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: type cannot be blank'
                });
            }
            if (!req.body.courseID) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: courseID cannot be blank'
                });
            }

            Course.find({
                _id: req.body.courseID,
                isDeleted: false
                // professors: req.params.userID
            }, function(err, courses) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server error'
                    });
                }
                if (courses.length == 0) {
                    return res.status(404).send({
                        success: false,
                        message: 'Error: No courses found for this user.'
                    });
                }

                let assignment = new Assignment();
                assignment.course = req.body.courseID;
                assignment.name = req.body.name;
                assignment.uniqueID = req.body.uniqueId;
                assignment.type = req.body.type;
                assignment.details = req.body.details;
                assignment.maxMarks = req.body.maxMarks;
                assignment.resourcesUrl = req.body.resourcesUrl;
                assignment.duration.startDate = req.body.duration.startDate;
                assignment.duration.endDate = req.body.duration.endDate;
                assignment.POC = req.body.POC;

                if (req.body.updateID) {
                    console.log("updating....", req.body.updateID);
                    let uAssign = assignment.toObject();
                    delete uAssign._id;
                    Assignment.update({_id: req.body.updateID}, uAssign, {multi: false}, function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send({
                                success: false,
                                message: 'Error: server error: could not update'
                            });
                        }
                        console.log("Assignment", req.body.updateID, "Successfully updated!");
                        return res.status(200).send({
                            success: true,
                            message:
                                'Assignment ' + assignment._id + ' Updated!'
                        });
                    });
                } else {
                    assignment.save(function(err, assignment) {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error: server error'
                            });
                        }
                        console.log(
                            'Assignment ' + assignment._id + ' saved to DB');
                        Course.findOneAndUpdate({
                            _id: assignment.course
                        }, {
                            $push: {
                                assignments: assignment._id
                            }
                        }, {new: true}, function(err, course) {
                            if (err) {
                                return res.status(500).send({
                                    success: false,
                                    message: 'Error: server error'
                                });
                            }
                            console.log(
                                'Assignment ' + assignment._id +
                                ' added to course ' + course._id);
                            return res.status(200).send({
                                success: true,
                                message:
                                    'Assignment ' + assignment._id + ' added to DB'
                            });
                        });
                    });
                }
            });
        });

    app.all('/api/assignments/:userID/:assignmentID/upload',
        verifyUser,
        diskStorage(dir).single(keyName),
        fileUpload,
        function(req, res, next) {
            Assignment.findOneAndUpdate({
                _id: req.params.assignmentID,
                isDeleted: false
            }, {
                $push: {
                    submissions: {
                        'user': req.params.userID
                    }
                }
            }, {new: true}, function(err, assignment) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: server error'
                    });
                }
                let submissions = [];
                for (let i=0; i<assignment.submissions.length; i++) {
                    let submission = assignment.submissions[i];
                    if (submission.user!=req.params.userID) {
                        submissions.push(submission);
                    }
                }
                File.find({
                    user_id: req.user_id,
                    originalname: req.file.originalname
                }, function(err, files) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }
                    // Get Latest file submitted by user
                    console.log(files);
                    req.fileID = files[files.length-1]._id;
                    let object = {'user': req.user_id, 'file': req.fileID};
                    submissions.push(object);

                    Assignment.findOneAndUpdate({
                        _id: req.params.assignmentID,
                        isDeleted: false
                    }, {
                        '$set': {
                            submissions: submissions
                        }
                    }, null, function(err, assignment) {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error: Server error'
                            });
                        }
                        console.log(
                            'User '
                            + req.params.userID
                            + ' has successfully submitted the assignment');
                        return res.status(200).send({
                            success: true,
                            message:
                                'User '
                                + req.params.userID
                                + ' has successfully submitted the assignment'
                        });
                    });
                });
            });
        });

    app.get('/api/assignments/:assignmentID/submissions',
        requireRole('prof'),
        function(req, res) {
            Assignment.find({
                _id: req.params.assignmentID
            }, function(err, assignments) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: server error'
                    });
                }
                if (!assignments) {
                    return res.status(404).send({
                        success: false,
                        message: 'Error: No such assignment found'
                    });
                }
                let assignment = assignments[0];
                // if (assignment.submissions.length) {
                return res.status(200).send({
                    success: true,
                    message:
                        'Assignment submissions successfully retrieved',
                    data: {assignment}
                });
                // } else {
                //     return res.status(404).send({
                //         success: false,
                //         message: 'Error: No submissions for this assignment'
                //     });
                // }
            });
        });

    app.get('/api/file/:fileID/details',
        requireRole('prof'),
        function(req, res) {
            File.find({
                _id: req.params.fileID
            }, function(err, files) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: server error'
                    });
                }
                if (!files) {
                    return res.status(404).send({
                        success: false,
                        message: 'Error: No such file found'
                    });
                }
                let file = files[0];
                return res.status(200).send({
                    success: true,
                    message:
                        'File details successfully retrieved',
                    data: {file}
                });
            });
        });

    app.get('/api/assignments/:fileID/download',
        requireRole('prof'),
        downloadFile(dir));

    app.get('/api/assignments/:assignmentID/details', function(req, res) {
        Assignment.find({
            _id: req.params.assignmentID,
            isDeleted: false
        }, function(err, assignments) {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: server error'
                });
            }
            if (!assignments) {
                return res.status(404).send({
                    success: false,
                    message: 'Error: No such assignment found'
                });
            }
            let assignment = assignments[0].toObject();
            delete assignment.submissions;
            return res.status(200).send({
                success: true,
                message: 'Assignment Details successfully retrieved',
                data: {assignment}
            });
        });
    });
};

