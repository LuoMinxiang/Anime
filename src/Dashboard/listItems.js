import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';

import EventEmitter from '../Utils/EventEmitter'
import Tabbar from './Tabbar'
import ImageLoadDialog from '../ImageLoader/ImageLoadDialog'
import ImageLoadingBtn from '../ImageLoader/ImageLoadingBtn'
import VideoLoaderBtn from '../VideoLoader/VideoLoaderBtn'

//左侧设置面板

//Tabbar的context，用于共享当前选中布局组件
const ActiveKeyInfoContext = React.createContext(null);
class ListMenu extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      //显示还是隐藏setter的颜色/内容/动效设置面板（Tabbar）：false为隐藏，true为显示
      addBtnDrop : false,
      activeKeyInfo : null,
      //layoutSetter的内容类型：默认初值为“text”，即默认编辑文字
      contentType : "text",
      //上传图片对话框是否打开
      imgOpen : false,
    }
    this.picData = '';

    this.handleClick = this.handleClick.bind(this);
    this.handleContentTypeChange = this.handleContentTypeChange.bind(this);
    this.handleImageLoadDialogCancelClose = this.handleImageLoadDialogCancelClose.bind(this);
    this.handleImageLoadDialogLoadClose = this.handleImageLoadDialogLoadClose.bind(this);
    this.handleImageUploadBtnClick = this.handleImageUploadBtnClick.bind(this);
    this.handleImagePreview = this.handleImagePreview.bind(this);
  }

  componentDidMount(){
    this.emitter1 = EventEmitter.addListener("activeKeyInfo",(msg) => {
      if(msg !== null){
        //有选中的setter
      this.setState({activeKeyInfo : msg},()=>{
      });
    }else{
      //没有选中的setter，将选中setter信息设置为空
      this.setState({activeKeyInfo : null});
    }
    });
      
  }

  //添加setter按钮的回调函数：点击后通知WebCanvas，添加一个空白的setter
  handleClick(){
    if(!this.state.addBtnDrop){this.setState({addBtnDrop : true});}
    EventEmitter.emit("ClickedAddLayoutSetter","ClickedAddLayoutSetter");
  }

  handleContentTypeChange(event){
    this.setState({
      contentType : event.target.value,
    })
  }

  //上传图片对话框关闭并取消上传回调函数
  handleImageLoadDialogCancelClose(){
    this.setState({imgOpen : false});
  }

  //上传图片对话框关闭并上传回调函数
  handleImageLoadDialogLoadClose(){
    this.props.handleImageUploaded(this.picData);
    this.setState({imgOpen : false});
  }

  //打开上传图片对话框按钮点击回调函数
  handleImageUploadBtnClick(){
    this.setState({imgOpen : true});
  }

  //接到图片的预览但还没点击上传的回调函数
  handleImagePreview(img){
    this.picData = img;
  }

  //Tabbar的样式
  tabStyle = {
    margin : "0 10px"
  }

  render(){
    return (
      <div>
        <hr/>
        <div style={{
          width : "100%",
          padding : "5px",
          //background : "red"
        }}>
        <InputLabel>Content Type</InputLabel>
        <Select
          style={{width : "100%"}}
          value={this.state.contentType}
          onChange={this.handleContentTypeChange}
        >
          <MenuItem value={"text"}>Edit Text</MenuItem>
          <MenuItem value={"image"}>Upload Image</MenuItem>
          <MenuItem value={"video"}>Upload Video</MenuItem>
        </Select>
        </div>
        <hr/>

        <Button onClick={this.handleClick} style={{width: "80%", margin: "10%"}} variant="contained" color="primary">
            添加布局组件
        </Button>
    
    {this.state.addBtnDrop?
    <div style={this.tabStyle}>
      <ActiveKeyInfoContext.Provider value={this.state.activeKeyInfo}>
      {this.state.contentType === "image"? 
      <div 
        style={{
          //background : "red", 
          padding : 0,
          display : "flex",
          justifyContent : "center",
          textAlign : "center",
          margin : "10px 0"
        }}>
        <br/>
        {(this.state.activeKeyInfo && this.state.activeKeyInfo.pic !== '')? 
          <Button variant="contained"
                  onClick={this.props.handleImageClear} 
                  color="secondary">Clear</Button> : null}
      {/*<Button 
        style={{
         // margin : 20
        }}
        variant="contained" 
        color="primary"
        onClick={this.handleImageUploadBtnClick}>
        Upload
      </Button>*/}
      <ImageLoadingBtn
        handleImageUploaded={this.props.handleImageUploaded}
      ></ImageLoadingBtn>
      <br/>
      </div> : null}
      {this.state.contentType === "video"? 
      <div 
        style={{
          //background : "red", 
          padding : 0,
          display : "flex",
          justifyContent : "center",
          textAlign : "center",
          margin : "10px 0"
        }}>
        <br/>
        {(this.state.activeKeyInfo && this.state.activeKeyInfo.vid !== '')? 
          <Button variant="contained"
                  onClick={this.props.handleVideoClear} 
                  color="secondary">Clear</Button> : null}
      {/*<Button 
        style={{
         // margin : 20
        }}
        variant="contained" 
        color="primary"
        onClick={this.handleImageUploadBtnClick}>
        Upload
      </Button>*/}
      <VideoLoaderBtn
        handleVideoUploaded={this.props.handleVideoUploaded}
      ></VideoLoaderBtn>
      <br/>
      </div> : null}
        {this.state.contentType !== 'video'? <Tabbar 
        anime={true}
        contentType={this.state.contentType}/> : null}
      </ActiveKeyInfoContext.Provider>
    </div>
      :null}
    {/*<ActiveKeyInfoContext.Provider value={this.state.activeKeyInfo}>
 <ImageLoadDialog
      open={this.state.imgOpen}
      handleClose={this.handleImageLoadDialogCancelClose}
      handleDisagreeClose={this.handleImageLoadDialogCancelClose}
      handleAgreeClose={this.handleImageLoadDialogLoadClose}
      handleImageUploaded={this.handleImagePreview}>
    </ImageLoadDialog>
    </ActiveKeyInfoContext.Provider>*/}
    
  </div>
    );
  }
}
export { ListMenu, ActiveKeyInfoContext };