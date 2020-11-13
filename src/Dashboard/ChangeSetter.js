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
import ImageLoader from '../ImageLoader/ImageLoader'
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import InputSlider from './TimerSetter'
import Tabbar from './Tabbar'
import EventEmitter from '../Utils/EventEmitter'
import { ActiveKeyInfoContext } from './listItems'
import {Color2Str} from '../Utils/Color2Str'

//设置常变动效的设置面板

//设置窗口弹出的滑动效果
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
class ControlledAccordions extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //展示or隐藏设置面板内容
            expanded : false,
            //打开or关闭设置窗口
            open : false,
            //常变内容/颜色数组
            contentInfoArr : (this.props.activeKeyInfo === null || typeof(this.props.activeKeyInfo) === 'undefined')? [{
                name : '内容0',
                activeKeyColor : "transparent",
                activeKeyContent : "",
                activeKeyPic : "",
            }] : [{
                name : '内容0',
                activeKeyColor : this.props.activeKeyInfo.color,
                activeKeyContent : this.props.activeKeyInfo.content,
                activeKeyPic : this.props.activeKeyInfo.pic,
            },
            //改变第一个元素为当前颜色和内容，并加上剩下的所有元素
            ...this.props.activeKeyInfo.animeInfo.changingContentArr.slice(1)
        ],
            //常变定时器间隔
            interval : this.props.activeKeyInfo === null? null : this.props.activeKeyInfo.animeInfo.changingInterval, //有可能此时没有添加setter
            //记录前一个选中setter的索引，将更新的props中的index和当前index对比，不一样说明切换了setter，要更改contentInfoArr值
            curActiveKey : this.props.activeKeyInfo === null? null : this.props.activeKeyInfo.index,
            //是否启动走马灯效果
            setMarquee : false,

            //常变内容选择对话框的内容类型选择
            contentType : "text",
        }
        //当前被选中的setter的信息对象
        this.activeKeyInfo = this.props.activeKeyInfo;

        //对选中的一项内容设置的颜色：初始值为当前选中setter的颜色，如果当前没有选中setter，则初始值为透明
        this.selectedColor = this.props.activeKeyInfo === null? "transparent" : this.props.activeKeyInfo.color;
        //判断弹出设置窗口后是否修改了选中的内容项的颜色，只有修改了点击save才需要将设置的内容存入内容数组
        this.isColorChanged = false;
        //对选中的一项内容设置的文字：初始值为当前选中setter的文字，如果当前没有选中setter，则初始值为空字符串
        this.selectedText = this.props.activeKeyInfo === null? "" : this.activeKeyInfo.content;
        //判断弹出设置窗口后是否修改了选中的内容项的文字，只有修改了点击save才需要将设置的内容存入内容数组
        this.isTextChanged = false;
        //对选中的一项内容设置的图片：初始值为当前选中setter的图片，如果当前没有选中setter，则初始值为空字符串
        this.selectedPic = this.props.activeKeyInfo === null? "" : this.activeKeyInfo.pic;
        //判断弹出设置窗口后是否修改了选中的内容项的图片，只有修改了点击save才需要将设置的内容存入内容数组
        this.isPicChanged = false;
        //用于标志tabbar是否是设置窗口的tabbar（而不是主设置栏的tabbar）：只要resetTab的值改变就说明是设置窗口而不是主设置栏的tabbar
        this.resetTab = 0;
        //提示or设置窗口的文字内容
        this.dialogContent = "Set the color and content of this change.";
        //窗口类型：是否是警告窗口，如果是，就不显示用于设置的tabbar
        this.isWarningDialog = false;
        //警告窗口的文字内容
        this.warningContent = "Please select a setter before making any changes!"
        //设置窗口的文字内容
        this.settingContent = "Set the color and content of this change.";
        //函数绑定
        this.setDialogContent = this.setDialogContent.bind(this);
        this.handleIntervalChange = this.handleIntervalChange.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handlePicChange = this.handlePicChange.bind(this);
        this.handleSaveClose = this.handleSaveClose.bind(this);
        this.getChipStyleFromIndex = this.getChipStyleFromIndex.bind(this);
        this.handleSetMarqueeChange = this.handleSetMarqueeChange.bind(this);
        this.handleContentTypeChange = this.handleContentTypeChange.bind(this);

        //选中要修改的常变动效内容项索引
        this.selectedContentIndex = null;
    }

    //改变弹出对话框文字内容
    setDialogContent(dialogContent){
            this.dialogContent = dialogContent;
    }

    //监听props（选中setter）的改变，并在改变时更新对应的常变动效内容数组和常变定时
    componentDidUpdate (props, state) {
        if(this.props.activeKeyInfo === null){
            //传入参数为取消选中
            if(this.state.curActiveKey !== null){
                //当前有选中的setter：取消选中（当前本身就是没有选中的就不管）
                this.selectedContentIndex = null;
                this.setState({
                    contentInfoArr : [],
                    interval : null,
                    curActiveKey : null,
                    setMarquee : false,
                }) 
            }
        }
        else{
            //传入参数非取消选中：判断是否是切换setter
            if(this.props.activeKeyInfo.index !== this.state.curActiveKey){
                //切换选中setter：改变state的contentInfoArr,interval和curActiveKey值
                this.setState({
                    contentInfoArr : [{
                        name : '内容0',
                        activeKeyColor : this.props.activeKeyInfo.color,
                        activeKeyContent : this.props.activeKeyInfo.content,
                        activeKeyPic : this.props.activeKeyInfo.pic,
                    },
                    ...this.props.activeKeyInfo.animeInfo.changingContentArr.slice(1)
                ],
                    interval : this.props.activeKeyInfo.animeInfo.changingInterval,
                    curActiveKey : this.props.activeKeyInfo.index,
                    setMarquee : this.props.activeKeyInfo.animeInfo.setMarquee,
                }) 
            }
            //更新setter的图片
            if(typeof(this.state.contentInfoArr[0]) !== 'undefined' && this.props.activeKeyInfo.pic !== this.state.contentInfoArr[0].activeKeyPic){
              this.state.contentInfoArr[0].activeKeyPic = this.props.activeKeyInfo.pic;
            }
        }

    }

      handleClick = (index) => ()=>{
        if(this.props.activeKeyInfo === null){
            //未选择setter，不能进行设置，弹出警告对话框
            this.isWarningDialog = true;
            this.setDialogContent(this.warningContent);
            this.handleClickOpen();
        }else{
          //选择了setter
          if(index === 0){
            //点击第一项内容，即原本内容和样式：不能在常变动效设置面板设置，必须在主设置栏设置。弹出警告窗口
            this.isWarningDialog = true;
            this.setDialogContent("The first content is the original one and shouldn't be changed here! If you really want to change the original content, please close Changing setting and set content in color and content tab!");
            this.handleClickOpen();
          }else{
            //选中了setter，可以进行设置，弹出设置对话框
            this.isWarningDialog = false;
            this.setDialogContent(this.settingContent);
            //变换resetTab的值，告诉tabbar这是常变动效设置窗口的tabbar，不是主设置栏的
            this.resetTab = this.resetTab === 0? 1 : 0;
            this.handleClickOpen();
            //设置选中的常变内容项索引为被点击chip的索引值
            this.selectedContentIndex = index;
            //广播打开常变动效设置模式
            EventEmitter.emit("isChangingSettingOn", true);
          }
            
        }
    }
    handleAddChipClick = ()=>{
        if(this.props.activeKeyInfo === null){
            //未选择setter，不能进行设置，弹出警告对话框
            this.isWarningDialog = true;
            this.setDialogContent(this.warningContent);
            this.handleClickOpen();
        }else{
            //选中了setter，可以进行设置，弹出设置对话框
            this.isWarningDialog = false;
            //将对话框的文字内容改成设置文字内容
            this.setDialogContent(this.settingContent);
            //变换resetTab的值，告诉tabbar这是常变动效设置窗口的tabbar，不是主设置栏的
            this.resetTab = this.resetTab === 0? 1 : 0;
            this.handleClickOpen();
            
            //初始化新添加的内容项的文字和颜色：初始值都为静态设置的内容
            let arr = [...this.state.contentInfoArr];
            const contentInfo = {} //this.state.contentInfoArr[0];
            contentInfo.name = '内容' + this.state.contentInfoArr.length;
            contentInfo.activeKeyColor = this.state.contentInfoArr[0].activeKeyColor;
            contentInfo.activeKeyContent = this.state.contentInfoArr[0].activeKeyContent;
            contentInfo.activeKeyPic = this.state.contentInfoArr[0].activeKeyPic;
            //将新添加的内容项加入常变内容数组
            arr.push(contentInfo);
            this.setState({contentInfoArr : arr});
            //将选中内容项的索引切换为新建内容项的索引
            this.selectedContentIndex = this.state.contentInfoArr.length;
            //广播打开常变动效设置模式
            EventEmitter.emit("isChangingSettingOn", true);
        }
      
  }
  //chip的删除处理函数必须是一个函数，handleDelete(item)相当于调用handleDelete，如果不返回一个函数是不会出现可删除效果的
    handleDelete = (index) => () => {
      //从常变内容数组中删除指定下标的内容项
      const arr = [...this.state.contentInfoArr];
      //arr.splice(index, 1);
      delete arr[index];
      this.setState({contentInfoArr : arr});
      //将当前选中的内容项置为0
      this.selectedContentIndex = 0;
      //广播常变设置模式开启
      EventEmitter.emit("isChangingSettingOn", true);
  }
  
  //打开设置/警告对话框
  handleClickOpen = () => {
      this.setState({open : true});
    };
  
    //关闭设置/警告对话框
    handleClose = () => {
      //setOpen(false);
      this.setState({open : false});
      this.isColorChanged = false;
      this.isTextChanged = false;
    };

    //点击设置常变动效按钮打开或收起设置面板时调用
    handleChange = (panel) => (event, isExpanded) => {
        this.setState({expanded : isExpanded ? panel : false});
        //向LayoutSetter发送消息：进入常变动效设置模式，切换选中组件时提示保存修改否则丢失
        EventEmitter.emit("isChangingSettingOn", isExpanded);
      };

    //点击apply（应用）按钮，将设置好的常变动效应用在选中的setter上  
    handleApplyClick = () => {
      //调用TextAnimPanel传入的函数，设置TextAnimPanel的changingContentArr和changingInterval
        this.props.handleSettingFinished(this.state.contentInfoArr, this.state.interval);
        //广播常变动效设置模式关闭
        EventEmitter.emit("isChangingSettingOn", false);
    }

    //获取TimerSetter设置的interval值的方法
    handleIntervalChange(interval){
        this.setState({interval : interval});
    }

    //在colorPicker中设置指定序号内容的颜色
    handleColorChange(color){
      this.selectedColor = color;
      this.isColorChanged = true;
    }

    //在editor中设置指定序号内容的文字
    handleTextChange(text){
      //富文本编辑器中的text被修改了
      this.selectedText = text;
      this.isTextChanged = true;
    }

    //在image loader中设置指定序号内容的文字
    /*handlePicChange(img){
      //富文本编辑器中的text被修改了
      this.selectedPic = img;
      this.isPicChanged = true;
    }*/

    handlePicChange(event){
      //富文本编辑器中的text被修改了
      //获取图片在本机中的信息
      const backEndHost = "http://127.0.0.1:8081";
      const getImgUrlPre = "/public/image/"
      let picOM = event.target.files[0];
      if(!picOM) return;
      // 从获取的信息中的url中读取图片文件
      let fileReade = new FileReader();
      fileReade.readAsDataURL(picOM);
      fileReade.onload = ev =>{
          //图片读取完成：上传至后端
          //此处的url应该是服务端提供的上传文件api 
          // const url = 'http://localhost:3000/api/upload';
          const url = 'http://127.0.0.1:8081/public/image/';

          const form = new FormData();

          //此处的file字段由服务端的api决定，可以是其它值
          form.append('file', picOM);

          fetch(url, {
              method: 'POST',
              body: form
          })
          .then(res => res.json())
          .then(data => {
              //获取存到后端的文件名
              //console.log("data.fileName = " + data.fileName);
              const url = backEndHost + getImgUrlPre + data.fileName;
              //this.props.handleImgChange(url);
              this.selectedPic = url;
              this.isPicChanged = true;
          })
      }

      //this.selectedPic = img;
      //this.isPicChanged = true;
    }

    //点击保存设置好的颜色并关闭弹窗
    handleSaveClose(){
      //判断是否修改了颜色，如果没修改，则不保存
      if(this.isColorChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyColor = this.selectedColor;
        arr[this.selectedContentIndex] = contentInfo;
        this.setState({
          contentInfoArr : arr
        })
      }
      //判断是否修改了文字，如果没修改，则不保存
      if(this.isTextChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyContent = this.selectedText;
        arr[this.selectedContentIndex] = contentInfo;
        this.setState({
          contentInfoArr : arr
        })
      }
      //判断是否修改了图片，如果没修改，则不保存
      if(this.isPicChanged){
        let arr = [...this.state.contentInfoArr];
        let contentInfo = arr[this.selectedContentIndex];
        contentInfo.activeKeyPic = this.selectedPic;
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

    //设置走马灯
    handleSetMarqueeChange(){
      this.props.handleSetMarqueeFinished(!this.state.setMarquee);
      this.setState(state => ({
        setMarquee : !state.setMarquee
      }))

    }

    //内容设置对话框改变内容类型
    handleContentTypeChange(event){
      this.setState({
        contentType : event.target.value,
      })
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
    /*
    if(this.state.contentInfoArr){
      console.log("this.state.contentInfoArr.length = " + this.state.contentInfoArr.length);
    }else{
      console.log("this.state.contentInfoArr is false");
    }
    if(this.selectedContentIndex){
      console.log("this.selectedContentIndex = " + this.selectedContentIndex);
    }else{
      console.log("this.selectedContentIndex is false");
    }
    */
    const contentTypeSelector = 
      <div>
        <InputLabel>内容类型</InputLabel>
        <Select
          style={{width : "100%"}}
          value={this.state.contentType}
          onChange={this.handleContentTypeChange}
        >
          <MenuItem value={"text"}>文字</MenuItem>
          <MenuItem value={"image"}>图片</MenuItem>
        </Select>
      </div>
    const textEditor = 
      <Tabbar 
        style={this.tabStyle} 
        anime={false}
        color={this.state.contentInfoArr.length!==0?this.state.contentInfoArr[this.selectedContentIndex && this.selectedContentIndex<this.state.contentInfoArr.length? this.selectedContentIndex : 0].activeKeyColor:null}
        text={this.state.contentInfoArr.length!==0?this.state.contentInfoArr[this.selectedContentIndex && this.selectedContentIndex<this.state.contentInfoArr.length? this.selectedContentIndex : 0].activeKeyContent:null}
        onColorChanged={this.handleColorChange}
        onTextChanged={this.handleTextChange}
        tabIndex={this.resetTab}
        contentType="text">
      </Tabbar>
    const imgLoader = //null;
    /*<ImageAnimeLoadingBtn
        handleImgChange={this.handlePicChange}
      ></ImageAnimeLoadingBtn>*/
    <div>
    <input
        accept="image/*"
        style={{display: "none",}}
        id="imgbtn"
        multiple
        onChange={this.handlePicChange}
        type="file"
    />
    <label htmlFor="imgbtn">
        <Button variant="contained" color="primary" component="span">
        上传图片
        </Button>
    </label>
</div>
      /*<ImageLoader
        handleImageUploaded={this.handlePicChange}
        setterWidth={this.activeKeyInfo?this.activeKeyInfo.width:0}
        setterHeight={this.activeKeyInfo?this.activeKeyInfo.height:0}
        setterPic={this.state.contentInfoArr.length!==0?this.state.contentInfoArr[this.selectedContentIndex && this.selectedContentIndex<this.state.contentInfoArr.length? this.selectedContentIndex : 0].activeKeyPic:''}
        withClip={true}
      ></ImageLoader>*/
    const dialogContent = 
      <div>
        {contentTypeSelector}
        {this.state.contentType === "text"? textEditor : imgLoader}
      </div>;

    
      return (
        <div style={this.root}>
        <Accordion expanded={this.state.expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography style={this.heading}>常变</Typography>
            <Typography style={this.secondaryHeading}>设置常变动效</Typography>
          </AccordionSummary>
          <AccordionDetails style={this.detailStyle}>
              <div>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.setMarquee}
                    onChange={this.handleSetMarqueeChange}
                    name="setMarquee"
                    color="primary"
                  />
                }
                label="设置走马灯"
              />
              <br/>
              <Divider />
              <br/>
              {this.state.setMarquee? null : <div><InputSlider interval={this.state.interval} handleIntervalChange={this.handleIntervalChange}></InputSlider>
              <br/>
              <div style={this.gridContainer}>
          {this.state.contentInfoArr.map((item, index) =>  (typeof(item) === 'undefined' || item === null)?null:
          <Tooltip title={item.name}>
              <Chip
              label={item.name}
              onClick={this.handleClick(index)}
              onDelete={index === 0? null : this.handleDelete(index)}
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
          </Button></div>}
              
          
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
          <DialogTitle id="alert-dialog-slide-title">{"设置常变内容"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.dialogContent}
            </DialogContentText>
            {this.isWarningDialog? null :
                dialogContent}
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


export default ControlledAccordions;