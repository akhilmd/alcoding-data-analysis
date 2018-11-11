import React, {Component} from 'react';
import axios from 'axios';

class downloadFile extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        // api/assignments/:fileID/download
        const {match: {params}} = this.props;

        let token = localStorage.getItem('token');
        // /api/file/:fileID/details
        axios.get(`/api/file/${params.fileID}/details`, {
            headers: {
                'x-access-token': token
            }
        })
            .then((res) => {
                axios.get(`/api/assignments/${params.fileID}/download`, {
                    responseType: "blob",
                    headers: {
                        'x-access-token': token
                    }
                })
                    .then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', res.data.data.file.filename);
                        document.body.appendChild(link);
                        link.click();
                        // window.close();
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));

        // console.log(params.fileID)
    }
    render() {
        return (
            <div>
                <h1>Refresh page to try again.</h1>
            </div>
        );
    }
}

export default downloadFile;
