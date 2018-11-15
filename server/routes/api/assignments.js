let Course = require('../../models/assignments/Course');
let User = require('../../models/User');
let Assignment = require('../../models/assignments/Assignment');
let requireRole = require('../../middleware/Token').requireRole;
let csvToJson = require('convert-csv-to-json');
let verifyUser = require('../../middleware/Token').verifyUser;
const File = require('../../models/Files');
let diskStorage = require('../../middleware/fileStorage').diskStorage;
let fileUpload = require('../../middleware/fileStorage').fileUpload;
let downloadFile = require('../../middleware/fileStorage').downloadFile;
let dir = process.cwd() + '/tmp';
let fs = require('fs');
let keyName = 'inputFile';
let multer = require('multer');
let upload = multer({dest: dir});

module.exports = (app) => {
    // show all courses for admin
    app.get('/api/assignments/:userID/allCourses', verifyUser, function(req, res) {
        if (!req.params.userID) {
            return res.status(400).send({
                success: false,
                message: 'Error: userID not in parameters. Please try again.'
            });
        }

        let search = {isDeleted: false};
        Course.find(search, (err, courses) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (courses.length < 1) {
                // console.log(courses);
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

    // show instructed courses to professor
    app.get('/api/assignments/:userID/profCourses', verifyUser, function(req, res) {
        if (!req.params.userID) {
            return res.status(400).send({
                success: false,
                message: 'Error: userID not in parameters. Please try again.'
            });
        }

        let search = {
            professors: req.params.userID, 
            isDeleted: false
        };
        Course.find(search, (err, courses) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (courses.length < 1) {
                // console.log(courses);
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

    // show assigned courses to student
    app.get('/api/assignments/:userID/studentCourses', verifyUser, function(req, res) {
        if (!req.params.userID) {
            return res.status(400).send({
                success: false,
                message: 'Error: userID not in parameters. Please try again.'
            });
        }

        let search = {
            students: ObjectId(req.params.userID), 
            isDeleted: false
        };
        Course.find(search, (err, courses) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (courses.length < 1) {
                // console.log(courses);
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
                    let newValues= {
                        name: req.body.name,
                        department: req.body.department,
                        description: req.body.description,
                        resourcesUrl: req.body.resourcesUrl,
                        semester: req.body.semester,
                        duration: {
                            startDate: req.body.duration.startDate,
                            endDate: req.body.duration.endDate
                        },
                        details: {
                            credits: req.body.details.credits,
                            hours: req.body.details.hours
                        },
                        professors: req.body.professors,
                        marks: {
                            t1: req.body.marks.t1,
                            t2: req.body.marks.t2,
                            assignment: req.body.marks.assignment,
                            esa: req.body.marks.esa
                        }
                    };

                    Course.updateOne({code: req.body.code}, newValues, function(err) {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error: Server error while editing a course'
                            });
                        }
                    });

                    return res.status(200).send({
                        success: true,
                        message: 'Course updated successfully'
                    });
                }
                // save the course
                const newCourse = new Course();

                newCourse.name = req.body.name;
                newCourse.code = req.body.code;
                newCourse.department = req.body.department;
                newCourse.description = req.body.description;
                newCourse.semester = req.body.semester;
                newCourse.resourcesUrl = req.body.resourcesUrl;
                newCourse.duration.startDate = req.body.duration.startDate;
                newCourse.duration.endDate = req.body.duration.endDate;
                newCourse.details.credits = req.body.details.credits;
                newCourse.details.hours = req.body.details.hours;
                newCourse.professors.push(req.body.professors);
                newCourse.marks.t1 = req.body.marks.t1;
                newCourse.marks.t2 = req.body.marks.t2;
                newCourse.marks.assignment = req.body.marks.assignment;
                newCourse.marks.esa = req.body.marks.esa;

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

    app.post('/api/courses/:userID/deleteCourse',
        requireRole('admin'),
        function(req, res) {
            let courseID=req.body.courseID;
            if (!req.params.userID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: userID not in parameters. Please try again.'
                });
            }

            if (!req.body.courseID) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: courseID cannot be blank'
                });
            }

            Course.find({
                _id: courseID,
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

                Course.remove({_id: courseID}, function(err) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: server error: could not delete course from Courses'
                        });
                    }
                });

                Assignment.find({course: courseID}, function(err, assignments) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }
                    if (assignments.length > 0) {
                        Assignment.deleteMany({course: courseID}, function(err) {
                            if (err) {
                                return res.status(500).send({
                                    success: false,
                                    message: 'Error: server error: could not delete assignments from Assignments while deleting course'
                                });
                            }
                        });
                    }
                });

                return res.status(200).send({
                    success: true,
                    message:
                        'Course ' + courseID + ' deleted'
                });
            });
        });

    app.post('/api/courses/:userID/createMany',
        verifyUser,
        upload.single(keyName),
        function(req, res) {
            let json = csvToJson.fieldDelimiter(',').getJsonFromCsv(req.file.path);
            let obj=null;
            let courseExists=false;
            for (let i=0; i<json.length; i++) {
                obj=json[i];
                if (!obj.code) {
                    console.log('Missing course code');
                    continue;
                }
                Course.find({code: obj.code}, function(err, course) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: server error'
                        });
                    }
                    if (course.length!=0) {
                        console.log('Course '+obj.code+' already exists');
                        courseExists = true;
                    }
                });
                if (courseExists) {
                    continue;
                }
                if (!obj.profusn || !obj.t1 || !obj.t2 || !obj.assignment || !obj.esa || !obj.semester || !obj.name || !obj.startDate || !obj.endDate || !obj.credits || !obj.hours || !obj.department || !obj.resourcesUrl || !obj.description) {
                    console.log('Missing details for ' +obj.code);
                    continue;
                }
                let startDate = obj.startDate.split('-').map(val => Number(val));
                let endDate = obj.endDate.split('-').map(val => Number(val));
                startDate[1] = startDate[1]-1;
                endDate[1] = endDate[1]-1;
                if (startDate.length!=3 || startDate[0].toString().length!=4 || startDate[1].toString().length>2 || startDate[2].toString().length>2) {
                    console.log('Invalid format of startDate for '+obj.code);
                    continue;
                }
                if (endDate.length!=3 || endDate[0].toString().length!=4 || endDate[1].toString().length>2 || endDate[2].toString().length>2) {
                    console.log('Invalid format of endDate for '+obj.code);
                    continue;
                }
                const newCourse = new Course();

                newCourse.name = obj.name;
                newCourse.code = obj.code;
                newCourse.department = obj.department;
                newCourse.description = obj.description;
                newCourse.resourcesUrl = obj.resourcesUrl;
                newCourse.duration.startDate = new Date(startDate[0], startDate[1], startDate[2]);
                newCourse.duration.endDate = new Date(endDate[0], endDate[1], endDate[2]);
                newCourse.details.credits = obj.credits;
                newCourse.details.hours = obj.hours;
                newCourse.marks.t1 = obj.t1;
                newCourse.marks.t2 = obj.t2;
                newCourse.marks.esa = obj.esa;
                newCourse.marks.assignment = obj.assignment;
                newCourse.marks.sem = obj.sem;

                User.find({usn: obj.profusn.toUpperCase()}, function(err, users) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }

                    console.log(users);
                    newCourse.professors.push(users[0]._id);

                    newCourse.save((err) => {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error: Server error'
                            });
                        }
                    });
                    console.log(obj.name+' successfully created');
                });
            }
            fs.unlinkSync(req.file.path);
            return res.status(200).send({
                success: true,
                message:
                    'Courses added'
            });
        });

    app.post('/api/courses/:courseID/bulkAddStudents',
        verifyUser,
        upload.single(keyName),
        function(req, res) {
            let json = csvToJson.fieldDelimiter(',').getJsonFromCsv(req.file.path);
            let obj=null;
            let userIds = [];
            let usns = [];

            for (let i = 0; i < json.length; i++) {
                obj=json[i];
                if (!obj.usn) {
                    console.log('Missing USN');
                    continue;
                }
                usns.push(obj.usn.toUpperCase().trim());
            }

            User.find({usn: {$in: usns}}, function(err, users) {
                console.log(users);

                userIds = users.map(function(user) {
                    return user._id;
                });

                console.log(userIds);
                Course.update({_id: req.params.courseID}, {students: userIds}, function(err, course) {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: 'Error: server error'
                        });
                    }

                    fs.unlinkSync(req.file.path);
                    return res.status(200).send({
                        success: true,
                        message: 'Courses added'
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
                // console.log("the questions in assignments.js are ---->",req.body.questions);
                assignment.questions = req.body.questions;
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

    app.post('/api/assignments/:assignmentID/:userID/setMarks',
        requireRole('prof'),
        function(req, res) {
            if (!req.params.userID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: userID not in parameters. Please try again.'
                });
            }

            if (!req.params.assignmentID) {
                return res.status(400).send({
                    success: false,
                    message:
                        'Error: assignmentID not in parameters. Please try again.'
                });
            }

            if (!req.body.marks) {
                return res.status(400).send({
                    success: false,
                    message: 'Error: marks cannot be blank.'
                });
            }

            Assignment.update({_id: req.params.assignmentID, "submissions.user": req.params.userID}, {
                "$set": {
                    "submissions.$.marksObtained": req.body.marks
                }
            }, function(err) {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: server error'
                    });
                }

                console.log("succ");
                return res.status(200).send({
                    success: true,
                    message: "marks given"
                });
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

