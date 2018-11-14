const User = require('../../models/User');
// const File = require('../../models/Files');
let requireRole = require('../../middleware/Token').requireRole;
// var fileDB = require('../../middleware/fileStorage').fileDB;
let diskStorage = require('../../middleware/fileStorage').diskStorage;
let fileUpload = require('../../middleware/fileStorage').fileUpload;
// let retrieveFile = require('../../middleware/fileStorage').retrieveFile;
// let fs = require('fs');
let dir = process.cwd() + '/../temp';
let keyName = 'inputFile';

module.exports = (app) => {
    // app.get('/api/admin/createAdmin', function (req, res) {

    //     var usn = "usn_prof_2";
    //     var firstName = "fn_prof_2";
    //     var lastName = undefined;
    //     var email = undefined;
    //     var role = "prof";

    //     if (!firstName) {
    //         return res.status(400).send({
    //             success: false,
    //             message: 'Error: First name cannot be blank.'
    //         });
    //     }
    //     if (!usn) {
    //         return res.status(400).send({
    //             success: false,
    //             message: 'Error: usn cannot be blank.'
    //         });
    //     }

    //     // Process data
    //     usn = ('' + usn).toUpperCase().trim();
    //     email = ('' + email).toLowerCase().trim();

    //     // Deduplication flow
    //     User.find({
    //         usn: usn
    //     }, (err, previousUsers) => {
    //         if (err) {
    //             return res.status(500).send({
    //                 success: false,
    //                 message: 'Error: Server find error'
    //             });
    //         } else if (previousUsers.length > 0) {
    //             return res.status(409).send({
    //                 success: false,
    //                 message: 'Error: Account already exists.'
    //             });
    //         }
    //         // Save the new user
    //         const newUser = new User();

    //         newUser.usn = usn;
    //         newUser.name.firstName = firstName;
    //         if (lastName) { newUser.name.lastName = lastName; }
    //         if (email) { newUser.basicInfo.email = email; }
    //         newUser.password = newUser.generateHash(usn);

    //         if (role) {
    //             // if (role == "admin") {
    //             //     return res.status(403).send({
    //             //         success: false,
    //             //         message: "Error: Forbidden request, Cannot assign role:\"admin\"."
    //             //     });
    //             // }
    //             newUser.role = role;
    //         }
    //         newUser.save((err, user) => {
    //             if (err) {
    //                 return res.status(500).send({
    //                     success: false,
    //                     message: 'Error: Server error'
    //                 });
    //             }
    //             console.log(newUser._id + " Added to DB.")
    //             return res.status(200).send({
    //                 success: true,
    //                 message: 'Signed up'
    //             });
    //         });
    //     });
    // }); // end of sign up endpoint

    app.post('/api/admin/signup', requireRole('admin'), function(req, res) {
        let usn = req.body.usn;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let email = req.body.email;
        let role = req.body.role;

        if (!firstName) {
            return res.status(400).send({
                success: false,
                message: 'Error: First name cannot be blank.'
            });
        }
        if (!usn) {
            return res.status(400).send({
                success: false,
                message: 'Error: usn cannot be blank.'
            });
        }

        // Process data
        usn = ('' + usn).toUpperCase().trim();
        email = ('' + email).toLowerCase().trim();

        // Deduplication flow
        User.find({
            usn: usn
        }, (err, previousUsers) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server find error'
                });
            } else if (previousUsers.length > 0) {
                return res.status(409).send({
                    success: false,
                    message: 'Error: Account already exists.'
                });
            }
            // Save the new user
            const newUser = new User();

            newUser.usn = usn;
            newUser.name.firstName = firstName;
            if (lastName) {
                newUser.name.lastName = lastName;
            }
            if (email) {
                newUser.basicInfo.email = email;
            }
            newUser.password = newUser.generateHash(usn);

            if (role) {
                if (role == 'admin') {
                    return res.status(403).send({
                        success: false,
                        message: 'Error: Forbidden request, Cannot assign role:"admin".'
                    });
                }
                newUser.role = role;
            }
            newUser.save((err, user) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'Error: Server error'
                    });
                }
                console.log(newUser._id + ' Added to DB.');
                return res.status(200).send({
                    success: true,
                    message: 'Signed up'
                });
            });
        });
    }); // end of sign up endpoint

    app.post('/api/admin/upload', requireRole('admin'), diskStorage(dir).single(keyName), fileUpload, function(req, res) {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: 'Error: File not recieved'
            });
        }
        if (req.file) {
            return res.status(200).send({
                success: true,
                message: 'File uploaded and added to DB',
                data: req.file
            });
        }
    });
};
