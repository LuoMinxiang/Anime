import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

//警告对话框：传入打开or关闭标志，关闭回调函数，文字内容，同意关闭回调函数，不同意关闭回调函数

export default class WarningDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            open : this.props.open
        }
    }
    
    render(){
        return (
            <Dialog
          open={this.props.open}
          //TransitionComponent={this.props.Transition || null}
          keepMounted
          onClose={this.props.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{"Set Change Content"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.props.dialogContent || "Warning!"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.handleDisagreeClose} color="primary">
              {this.props.disagree || "Disagree"}
            </Button>
            <Button onClick={this.props.handleAgreeClose} color="primary">
              {this.props.agree || "Agree"}
            </Button>
          </DialogActions>
        </Dialog> 
        )
    }
}