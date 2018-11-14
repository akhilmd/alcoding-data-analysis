import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
// import viewSubmissions from './viewSubmissions';

class AssignmentCard extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            file: null,
            showUpload: true,
            edit: false,
            marks: -1
        });
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.editCallback = this.editCallback.bind(this);
        this.deleteCallback = this.deleteCallback.bind(this);
        this.fileInput = React.createRef();
    }

    componentDidMount() {
        let userID = localStorage.getItem('user_id');
        // let success=0;
        if (this.props.submissions.length) {
            for (let i=0; i<this.props.submissions.length; i++) {
                let submission = this.props.submissions[i];
                if (submission.user==userID) {
                    this.setState({
                        showUpload: false,
                        marks: submission.marksObtained
                    });
                }
            }
        } else {
            this.setState({
                showUpload: true
            });
        }
    }

    onChange(e) {
        this.setState({
            file: e.target.files[0]
        });
        console.log(e.target.files);
    }

    onSubmit(event) {
        event.preventDefault();
        let self = this;
        let userID = localStorage.getItem('user_id');
        let token = 'Bearer ' + localStorage.getItem('token');
        let assignmentID = this.props.assignmentID;
        let inputData = new FormData();
        inputData.append('inputFile', this.state.file);
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token
            }
        };

        let apiPath = '/api/assignments/' + userID + '/' + assignmentID + '/upload';
        axios.post(apiPath, inputData, config)
            .then((res) => {
                console.log(res.data);
                if (res.data.success) {
                    self.setState({
                        showUpload: false
                    });
                } else {
                    alert('Assignment failed to upload!');
                }
            });
    }

    editCallback() {
        this.props.editAssign(this.props.assignmentID);
    }
    deleteCallback() {
        this.props.deleteAssign(this.props.assignmentID);
    }

    render() {
        const toUpload = (
            <div className="row">
                <div className="custom-file col-sm">
                    <input type="file" className="custom-file-input" id="validatedCustomFile" onChange={this.onChange}/>
                    <label className="custom-file-label" htmlFor="validatedCustomFile">Choose file</label>
                </div>
                <div className="col-sm">
                    <button className="btn btn-dark" onClick={this.onSubmit}> Submit </button>
                </div>
            </div>
        );
        let content;
        const profContent = (
            <div id="AssignmentCard">
                <div className="card bg-light mx-auto">
                    <div className="card-title"><h3><i>{this.props.uniqueID}</i>: <strong>{this.props.name}</strong></h3></div>
                    <div className="card-body text-left">
            Description: {this.props.details}<br />
            Type: {this.props.type}<br />
            Due Date: {this.props.dueDate}<br />
            Maximum Marks: {this.props.maxMarks}<br />
            Resource URL: <a href={'//' + this.props.resourceUrl}>{this.props.resourceUrl}</a><br /><br />
                        <button type="button" className="btn btn-dark w-20 mx-3" onClick={this.editCallback}>Edit</button>
                        <button type="button" className="btn btn-dark w-20 mx-3" onClick={this.deleteCallback}>Delete</button>
                        <Link className='btn btn-dark w-20 mx-3' to={{
                            pathname: '/assignments/submissions/' + this.props.uniqueID,
                            state: {
                                assignmentID: this.props.assignmentID,
                                maxMarks: this.props.maxMarks
                            }
                        }}> Evaluate </Link>
                    </div>
                </div>
                <br />
            </div>
        );
        console.log(this.props);
        const studContent = (
            <div id="AssignmentCard">
                <div className="card bg-light mx-auto">
                    <div className="card-title"><h3><i>{this.props.uniqueID}</i>: <strong>{this.props.name}</strong></h3></div>
                    <div className="card-body text-left">
            Description: {this.props.details}<br />
            Type: {this.props.type}<br />
            Due Date: {this.props.dueDate}<br />
            Maximum Marks: {this.props.maxMarks}<br />
            Marks Obtained: {this.state.marks==-1?"Not Evaluated":this.state.marks}<br />
            Resource URL: <a href={'//' + this.props.resourceUrl}>{this.props.resourceUrl}</a><br /><br />
                        {this.state.showUpload ? toUpload : <h6 className="text-info">Assignment Submitted!</h6>}
                    </div>
                </div>
                <br />
            </div>
        );

        if (this.props.role == 'student') {
            content = studContent;
        } else {
            content = profContent;
        }

        return (
            <div>{content}</div>

        );
    }
}

export default AssignmentCard;
