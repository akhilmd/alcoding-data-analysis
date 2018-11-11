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
            profName: ''
        };
    }
    componentDidMount() {
        let self = this;
        let token = localStorage.getItem('token');
        
        this.setState({
            courseID: this.props.courseID,
            profName: ''
        });

        let apiPath = "/api/account/" + this.props.profID + "/details";
        console.log(apiPath);
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
                    profName: response.data.user.name.firstName + " " + response.data.user.name.lastName
                });
            })
            .catch(function(error) {
                console.log('Error2: ', error);
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
                                name: this.props.name
                            }
                        }}> View Course </Link>
                    </div>
                </div>
                <br />
            </div>
        );
        const studContent = (
            <div id="CourseCard">
                <div className="card bg-light mx-auto">
                    <div className="card-title text-center"><h3><strong><i>{this.props.code}</i>: {this.props.name}</strong></h3></div>
                    <div className="card-body text-left">
                        Instructor: {this.state.profName}<br />
                        Description: {this.props.description}<br />
                        Resource URL: <a href={'//' + this.props.resourceUrl}>{this.props.resourceUrl}</a>
                    </div>
                </div>
                <br />
            </div>
        );
        if (this.props.role == 'admin') {
            content = adminContent;
        } else if (this.props.role == 'prof') {
            content = adminContent;
        } else {
            content = studContent;
        }
        return (
            <div>{content}</div>
        );
    }
}

export default CourseCard;
