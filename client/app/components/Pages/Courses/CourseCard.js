/* eslint-disable react/prop-types, react/no-string-refs */

import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

class CourseCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseID: '',
            profID: '',
            profName: '',
            department: '',
            semester: 0,
            description: '',
            resourceUrl: '',
            credits: 0,
            hours: 0,
            t1: 0,
            t2: 0,
            assignment: 0,
            esa: 0
        };
        this.editCallback=this.editCallback.bind(this);
        this.deleteCallback=this.deleteCallback.bind(this);
        this.onSubmitBulkFile=this.onSubmitBulkFile.bind(this);
        this.onChange=this.onChange.bind(this);
    }
    componentDidMount() {
        let self = this;
        let token = localStorage.getItem('token');

        this.setState({
            courseID: this.props.courseID,
            profName: ''
        });

        let apiPath = '/api/account/' + this.props.profID + '/details';
        axios.get(apiPath, {
            headers: {
                'x-access-token': token
            }
        }).then(function(response) {
            if (!response.data.success) {
                // TODO: throw appropriate error and redirect
                console.log('Error: ' + response.data);
                return;
            }

            self.setState({
                profName: response.data.user.name.firstName + ' ' + response.data.user.name.lastName
            });
        })
            .catch(function(error) {
                console.log('Error2: ', error);
            });
    }

    editCallback() {
        this.props.editCourse(this.props.courseID);
    }

    deleteCallback() {
        this.props.deleteCourse(this.props.courseID);
    }

    onSubmitBulkFile() {
        event.preventDefault();
        let self = this;
        let userID = localStorage.getItem('user_id');
        let token = 'Bearer ' + localStorage.getItem('token');
        let inputData = new FormData();
        inputData.append('inputFile', this.state.file);
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token
            }
        };
        let apiPath = '/api/courses/' + this.props.courseID + '/bulkAddStudents';
        axios.post(apiPath, inputData, config)
            .then((res) => {
                console.log(res.data);
                if (res.data.success) {
                    self.setState({
                        showUpload: false
                    });
                } else {
                    alert('File failed to upload!');
                }
                window.location.reload();
            })
            .catch((err) => {
                console.log(err);
                alert('sstudents failed to be uploaded');
            });
    }

    onChange(e) {
        this.setState({
            file: e.target.files[0]
        });
    }

    render() {
        let content;
        const adminContent = (
            <div id="CourseCard">
                <div className="card bg-light mx-auto">
                    <div className="card-title text-center"><h3><strong><i>{this.props.code}</i>: {this.props.name}</strong></h3></div>
                    <div className="card-body text-left">
                        Instructor: {this.state.profName}<br />
                        Credits: {this.props.credits}<br />
                        Description: {this.props.description}<br />
                        Resource URL: <a href={'//' + this.props.resourceUrl}>{this.props.resourceUrl}</a>
                    </div>
                    <div className="card-footer">
                        <Link className='btn btn-dark mx-2' to={{
                            pathname: '/courses/' + this.props.courseID,
                            state: {
                                code: this.props.code,
                                name: this.props.name,
                                department: this.props.department,
                                description: this.props.description,
                                semester: this.props.semester,
                                resourceUrl: this.props.resourceUrl,
                                credits: this.props.credits,
                                hours: this.props.hours,
                                t1: this.props.t1,
                                t2: this.props.t2,
                                assignment: this.props.assignment,
                                esa: this.props.esa
                            }
                        }}> View Course </Link>
                        <button type="button" className="btn btn-dark w-20 mx-3" onClick={this.editCallback}>Edit</button>
                        <button type="button" className="btn btn-dark w-20 mx-3" onClick={this.deleteCallback}>Delete</button>
                        <br/>
                        <br/>
                        <div className="row" style={{paddingLeft: "22px"}}>
                            <div className="custom-file col-sm">
                                <input type="file" className="custom-file-input" id="validatedCustomFile" onChange={this.onChange}/>
                                <label className="custom-file-label" htmlFor="validatedCustomFile">Choose file</label>
                            </div>
                            <div className="col-sm">
                                <button className="btn btn-dark" onClick={this.onSubmitBulkFile}> Submit </button>
                            </div>
                        </div>
                    </div>
                </div>
                <br />
            </div>
        );
        const profContent = (
            <div id="CourseCard">
                <div className="card bg-light mx-auto">
                    <div className="card-title text-center"><h3><strong><i>{this.props.code}</i>: {this.props.name}</strong></h3></div>
                    <div className="card-body text-left">
                        Instructor: {this.state.profName}<br />
                        Credits: {this.props.credits}<br />
                        Description: {this.props.description}<br />
                        Resource URL: <a href={'//' + this.props.resourceUrl}>{this.props.resourceUrl}</a>
                    </div>
                    <div className="card-footer">
                        <Link className='btn btn-dark mx-2' to={{
                            pathname: '/courses/' + this.props.courseID,
                            state: {
                                code: this.props.code,
                                name: this.props.name,
                                department: this.props.department,
                                description: this.props.description,
                                semester: this.props.semester,
                                resourceUrl: this.props.resourceUrl,
                                credits: this.props.credits,
                                hours: this.props.hours,
                                t1: this.props.t1,
                                t2: this.props.t2,
                                assignment: this.props.assignment,
                                esa: this.props.esa
                            }
                        }}> View Course </Link>

                    </div>
                </div>
                <br />
            </div>
        );

        if (this.props.role == 'admin') {
            content = adminContent;
        } else {
            content = profContent;
        }
        return (
            <div>{content}</div>
        );
    }
}

export default CourseCard;
