import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EventEmitter from '../Utils/EventEmitter'
import ControlledAccordions from './ChangeSetter'
import TrailSetter from './TrailSetter'
import { ActiveKeyInfoContext } from './listItems'
import HoverSetter from './HoverSetter'

//Tabbar中动效设置面板

class TextAnimPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            revealFade : false
        }
        this.animInfo = {
            //出现动效类型
            reveal : "",
            //常变内容数组
            changingContentArr : [],
            //常变定时器时间间隔
            changingInterval : 0,
            //跟随内容数组
            trailingContentArr : [],
            //跟随定时器时间间隔
            trailingInterval : 0,
            //跟随组件宽高
            trailerWidth : 0,
            trailerHeight : 0,
            //悬停缩放比例：大于1是放大，小于1是缩小
            hoverScale : 1,
            //悬停出现内容数组
            hoverContentArr : []
        }
        //画布因为只有一个所以直接在动效设置面板中维护即可。TODO - 初始化的时候从数据库中读出画布动效，然后广播给画布
        this.canvasAnimInfo = {
            trailingContentArr : [],
            trailingInterval : 0,
            trailerWidth : 0,
            trailerHeight : 0,
        }

        //当前选中的setter索引：默认为选中画布
        this.activeKeyIndex = null;

        //函数绑定
        this.handleChangingSettingFinished = this.handleChangingSettingFinished.bind(this);
        this.handleTrailingSettingFinished = this.handleTrailingSettingFinished.bind(this);
        this.handleHoverSettingFinished = this.handleHoverSettingFinished.bind(this);
    }
    
    //常变动效设置完成时调用，将设置好的常变动效数据放入常变动效数据结构中
    handleChangingSettingFinished(contentInfoArr, interval){
        this.animInfo.changingContentArr = [...contentInfoArr];
        this.animInfo.changingInterval = interval;
        //广播动效信息对象
        EventEmitter.emit("getAnim", this.animInfo);
    }

    //跟随动效设置完成时调用，将设置好的常跟随效数据放入跟随动效数据结构中
    handleTrailingSettingFinished(contentInfoArr, interval, trailerWidth, trailerHeight){
        if(this.activeKeyIndex !== null){
            //局部跟随
            this.animInfo.trailingContentArr = [...contentInfoArr];
            this.animInfo.trailingInterval = interval;
            this.animInfo.trailerWidth = trailerWidth;
            this.animInfo.trailerHeight = trailerHeight;
            //广播动效信息对象：在webCanvas中如果有选中的setter就直接修改该setter的animInfo值；如果没有就什么都不干
            EventEmitter.emit("getAnim", this.animInfo);
        }else{
            //全局跟随
            this.canvasAnimInfo.trailingContentArr = [...contentInfoArr];
            this.canvasAnimInfo.trailingInterval = interval;
            this.canvasAnimInfo.trailerWidth = trailerWidth;
            this.canvasAnimInfo.trailerHeight = trailerHeight;
            //广播全局跟随信息对象：TODO - 在webCanvas中收到广播后自己设置
            EventEmitter.emit("getCanvasAnim", this.canvasAnimInfo);

            //将画布跟随动效信息上传至数据库
            const body = JSON.stringify(this.canvasAnimInfo);
            //json-server测试接口
            fetch('http://127.0.0.1:3000/canvasInfo',{
                method:'post',
                mode:'cors',
                headers:{
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept':'application/json, text/plain'
                },
                body: body
            })
            .then(res => res.json())
            .then(data => {
                //console.log(data);
            })
            .catch(e => console.log('错误:', e))
   }
        }

    //悬停动效设置完成时调用，将设置好的悬停动效数据放入悬停动效数据结构中
    handleHoverSettingFinished(contentInfoArr, scale){
        this.animInfo.hoverContentArr = [...contentInfoArr];
        this.animInfo.hoverScale = scale;
        //广播动效信息对象
        EventEmitter.emit("getAnim", this.animInfo);
    }
        
  
    //出现动效设置完成时调用
    handleChange = (event) => {
    this.animInfo.reveal = event.target.value;
    //广播动效信息对象
    EventEmitter.emit("getAnim", this.animInfo);
  };
    render(){
        const formControl = {
            minWidth: 120,
          }
        return(
            <div>
            <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
                this.animInfo.reveal = activeKeyInfo?activeKeyInfo.animeInfo.reveal:"";
            return <FormControl variant="outlined" style={formControl}>
                <InputLabel id="demo-simple-select-outlined-label">Reveal</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={this.animInfo.reveal}
                    onChange={this.handleChange}
                    label="Reveal"
                >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={"Fade"}>Fade</MenuItem>
                <MenuItem value={"Zoom"}>Zoom</MenuItem>
                </Select>
            </FormControl>
            }}
            </ActiveKeyInfoContext.Consumer>
            <br/>
            <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
                if(activeKeyInfo){
                    this.animInfo.changingContentArr = [...activeKeyInfo.animeInfo.changingContentArr];
                    this.animInfo.changingInterval = activeKeyInfo.animeInfo.changingInterval;
                }
                return <ControlledAccordions handleSettingFinished={this.handleChangingSettingFinished} activeKeyInfo={activeKeyInfo}></ControlledAccordions>
            }}
            </ActiveKeyInfoContext.Consumer>
            <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
                if(activeKeyInfo){
                    //选中setter
                    this.animInfo.trailingContentArr = [...activeKeyInfo.animeInfo.trailingContentArr];
                    this.animInfo.trailingInterval = activeKeyInfo.animeInfo.trailingInterval;
                    this.animInfo.trailerWidth = activeKeyInfo.animeInfo.trailerWidth;
                    this.animInfo.trailerHeight = activeKeyInfo.animeInfo.trailerHeight;

                    this.activeKeyIndex = activeKeyInfo.index;
                    return <TrailSetter 
                        handleSettingFinished={this.handleTrailingSettingFinished} 
                        index={activeKeyInfo.index}
                        trailerHeight={activeKeyInfo.animeInfo.trailerHeight?activeKeyInfo.animeInfo.trailerHeight:100}
                        trailerWidth={activeKeyInfo.animeInfo.trailerWidth?activeKeyInfo.animeInfo.trailerWidth:100} 
                        trailingContentArr={activeKeyInfo.animeInfo.trailingContentArr?activeKeyInfo.animeInfo.trailingContentArr:[]}     
                        trailingInterval={activeKeyInfo.animeInfo.trailingInterval?activeKeyInfo.animeInfo.trailingInterval:0}
                        ></TrailSetter>
                }else{
                    //选中画布
                    this.activeKeyIndex = null;
                    return <TrailSetter 
                        handleSettingFinished={this.handleTrailingSettingFinished} 
                        index={null}
                        trailerHeight={this.canvasAnimInfo.trailerHeight?this.canvasAnimInfo.trailerHeight:100}
                        trailerWidth={this.canvasAnimInfo.trailerWidth?this.canvasAnimInfo.trailerWidth:100}  
                        trailingContentArr={this.canvasAnimInfo.trailingContentArr?this.canvasAnimInfo.trailingContentArr:[]}     
                        trailingInterval={this.canvasAnimInfo.trailingInterval?this.canvasAnimInfo.trailingInterval:0}                  
                        ></TrailSetter>
                }
                
            }}
            </ActiveKeyInfoContext.Consumer>
            <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
                if(activeKeyInfo){
                    this.animInfo.hoverContentArr = [...activeKeyInfo.animeInfo.hoverContentArr];
                    this.animInfo.hoverScale = activeKeyInfo.animeInfo.hoverScale;
                    return <HoverSetter
                                handleSettingFinished={this.handleHoverSettingFinished}
                                index={activeKeyInfo.index}
                                hoverScale={this.animInfo.hoverScale}
                                hoverContentArr={this.animInfo.hoverContentArr}></HoverSetter>
                }else{
                    //没有选中的setter
                    return <HoverSetter
                            handleSettingFinished={null}
                            index={null}
                            hoverScale={1}
                            hoverContentArr={[]}></HoverSetter>
                }
                
            }}
            </ActiveKeyInfoContext.Consumer>
            </div>
        );
    }
}

export default TextAnimPanel;