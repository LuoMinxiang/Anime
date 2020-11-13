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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';

import TextField from '@material-ui/core/TextField';
import HoverSettingTabbar from './HoverSettingTabbar'
import EventEmitter from '../Utils/EventEmitter'
import {Color2Str} from '../Utils/Color2Str'
import {GetFirstNotNullKey} from '../Utils/GetFirstNotNullKey'

//设置常变动效的设置面板

//设置窗口弹出的滑动效果
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
class HoverSetter extends React.Component{
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
            selectPic : '',


            //悬停出现内容/颜色数组：初始值为空
            contentInfoArr : [],
            //悬停缩放比例：大于1是放大，小于1是缩小
            hoverScale : 1,

            //悬停缩放是否只缩放图片不缩放框
            picScaleOnly : this.props.hoverScalePicOnly,
        }

        //记录当前props传入的选中setter的索引值，默认为null（选中画布）：用于判断是否切换setter
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
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSaveClose = this.handleSaveClose.bind(this);
        this.getChipStyleFromIndex = this.getChipStyleFromIndex.bind(this);
        this.resetColorText = this.resetColorText.bind(this);
        this.handleScaleChange = this.handleScaleChange.bind(this);
        this.handleHoverSetterSizeChange = this.handleHoverSetterSizeChange.bind(this);
        this.handleHoverSetterPositionChange = this.handleHoverSetterPositionChange.bind(this);
        this.handleSetPicScaleOnly = this.handleSetPicScaleOnly.bind(this);
        this.handlePicChange = this.handlePicChange.bind(this);

        //选中要修改的常变动效内容项索引
        this.selectedContentIndex = null;
    }

    //改变弹出对话框文字内容
    setDialogContent(dialogContent){
            this.dialogContent = dialogContent;
    }

    //初始化文字和颜色：
    //点击chip时将设置窗口中的颜色和文字初始值设置为点击chip的对应颜色和内容；
    //添加chip时将设置窗口中的颜色和文字初始值设为透明和空字符串
    //删除chip时将设置窗口中的颜色和文字初始值设为透明和空字符串
    resetColorText(){
        //设置colorPicker和editor的初始值为选中内容的颜色和文字
        /*
        let color = "transparent";
        let text = "";
        if(this.state.contentInfoArr.length!==0 && this.selectedContentIndex){
          //内容数组中有内容（只是内容可能为空）
          //判断是否是点击chip：选中的chip下标是否小于内容数组长度且在内容数组中是否非空
          if(this.selectedContentIndex < this.state.contentInfoArr.length && this.state.contentInfoArr.length[this.selectedContentIndex] !== null){
            color = this.state.contentInfoArr.length[this.selectedContentIndex]
          }
        }
        */
        const contentInfo = this.state.contentInfoArr.length!==0?this.state.contentInfoArr[this.selectedContentIndex && this.selectedContentIndex<this.state.contentInfoArr.length? this.selectedContentIndex : 0]:null;
        this.setState({
            selectedColor : (contentInfo !== null && typeof(contentInfo) !== 'undefined')?contentInfo.activeKeyColor:"transparent",
            selectedText : (contentInfo !== null && typeof(contentInfo) !== 'undefined')?contentInfo.activeKeyContent:"",
            selectPic : (contentInfo !== null && typeof(contentInfo) !== 'undefined')?contentInfo.activeKeyPic:"",
        })
    }

    //监听props（选中setter）的改变，并在改变时更新对应的动效内容数组
    componentDidUpdate (props, state) {
      if(this.props.index !== this.curActiveIndex){
        //切换选中
        this.setState({
          contentInfoArr : this.props.hoverContentArr,
          hoverScale : this.props.hoverScale,
          picScaleOnly : this.props.hoverScalePicOnly,
        })
        this.curActiveIndex = this.props.index;
      }
    }

    //内容chip的点击回调函数：弹出设置窗口
      handleClick = (index) => ()=>{
            //this.isWarningDialog = false;
            this.setDialogContent(this.settingContent);
            this.handleClickOpen();
            //设置选中的跟随内容项索引为被点击chip的索引值
            this.selectedContentIndex = index;
            //初始化文字和颜色
            this.resetColorText();
            //广播打开常变动效设置模式
            EventEmitter.emit("isHoverSettingOn", true);
          }
            
          //点击添加chip按钮添加
    handleAddChipClick = ()=>{
            //将对话框的文字内容改成设置文字内容
            this.setDialogContent(this.settingContent);
            this.handleClickOpen();
            
            //初始化新添加的悬停出现内容项的文字和颜色：初始颜色是透明，初始文字是空字符串
            let arr = [...this.state.contentInfoArr];
            const contentInfo = {} //this.state.contentInfoArr[0];
            contentInfo.name = '内容' + this.state.contentInfoArr.length;
            contentInfo.activeKeyColor = "transparent";
            contentInfo.activeKeyContent = "";
            contentInfo.activeKeyPic = "";
            //将选中内容项的索引切换为新建内容项的索引
            this.selectedContentIndex = this.state.contentInfoArr.length;
            //将新添加的内容项加入悬停出现内容数组
            arr.push(contentInfo);
            this.setState({contentInfoArr : arr});

             //初始化文字和颜色
             this.resetColorText();
             //广播添加悬停出现组件
            EventEmitter.emit("addHoverSetter");
            //广播打开跟随动效设置模式
            EventEmitter.emit("isHoverSettingOn", true);
        }
      
  //chip的删除处理函数必须是一个函数，handleDelete(item)相当于调用handleDelete，如果不返回一个函数是不会出现可删除效果的
    handleDelete = (index) => () => {
      //从跟随内容数组中删除指定下标的内容项
      const arr = [...this.state.contentInfoArr];
      delete arr[index];
      this.setState({contentInfoArr : arr});
      //将当前选中的内容项置为0
      this.selectedContentIndex = 0;
      //重置文字和颜色
      this.resetColorText();
      //广播常变设置模式开启
      EventEmitter.emit("isHoverSettingOn", true);
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

    //点击设置悬停动效按钮打开或收起设置面板时调用
    handleChange = (panel) => (event, isExpanded) => {
        this.setState({expanded : isExpanded ? panel : false});
        //向LayoutSetter发送消息：进入悬停动效设置模式，切换选中组件时提示保存修改否则丢失
        EventEmitter.emit("isHoverSettingOn", isExpanded);
      };

    //点击apply（应用）按钮，将设置好的悬停动效应用在选中的setter上
    handleApplyClick = () => {
        if(this.props.handleSettingFinished){
            //调用TextAnimPanel传入的函数，设置TextAnimPanel的changingContentArr和changingInterval
            this.props.handleSettingFinished(this.state.contentInfoArr, this.state.hoverScale, this.state.picScaleOnly);
            //广播常变动效设置模式关闭
            EventEmitter.emit("isHoverSettingOn", false);
        }
      
    }

    //在colorPicker中设置指定序号内容的颜色
    handleColorChange(color){
        this.setState({
            selectedColor : color.rgb
        })
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
      //ImageLoader编辑器中的pic被修改了
      this.setState({
          selectPic : pic
      })
      this.isPicChanged = true;
    }
    handleScaleChange(event){
        //alert("handleScaleChange!!! scale = " + event.target.value);
        this.setState({hoverScale : event.target.value});
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
      //判断是否修改了图片，如果没修改，则不保存
      if(this.isPicChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyPic = this.state.selectPic;
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

    //设置hover出现组件宽高的组件设置完成的回调函数
    handleHoverSetterSizeChange(e, direction, ref, d){
         let arr = [...this.state.contentInfoArr];
         const contentInfo = arr[this.selectedContentIndex];
         contentInfo.width += d.width;
         contentInfo.height += d.height;
         this.setState({contentInfoArr : arr});
    }

    //设置hover出现组件位置的组件设置完成的回调函数
    handleHoverSetterPositionChange(e, d){
         let arr = [...this.state.contentInfoArr];
         const contentInfo = arr[this.selectedContentIndex];
         contentInfo.top = d.y;
         contentInfo.left += d.x;
         this.setState({contentInfoArr : arr});
    }

    //悬停缩放是否只缩放图片不缩放框开关
    handleSetPicScaleOnly(){
      this.setState(state => ({
        picScaleOnly : !state.picScaleOnly
      }))
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
            <Typography style={this.heading}>悬停</Typography>
            <Typography style={this.secondaryHeading}>设置悬停动效</Typography>
          </AccordionSummary>
          <AccordionDetails style={this.detailStyle}>
              <div>
                {this.props.contentType === 'image'? 
                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={this.state.picScaleOnly}
                          onChange={this.handleSetPicScaleOnly}
                          name="picScaleOnly"
                          color="primary"
                        />
                      }
                      label="仅缩放图片不缩放框"
                    />
                    <Divider />
                  </div>: null}
              
              <TextField
                id="standard-number"
                label="Number"
                type="number"
                onChange={this.handleScaleChange}
                value={this.state.hoverScale}
                inputProps={{
                    step: 0.1,
                    min: -10,
                    max: 10,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
              <br/>
              <br/>
              <div style={this.gridContainer}>
          {this.state.contentInfoArr.map((item, index) =>  typeof(item) === 'undefined' || item === null?null:
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
          <DialogTitle id="alert-dialog-slide-title">{"Set Change Content"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.dialogContent}
            </DialogContentText>
            {this.isWarningDialog? null :
                <HoverSettingTabbar 
                    style={this.tabStyle} 
                    color={this.state.selectedColor}
                    text={this.state.selectedText}
                    pic={this.state.selectedPic}
                    onColorChanged={this.handleColorChange}
                    onTextChanged={this.handleTextChange}
                    handleImageUploaded={this.handlePicChange}
                    >
                </HoverSettingTabbar>}
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


export default HoverSetter;