import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import AssignmentCard from './AssignmentCard';
class Assignments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: [],
            role: 'student',
            assignments: []
        };
    }
    componentDidMount() {
        let self = this;
        let token = localStorage.getItem('token');
        let userID = localStorage.getItem('user_id');

        let apiPath = '/api/account/' + userID + '/details';
        axios.get(apiPath, {
            headers: {
                'x-access-token': token,
                'Content-Type': 'application/json'
            }
        })
            .then(function(response) {
                if (!response.data.success) {
                    // TODO: throw appropriate error and redirect
                    console.log('Error1: ' + response.data);
                    return;
                }
                let data = response.data;
                self.setState({
                    role: data.user.role
                });
            })
            .catch(function(error) {
                console.log('Error2: ', error);
            });
        apiPath = '/api/assignments/' + userID + '/courses';
        axios.get(apiPath, {
            headers: {
                'x-access-token': token,
                'Content-Type': 'application/json'
            }
        })
            .then(function(response) {
                if (!response.data.success) {
                    // TODO: throw appropriate error and redirect
                    console.log('Error1: ' + response.data);
                    <Redirect to="/" />;
                }
                let data = response.data;
                // console.log(data);
                self.setState({
                    courses: data.courses.courses
                });
                let courses = data.courses.courses;
                for (let i = 0; i < courses.length; i++) {
                    let apiPath = '/api/assignments/' + courses[i]._id + '/' + userID + '/new';
                    axios.get(apiPath, {
                        headers: {
                            'x-access-token': token,
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(function(response) {
                            if (!response.data.success) {
                                console.log('Error1: ' + response.data);
                            }
                            let data = response.data;
                            self.setState({
                                assignments: self.state.assignments.concat(data.assignments.assignments)
                            });
                            console.log(response.data);
                        })
                        .catch(function(error) {
                            console.log('Error2: ', error);
                        });
                }// End of for loop
            });
    }
    render() {
        let content;
        const profContent = (
            <div>
                {
                    this.state.assignments.map(function(each) {
                        return <AssignmentCard key={each.uniqueID} uniqueID={each.uniqueID} name={each.name} details={each.details} type={each.type.toUpperCase()} maxMarks={each.maxMarks} resourceUrl={each.resourceUrl} questions={each.questions} assignmentID={each._id} submissions={each.submissions} role='prof' />;
                    })
                }
                <div className="text-center"><a href="/" className="btn btn-dark" role="button">Home</a></div>
            </div>
        );
        const studContent = (
            <div>
                {
                    this.state.assignments.map(function(each) {
                        return <AssignmentCard key={each.uniqueID} uniqueID={each.uniqueID} name={each.name} details={each.details} type={each.type.toUpperCase()} maxMarks={each.maxMarks} resourceUrl={each.resourceUrl} questions={each.questions} assignmentID={each._id} submissions={each.submissions} role='student' />;
                    })
                }
                <div className="text-center"><a href="/" className="btn btn-dark" role="button">Home</a></div>
            </div>
        );
        if (this.state.role == 'prof') {
            content = profContent;
        } else {
            content = studContent;
        }
        return (
            <div>{content}</div>

        );
    }
}
export default Assignments;
