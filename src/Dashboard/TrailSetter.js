import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import InputSlider from './TimerSetter'
import TrailingSettingTabbar from './TrailingSettingTabbar'
import EventEmitter from '../Utils/EventEmitter'
import { ActiveKeyInfoContext } from './listItems'
import {Color2Str} from '../Utils/Color2Str'
import TrailerSizeSetter from '../Trailer/TrailerSizeSetter'

//设置常变动效的设置面板

//设置窗口弹出的滑动效果
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
class TrailSetter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //展示or隐藏设置面板内容
            expanded : false,
            //打开or关闭设置窗口
            open : false,
            //对选中的一项内容设置的颜色：初始值为透明 - 必须设置为state不然修改后不会引起render，colorPicker的值不会改变
            selectedColor : "transparent",
            //对选中的一项内容设置的文字：初始值为空字符串 - 必须设置为state不然修改后不会引起render，colorPicker的值不会改变
            selectedText : "",
            //对选中的一项内容设置的图片：初始值为空字符串
            selectedPic : '',
            //跟随组件的宽高
            trailerWidth : this.props.trailerWidth,
            trailerHeight : this.props.trailerHeight,

            //跟随内容/颜色/图片数组：跟随组件内容初始值为空。如果isPic为true，该内容为图片
            contentInfoArr : [],
            //跟随定时器时间间隔：0表示不定时
            interval : 0,
        }

        //记录当前props传入的选中setter的索引值，默认为null（选中画布）
        this.curActiveIndex = null;

        //判断弹出设置窗口后是否修改了选中的内容项的颜色，只有修改了点击save才需要将设置的内容存入内容数组
        this.isColorChanged = false;

        //判断弹出设置窗口后是否修改了选中的内容项的文字，只有修改了点击save才需要将设置的内容存入内容数组
        this.isTextChanged = false;
        //判断弹出设置窗口后是否修改了选中内容项的图片，只有修改了点击save才需要将设置的内容存入内容数组
        this.isPicChanged = false;
        //提示or设置窗口的文字内容
        this.dialogContent = "Set the color and content of this trail content.";
        //设置窗口的文字内容
        this.settingContent = "Set the color and content of this trail content.";
        //函数绑定
        this.setDialogContent = this.setDialogContent.bind(this);
        this.handleIntervalChange = this.handleIntervalChange.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSaveClose = this.handleSaveClose.bind(this);
        this.getChipStyleFromIndex = this.getChipStyleFromIndex.bind(this);
        this.resetColorText = this.resetColorText.bind(this);
        this.handleTrailerSizeChange = this.handleTrailerSizeChange.bind(this);
        this.handlePicChange = this.handlePicChange.bind(this);

        //选中要修改的常变动效内容项索引
        this.selectedContentIndex = null;
    }

    //改变弹出对话框文字内容
    setDialogContent(dialogContent){
            this.dialogContent = dialogContent;
    }

    //初始化文字和颜色
    resetColorText(){
        //设置colorPicker和editor的初始值为选中内容的颜色和文字。如果是刚刚添加的chip就设置为透明和空字符串
        let initialColor = "transparent";
        let initialText = "";
        let initialPic = '';
        if(this.state.contentInfoArr.length!==0){
          //有跟随内容数组
          //判断跟随内容项是否为空(删除后选中内容项下标置为0，但是0也删除了)，或跟随内容项下标是否为内容数组长度（刚刚添加还没来得及异步修改）
          if(this.selectedContentIndex < this.state.contentInfoArr.length && this.state.contentInfoArr[this.selectedContentIndex] !== null && typeof(this.state.contentInfoArr[this.selectedContentIndex]) !== 'undefined'){
            //但是有可能添加chip刚刚将初始值放进state的内容数组中还没来得及异步修改，此时也保持透明和空字符串
            initialColor = this.state.contentInfoArr[this.selectedContentIndex].activeKeyColor;
            initialText = this.state.contentInfoArr[this.selectedContentIndex].activeKeyContent;
            initialPic = this.state.contentInfoArr[this.selectedContentIndex].activeKeyPic;
          }
        }
        this.setState({
            selectedColor : initialColor,
            selectedText : initialText,
            selectedPic : initialPic,
        })
    }
    //设置颜色和文字
    /*
    setColorText(color, text){
        this.setState({
            selectedColor : color,
            selectedText : text
        })
    }
    */

    
    //监听props（选中setter）的改变，并在改变时更新对应的动效内容数组和常变定时
    componentDidUpdate (props, state) {
      if(this.props.index !== this.curActiveIndex){
        //切换选中
        this.setState({
          contentInfoArr : this.props.trailingContentArr,
          interval : this.props.trailingInterval,
          trailerWidth : this.props.trailerWidth,
          trailerHeight : this.props.trailerHeight,
        })
        this.curActiveIndex = this.props.index;
      }
    }

    //内容chip的点击回调函数：弹出设置窗口
      handleClick = (index) => ()=>{
            //this.isWarningDialog = false;
            this.setDialogContent(this.settingContent);
            this.handleClickOpen();
            //设置选中的常变内容项索引为被点击chip的索引值
            this.selectedContentIndex = index;
            //初始化文字和颜色
            this.resetColorText();
            //广播打开常变动效设置模式
            EventEmitter.emit("isTrailingSettingOn", true);
          }
            
          //点击添加chip按钮添加
    handleAddChipClick = ()=>{
            //将对话框的文字内容改成设置文字内容
            this.setDialogContent(this.settingContent);
            this.handleClickOpen();
            
            //初始化新添加的内容项的文字和颜色：初始颜色是透明，初始文字是空字符串
            let arr = [...this.state.contentInfoArr];
            const contentInfo = {} //this.state.contentInfoArr[0];
            contentInfo.name = '内容' + this.state.contentInfoArr.length;
            contentInfo.activeKeyColor = "transparent";
            contentInfo.activeKeyContent = "";
            contentInfo.activeKeyPic = '';
            //将新添加的内容项加入跟随内容数组
            arr.push(contentInfo);
            this.setState({contentInfoArr : arr});
            //将选中内容项的索引切换为新建内容项的索引
            this.selectedContentIndex = this.state.contentInfoArr.length;
             //初始化文字和颜色
             this.resetColorText();
            //广播打开跟随动效设置模式
            EventEmitter.emit("isTrailingSettingOn", true);
        }
      
  //chip的删除处理函数必须是一个函数，handleDelete(item)相当于调用handleDelete，如果不返回一个函数是不会出现可删除效果的
    handleDelete = (index) => () => {
      //从跟随内容数组中删除指定下标的内容项
      const arr = [...this.state.contentInfoArr];
      //arr.splice(index, 1);
      delete arr[index];
      this.setState({contentInfoArr : arr});
      //将当前选中的内容项置为0
      this.selectedContentIndex = 0;
      //重置文字和颜色
      this.resetColorText();
      //广播常变设置模式开启
      EventEmitter.emit("isTrailingSettingOn", true);
  }
  
  //打开设置对话框
  handleClickOpen = () => {
      this.setState({open : true});
    };
  
    //关闭设置对话框
    handleClose = () => {
      //setOpen(false);
      this.setState({open : false});
      this.isColorChanged = false;
      this.isTextChanged = false;
      this.isPicChanged = false;
    };

    //点击设置跟随动效按钮打开或收起设置面板时调用
    handleChange = (panel) => (event, isExpanded) => {
        this.setState({expanded : isExpanded ? panel : false});
        //向LayoutSetter发送消息：进入常变动效设置模式，切换选中组件时提示保存修改否则丢失
        EventEmitter.emit("isTrailingSettingOn", isExpanded);
      };

    //点击apply（应用）按钮，将设置好的跟随动效应用在选中的setter或者全局上  
    handleApplyClick = () => {
      if(this.props.handleSettingFinished){
        //调用TextAnimPanel传入的函数，设置TextAnimPanel的changingContentArr和changingInterval
        this.props.handleSettingFinished(this.state.contentInfoArr, this.state.interval, this.state.trailerWidth, this.state.trailerHeight, this.state.picArr);
      }
      
        //广播常变动效设置模式关闭
        EventEmitter.emit("isTrailingSettingOn", false);
    }

    //获取TimerSetter设置的interval值的方法
    handleIntervalChange(interval){
        this.setState({interval : interval});
    }

    //在colorPicker中设置指定序号内容的颜色
    handleColorChange(color){
        this.setState({
            selectedColor : color.rgb
        })
      //this.selectedColor = color;
      this.isColorChanged = true;

    }

    //在editor中设置指定序号内容的文字
    handleTextChange(text){
      //富文本编辑器中的text被修改了
      this.setState({
          selectedText : text
      })
      this.isTextChanged = true;
    }

    //在imageLoader中设置指定序号内容的图片
    handlePicChange(pic){
      //在ImageLoader中的图片被修改了
      this.setState({
        selectedPic : pic,
      })
      this.isPicChanged = true;
    }
    handleTrailerSizeChange(e, direction, ref, d){
        this.setState(state =>({
            trailerWidth : state.trailerWidth + d.width,
            trailerHeight : state.trailerHeight + d.height,
        }))
    }

    //点击保存设置好的颜色并关闭弹窗
    handleSaveClose(){
      //判断是否修改了颜色，如果没修改，则不保存
      if(this.isColorChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyColor = this.state.selectedColor;
        arr[this.selectedContentIndex] = contentInfo;
        this.setState({
          contentInfoArr : arr
        })
      }
      //判断是否修改了文字，如果没修改，则不保存
      if(this.isTextChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyContent = this.state.selectedText;
        arr[this.selectedContentIndex] = contentInfo;
        this.setState({
          contentInfoArr : arr
        })
      }
      if(this.isPicChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyPic = this.state.selectedPic;
        arr[this.selectedContentIndex] = contentInfo;
        this.setState({
          contentInfoArr : arr
        })
      }
      this.setState({open : false});
      this.isColorChanged = false;
      this.isTextChanged = false;
      this.isPicChanged = false;
    }
  
    //将每个chip设置为对应的颜色，以提示用户设置好的内容顺序
    getChipStyleFromIndex(index){
      return {
        background : Color2Str(this.state.contentInfoArr[index].activeKeyColor),
        width: "100%"
      }
    }

  //下拉面板样式
  detailStyle = {
      display: "flex",
      flexDirection: "column",
  }
  //添加内容项按钮样式
  chipStyle = {
      //background: "red",
      width: "100%"
  }
  
  //Tabbar的样式
  tabStyle = {
    margin : "0 10px"
  }

  root = {
    width: '100%',
  }

  //下拉栏标题样式
  heading = {
    fontSize: 15,
    flexBasis: '33.33%',
    flexShrink: 0,
  }
  //下拉栏副标题样式
  secondaryHeading = {
    fontSize: 15,
    color: "grey",
  }
  //常变内容项的网格布局样式
  gridContainer = {
    //网格布局
    display: 'grid',
    marginRight : '5px',
    //每列的宽度
    gridTemplateColumns: '90px 90px',
    //整体宽度（没用）
    width: '100px',
    //列于列间距
    gridColumnGap : '5px',
    //行与行间距
    gridRowGap : '5px',
    //自动填充
    gridAutoFlow: 'row'
  }
  render(){    
      return (
        <div style={this.root}>
        <Accordion expanded={this.state.expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography style={this.heading}>跟随</Typography>
            <Typography style={this.secondaryHeading}>设置跟随动效</Typography>
          </AccordionSummary>
          <AccordionDetails style={this.detailStyle}>
              <TrailerSizeSetter 
                onResizeStop={this.handleTrailerSizeChange} 
                width={this.state.trailerWidth} 
                height={this.state.trailerHeight}>
              </TrailerSizeSetter>
              <br/>
              <div>
              <InputSlider interval={this.state.interval} handleIntervalChange={this.handleIntervalChange}></InputSlider>
              <br/>
              <div style={this.gridContainer}>
          {this.state.contentInfoArr.map((item, index) =>  (typeof(item) === 'undefined' || item === null)?null:
          <Tooltip title={item.name}>
              <Chip
              label={item.name}
              onClick={this.handleClick(index)}
              onDelete={this.handleDelete(index)}
              variant="outlined"
              style={this.getChipStyleFromIndex(index)}
          />
          </Tooltip>
          )}
          <Chip
              label="添加内容"
              onClick={this.handleAddChipClick}
              variant="outlined"
              style={this.chipStyle}
          />
          </div>
          <br/>
          <br/>
          <Button variant="contained" color="primary" onClick={this.handleApplyClick}>
                应用
          </Button>
          </div>
          </AccordionDetails>
        </Accordion>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{"设置跟随内容"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.dialogContent}
            </DialogContentText>
            {this.isWarningDialog? null :
                <TrailingSettingTabbar 
                    style={this.tabStyle} 
                    color={this.state.selectedColor}
                    text={this.state.selectedText}
                    pic={this.state.selectedPic}
                    width={this.state.trailerWidth}
                    height={this.state.trailerHeight}
                    onPicChanged={this.handlePicChange}
                    onColorChanged={this.handleColorChange}
                    onTextChanged={this.handleTextChange}
                    handleImageUploaded={this.handlePicChange}
                    >
                </TrailingSettingTabbar>}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              取消
            </Button>
            <Button onClick={this.handleSaveClose} color="primary">
              保存
            </Button>
          </DialogActions>
        </Dialog> 
      </div>
      );
  }
  
    
}


export default TrailSetter;