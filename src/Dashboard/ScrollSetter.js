import React from 'react'
import EventEmitter from '../Utils/EventEmitter'

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import WarningDialog from '../Utils/WarningDialog';
class ScrollSetter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //展示or隐藏设置面板内容
            expanded : false,
            //打开or关闭设置窗口
            open : false,
            //下滚动效：初始scrollTop、终止scrollTop、初始{x,y}，终止{x,y}、x方向单位增量、y方向单位增量
            startScrollTop : this.props.startScrollTop,
            endScrollTop : this.props.endScrollTop,
            startX : this.props.startXY.x,
            startY : this.props.startXY.y,
            endX : "drag to set",
            endY : "drag to set",
            //初始{width,height}，终止{width,height}，width单位增量，height单位增量
            startWidth : this.props.startSize.width,
            startHeight : this.props.startSize.height,
            endWidth : "resize to set",
            endHeight : "resize to set",
            //是否已经设置过下滚动效
            hasScrollEffect : this.props.hasScrollEffect,

            //当前画布组件的scrollTop
            curScrollTop : 0,
        }
        //画布的宽度
        this.webCanvasWidth = 1200;

        //是否设置了startScrollTop
        this.hasSetStartScrollTop = false;
        //是否设置了endScrollTop
        this.hasSetEndScrollTop = false;

        this.handleChange = this.handleChange.bind(this);
        this.handleApplyClick = this.handleApplyClick.bind(this);
        this.handleStartScrollTopChange = this.handleStartScrollTopChange.bind(this);
        this.handleEndScrollTopChange = this.handleEndScrollTopChange.bind(this);
        this.handleStartXChange = this.handleStartXChange.bind(this);
        this.handleStartYChange = this.handleStartYChange.bind(this);
        this.handleEndXChange = this.handleEndXChange.bind(this);
        this.handleEndYChange = this.handleEndYChange.bind(this);
        this.handleSetStartScrollTop = this.handleSetStartScrollTop.bind(this);
        this.handleSetEndScrollTop = this.handleSetEndScrollTop.bind(this);
        this.handleDialogOKClose = this.handleDialogOKClose.bind(this);
    }

    componentDidMount(){
        this.listener = EventEmitter.addListener("canvasScrolled", (scrollTop) => {
            this.setState({
                curScrollTop : scrollTop,
            });
            if(!this.hasSetStartScrollTop){
                this.setState({
                    startScrollTop : scrollTop,
                })
            }
            if(!this.hasSetEndScrollTop){
                this.setState({
                    endScrollTop : scrollTop,
                })
            }
        });
    }

    componentDidUpdate(preProps, preState){
        //更新初始位置startXY
        if(this.props.startXY.x !== this.state.startX || this.props.startXY.y !== this.state.startY){
            this.setState({
                startX : this.props.startXY.x,
                startY : this.props.startXY.y
            })
            
        }
        //更新终止位置endXY
        if(this.props.endXY.x !== this.state.endX || this.props.endXY.y !== this.state.endY){
                //之前没设置过下滚动效：将终止位置设置为起始位置加200
                this.setState({
                    endX : this.props.endXY.x,
                    endY : this.props.endXY.y
                })            
            }
        //更新是否设置过下滚动效
        if(this.props.hasScrollEffect !== this.state.hasScrollEffect){
            //传入的设置过下滚动效标志位为true，改变内部的设置过下滚动效标志位，并改变终止位置。
            this.setState({
                hasScrollEffect : this.props.hasScrollEffect,
                endX : this.props.endXY.x,
                endY : this.props.endXY.y,
            })
        }
        //更新初始大小startSize
        if(this.props.startSize.width !== this.state.startWidth || this.props.startSize.height !== this.state.startHeight){
            this.setState({
                startWidth : this.props.startSize.width,
                startHeight : this.props.startSize.height,
            })
        }
        //更新终止大小endSize
        if(this.props.endSize.width !== this.state.endWidth || this.props.endSize.height !== this.state.endHeight){
            this.setState({
                endWidth : this.props.endSize.width,
                endHeight : this.props.endSize.height,
            })
        }
    }

    //点击设置下滚动效按钮打开或收起设置面板时调用
    handleChange = (panel) => (event, isExpanded) => {
        this.setState({expanded : isExpanded ? panel : false});
        //向LayoutSetter发送消息：进入悬停动效设置模式，切换选中组件时提示保存修改否则丢失
        EventEmitter.emit("isScrollSettingOn", isExpanded);
    };

    //点击apply（应用）按钮，将设置好的跟随动效应用在选中的setter或者全局上  
    handleApplyClick = () => {
        if(this.state.endScrollTop <= this.state.startScrollTop){
            //设置的页面下滚终止位置与初始位置相同或小于初始位置：不行，弹出警告对话框且不予设置
            this.setState({open : true});
        }else{
        if(this.props.handleSettingFinished){
            //调用TextAnimPanel传入的函数，设置TextAnimPanel的changingContentArr和changingInterval
            this.props.handleSettingFinished(this.state.startScrollTop, this.state.endScrollTop, this.state.startX, this.state.startY, this.state.endX, this.state.endY);
        }
        
        //广播常变动效设置模式关闭
        EventEmitter.emit("isScrollSettingOn", false);
        //把面板关上
        this.setState({expanded : false});
    }
    }

    //下滚动效回调函数
    //手动改变startScrollTop回调函数
    handleStartScrollTopChange(event){
        this.setState({
            startScrollTop : event.target.value === ''? 0 : event.target.value
        })
    }
    //手动改变endScrollTop回调函数
    handleEndScrollTopChange(event){
        this.setState({
            endScrollTop : event.target.value === ''? 0 : event.target.value
        })
    }
    //手动改变startXY.x回调函数
    handleStartXChange(event){
        this.setState({
            startX : event.target.value === ''? 0 : event.target.value
        })
    }
    //手动改变startScrollTop回调函数
    handleStartYChange(event){
        this.setState({
            startY : event.target.value === ''? 0 : event.target.value
        })
    }
    //手动改变startScrollTop回调函数
    handleEndXChange(event){
        this.setState({
            endX : event.target.value === ''? 0 : event.target.value
        })
    }
    //手动改变startScrollTop回调函数
    handleEndYChange(event){
        this.setState({
            endY : event.target.value === ''? 0 : event.target.value
        })
    }

    //设置startScrollTop的回调函数
    handleSetStartScrollTop(){
        this.setState({
            startScrollTop : this.state.curScrollTop,
        })
        this.hasSetStartScrollTop = true;
        EventEmitter.emit("hasSetStartScrollTop", this.state.curScrollTop)
    }

    //设置endScrollTop的回调函数
    handleSetEndScrollTop(){
        if(this.state.curScrollTop <= this.state.startScrollTop){
            //设置的页面下滚终止位置与初始位置相同或小于初始位置：不行，弹出警告对话框且不予设置
            this.setState({open : true});
        }else{
            //设置的页面下滚终止位置与初始位置不同：可以设置
            this.setState({
                endScrollTop : this.state.curScrollTop,
            })
            this.hasSetEndScrollTop = true;
            EventEmitter.emit("hasSetEndScrollTop", this.state.curScrollTop);
        }
        
    }

    //关闭对话框并同意回调函数
    handleDialogOKClose(){
        this.setState({
            open : false,
        });
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
    //下拉面板样式
    detailStyle = {
        display: "flex",
        flexDirection: "column",
    }

    oneTextFieldStyle = {
        width : "60%"
    }

    twoTextFieldStyle = {
        width : "48%"
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
            <Typography style={this.heading}>下滚</Typography>
            <Typography style={this.secondaryHeading}>设置下滚动效</Typography>
          </AccordionSummary>
          <AccordionDetails style={this.detailStyle}>
              <div>
              <TextField
                label="当前下滚幅度"
                style={this.oneTextFieldStyle}
                value={this.state.curScrollTop}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <br/>
              <TextField
                id="standard-number"
                label="下滚动效开始线"
                type="number"
                style={this.oneTextFieldStyle}
                onChange={this.handleStartScrollTopChange}
                value={this.state.startScrollTop}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于可以垂直下滚，top值大于0，但是没有上限
                    //max: 10,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button variant="outlined" style={{borderColor: "orange", color: "orange"}} onClick={this.handleSetStartScrollTop}>
                确定
            </Button>
              <br/>
              <TextField
                id="standard-number"
                label="下滚动效结束线"
                type="number"
                onChange={this.handleEndScrollTopChange}
                value={this.state.endScrollTop}
                style={this.oneTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于不能水平滚动，left值大于0，小于画布的宽度
                    max: this.webCanvasWidth,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button variant="outlined" color="primary" onClick={this.handleSetEndScrollTop}>
                确定
            </Button>
              <br/>
              <TextField
                id="standard-number"
                label="起始x坐标"
                disabled
                value={this.state.startX}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于不能水平滚动，x值大于0，小于画布的宽度
                    max: this.webCanvasWidth,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;
            <TextField
                id="standard-number"
                label="起始y坐标"
                disabled
                value={this.state.startY}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于可以垂直下滚，y值大于0，但是没有上限
                    //max: 10,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
               }}
            />
              <br/>
              <TextField
                id="standard-number"
                label="终止x坐标"
                disabled
                value={this.state.endX}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于不能水平滚动，x值大于0，小于画布的宽度
                    max: this.webCanvasWidth,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;    
            <TextField
                id="standard-number"
                label="终止y坐标"
                disabled
                value={this.state.endY}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于可以垂直下滚，y值大于0，但是没有上限
                    //max: 10,
                    type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <br/>
              <TextField
                id="standard-number"
                label="起始宽度"
                disabled
                value={this.state.startWidth}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于不能水平滚动，x值大于0，小于画布的宽度
                    max: this.webCanvasWidth,
                    //type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;
            <TextField
                id="standard-number"
                label="起始高度"
                disabled
                value={this.state.startHeight}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于可以垂直下滚，y值大于0，但是没有上限
                    //max: 10,
                    //type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
               }}
            />
              <br/>
              <TextField
                id="standard-number"
                label="终止宽度"
                disabled
                value={this.state.endWidth}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于不能水平滚动，x值大于0，小于画布的宽度
                    max: this.webCanvasWidth,
                    //type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            &nbsp;&nbsp;    
            <TextField
                id="standard-number"
                label="终止高度"
                disabled
                value={this.state.endHeight}
                style={this.twoTextFieldStyle}
                inputProps={{
                    step: 1,
                    min: 0,
                    //由于可以垂直下滚，y值大于0，但是没有上限
                    //max: 10,
                    //type: 'number',
                  }}
                InputLabelProps={{
                    shrink: true,
                }}
            />
              <br/>
              <br/>
              
          <Button variant="contained" color="primary" onClick={this.handleApplyClick}>
                应用
          </Button>
          </div>
          </AccordionDetails>
        </Accordion>
        <WarningDialog
            open={this.state.open}
            handleClose={this.handleDialogOKClose}
            dialogContent="开始线不应该与终止线相同!!!"
            handleAgreeClose={this.handleDialogOKClose}
            agree="OK"
        ></WarningDialog>
      </div>
        );
    }
}
export default ScrollSetter;