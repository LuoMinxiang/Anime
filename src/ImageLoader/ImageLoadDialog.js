import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { ActiveKeyInfoContext } from '../Dashboard/listItems'

import ImageLoader from './ImageLoader'

//上传图片对话框组件：传入参数 - 
//对话框是否打开的标志open，关闭函数handleClose，对话框文字内容dialogContent，
//取消关闭函数handleDisagreeClose，取消文字disagree，
//上传关闭函数handleAgreeClose，上传文字agree

class ImageLoadDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            open : this.props.open,
            picData : '',
        }
    }

    render(){
        return (
            <Dialog
          open={this.props.open}
          keepMounted
          onClose={this.props.handleClose}
        >
          <DialogTitle>{"Upload Image"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.props.dialogContent || "Click to choose an image from your files :) Click to choose an image from your files :) Click to choose an image from your files :) "}
            </DialogContentText>
            <ActiveKeyInfoContext.Consumer>
              {(activeKeyInfo) => {
                return activeKeyInfo !== null ? 
            <ImageLoader
              handleImageUploaded={this.props.handleImageUploaded}
              setterWidth={activeKeyInfo.width}
              setterHeight={activeKeyInfo.height}
              setterPic={activeKeyInfo.pic}
              withClip={true}
            ></ImageLoader>:
            <ImageLoader
              handleImageUploaded={this.props.handleImageUploaded}
              setterWidth={0}
              setterHeight={0}
              setterPic={''}
            ></ImageLoader>
            }}
          
            </ActiveKeyInfoContext.Consumer>
          </DialogContent>
          <DialogActions>
            {this.props.handleDisagreeClose? <Button onClick={this.props.handleDisagreeClose} color="primary">
              {this.props.disagree || "Cancel"}
            </Button> : null}
            {this.props.handleAgreeClose? <Button onClick={this.props.handleAgreeClose} color="primary">
              {this.props.agree || "Upload"}
            </Button> : null}            
          </DialogActions>
        </Dialog> 
        )
    }
}

export default ImageLoadDialog;