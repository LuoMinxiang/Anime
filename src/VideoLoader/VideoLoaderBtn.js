//VideoLoaderBtn
import React from 'react';
import Button from '@material-ui/core/Button';
class VideoLoaderBtn extends React.Component{
    constructor(props){
        super(props);
        this.backEndHost = "http://127.0.0.1:8081";
        this.getvidUrlPre = "/public/video/"
    }
    fileChange = (event) => {
        //获取视频在本机中的信息
        let vidOM = event.target.files[0];
        if(!vidOM) return;
        // 从获取的信息中的url中读取图片文件
        let fileReade = new FileReader();
        fileReade.readAsDataURL(vidOM);
        fileReade.onload = ev =>{
            //图片读取完成：上传至后端
            //此处的url应该是服务端提供的上传文件api 
            // const url = 'http://localhost:3000/api/upload';
            const url = 'http://127.0.0.1:8081/public/video/';

            const form = new FormData();

            //此处的file字段由服务端的api决定，可以是其它值
            form.append('file', vidOM);

            fetch(url, {
                method: 'POST',
                body: form
            })
            .then(res => res.json())
            .then(data => {
                //获取存到后端的文件名
                //console.log("data.fileName = " + data);
                const url = this.backEndHost + this.getvidUrlPre + data.fileName;
                //console.log(url);
                this.props.handleVideoUploaded(url);
            })
        }
    }

    render(){

        const inputStyle = {
            display : 'none'
        }

        return (
            <div>
                <input
                    accept="video/*"
                    style={inputStyle}
                    id="contained-button-file"
                    multiple
                    onChange={this.fileChange}
                    type="file"
                />
                <label htmlFor="contained-button-file">
                    <Button variant="contained" color="primary" component="span">
                    Upload Video
                    </Button>
                </label>
            </div>
        );
    }
}
export default VideoLoaderBtn