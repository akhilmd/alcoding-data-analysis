const User = require('../../models/User');
const File = require('../../models/Files');
let requireRole = require('../../middleware/Token').requireRole;
// var fileDB = require('../../middleware/fileStorage').fileDB;
let diskStorage = require('../../middleware/fileStorage').diskStorage;
let fileUpload = require('../../middleware/fileStorage').fileUpload;
let retrieveFile = require('../../middleware/fileStorage').retrieveFile;
let fs = require('fs');
let dir = process.cwd() + '/../temp';
let keyName = 'inputFile';

module.exports = (app) => {
    app.get('/api/contests/:userID/contenderInfo', function(req, res) {
        let userID = req.params.userID;
        if (!userID) {
            return res.status(400).send({
                success: false,
                message: 'Error: userID not in parameters.'
            });
        }

        User.find({
            _id: userID,
            isDeleted: false
        }, (err, users) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (!users) {
                return res.status(404).send({
                    success: false,
                    message: 'No users'
                });
            }
            if (users.length != 1) {
                return res.status(404).send({
                    success: false,
                    message: 'More than one user'
                });
            }
            let user = users[0].toObject();
            delete user.password;
            delete user.role;
            delete user.files;

            return res.status(200).send({
                success: true,
                message: 'Individual contender details retrieved.',
                contenderDetails: user
            });
        });
    });

    app.get('/api/contests/globalRankList', function(req, res) {
        User.find({
            isDeleted: false
        }, (err, users) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server error.'
                });
            }
            if (!users) {
                return res.status(404).send({
                    success: false,
                    message: 'No users'
                });
            }
            let userContenderDetails = [];
            for (let user of users) {
                let name = user.name.firstName + ' ' + user.name.lastName;
                pushObject = Object.assign({usn: user.usn, name}, user.contender.toObject());
                pushObject.rating = Math.round(pushObject.rating);
                pushObject.best = Math.round(pushObject.best);
                userContenderDetails.push(pushObject);
            }
            return res.status(200).send({
                success: true,
                message: 'globalRankList retrieved.',
                globalRankList: {userContenderDetails}
            });
        });
    });

    app.post('/api/contests/updateContenders', requireRole('admin'), function(req, res) {
        let usn = req.body.usn;
        let name = req.body.name;
        let email = req.body.email;
        let codejam = req.body.codejam;
        let rating = req.body.rating;
        let volatility = req.body.volatility;
        let timesPlayed = req.body.timesPlayed;
        let lastFive = req.body.lastFive;
        let best = req.body.best;
        let hackerearth = req.body.hackerearth;

        if (!usn) {
            return res.status(400).send({
                success: false,
                message: 'Error: First name cannot be blank.'
            });
        }

        // Process data
        usn = ('' + usn).toUpperCase().trim();

        // Deduplication flow
        User.find({
            usn: usn
        }, (err, previousUsers) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error: Server find error'
                });
            } else if (previousUsers.length > 0) { // Update
                previousUsers[0].contender.handles.codejam = codejam;
                previousUsers[0].contender.handles.hackerearth = hackerearth;
                previousUsers[0].contender.rating = rating;
                previousUsers[0].contender.volatility = volatility;
                previousUsers[0].contender.timesPlayed = timesPlayed;
                previousUsers[0].contender.lastFive = lastFive;
                previousUsers[0].contender.best = best;
                return res.status(200).send({
                    success: true,
                    message: 'Updated Contender'
                });
            } else {
                // New user
                const newUser = new User();

                newUser.usn = usn;
                if (name) {
                    newUser.name.firstName = name.split(' ')[0]; newUser.name.lastName = name.split(' ')[1];
                }
                if (email) {
                    newUser.basicInfo.email = email;
                }
                newUser.password = newUser.generateHash(usn);
                newUser.role = 'student';

                newUser.contender.handles['codejam'] = codejam;
                newUser.contender.handles['hackerearth'] = hackerearth;
                newUser.contender.rating = rating;
                newUser.contender.volatility = volatility;
                newUser.contender.timesPlayed = timesPlayed;
                newUser.contender.lastFive = lastFive;
                newUser.contender.best = best;

                newUser.save((err, user) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            success: false,
                            message: 'Server error'
                        });
                    }
                    console.log(newUser._id + ' added to DB.');
                    return res.status(200).send({
                        success: true,
                        message: 'Signed Up'
                    });
                });
            }
        });
    });
};
