import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EventEmitter from '../Utils/EventEmitter'
import ControlledAccordions from './ChangeSetter'
import { ActiveKeyInfoContext } from './listItems'

//Tabbar中动效设置面板

class TextAnimPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            revealFade : false
        }
        this.animInfo = {
            reveal : "",
            changingContentArr : [],
            changingInterval : 0
        }

        //函数绑定
        this.handleChangingSettingFinished = this.handleChangingSettingFinished.bind(this);
    }
    
    //常变动效设置完成时调用，将设置好的常变动效数据放入常变动效数据结构中
    handleChangingSettingFinished(contentInfoArr, interval){
        this.animInfo.changingContentArr = [...contentInfoArr];
        this.animInfo.changingInterval = interval;
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
            <FormControl variant="outlined" style={formControl}>
                <InputLabel id="demo-simple-select-outlined-label">Reveal</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    //只有用defaultValue才能在选中的时候改变显示的值！
                    defaultValue={this.animInfo.reveal}
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
            <br/>
            <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
                return <ControlledAccordions handleSettingFinished={this.handleChangingSettingFinished} activeKeyInfo={activeKeyInfo}></ControlledAccordions>
            }}
            </ActiveKeyInfoContext.Consumer>
            
            </div>
        );
    }
}

export default TextAnimPanel;