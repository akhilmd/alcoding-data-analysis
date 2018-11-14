import React, {Component} from 'react';
import axios from 'axios';
// import {Link} from 'react-router-dom';

class SubmissionsCard extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            name: "",
            usn: "",
            fileName: "",
            marks: -1
        });
        this.handleMarksChange = this.handleMarksChange.bind(this);
        this.onSubmitMarks = this.onSubmitMarks.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        let self = this;

        this.setState({
            marks: self.props.marks
        });

        // /api/account/:userID/details
        axios.get(`/api/account/${this.props.user}/details`, {
            headers: {
                'x-access-token': token
            }
        })
            .then((res) => {
                // console.log(self.props.user, res);
                this.setState({
                    name: res.data.user.name.firstName,
                    usn: res.data.user.usn
                });
            })
            .catch((err) => console.log(err));

        // /api/file/:fileID/details
        axios.get(`/api/file/${this.props.fileID}/details`, {
            headers: {
                'x-access-token': token
            }
        })
            .then((res) => {
                console.log(self.props.fileID, res);
                this.setState({
                    fileName: res.data.data.file.filename
                });
            })
            .catch((err) => console.log(err));
    }

    handleMarksChange(e) {
        this.setState({
            marks: e.target.value
        });
    }

    onSubmitMarks() {
        let self = this;
        let token = localStorage.getItem('token');

        let config = {
            headers: {
                'x-access-token': token,
                'Content-Type': 'application/json'
            }
        };
        if (this.state.marks > this.props.maxMarks) {
            alert("marks > maxMarks");
            return;
        }
        let data = Object.assign({}, self.state.assignment);
        data.marks = this.state.marks;
        data = JSON.stringify(data);

        // /api/assignments/:assignmentID/:userID/setMarks
        axios.post(`/api/assignments/${this.props.assignmentID}/${this.props.user}/setMarks`, data, config)
            .then((res) => {
                console.log(res.data);
                window.location.reload();
            })
            .catch((err) => {
                console.log(err);
                alert('Marks allotment failed!');
            });
    }

    render() {
        let content;
        const Content = (
            <div id="SubmissionsCard">
                <div className="card bg-light mx-auto">

                    <div className="card-body text-left">
                        Name : {this.state.name}<br />
                        USN : {this.state.usn}<br />
                        File Name : {this.state.fileName} <br /><br />
                        
                        <button className="btn btn-dark" onClick={()=>window.open('/download/'+this.props.fileID)}> Download Submission </button>

                        <br/>
                        <br/>
                        <h5>Enter marks:</h5>
                        <div className="input-group">
                            <input type="number" className="form-control" placeholder="Marks" value={this.state.marks} onChange={this.handleMarksChange}></input>
                            <div className="input-group-append">
                                <button className="btn btn-dark" type="button" onClick={this.onSubmitMarks}>Submit</button>
                            </div>
                        </div>
                    </div>

                </div>
                <br />
            </div>
        );
        content = Content;
        return (
            <div>{content}</div>

        );
    }
}
export default SubmissionsCard;
