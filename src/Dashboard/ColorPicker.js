import React from 'react'
import { SketchPicker } from 'react-color'
import EventEmitter from '../Utils/EventEmitter'

//颜色选择器

class ColorPicker extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            setterBgColor : props.color || "transparent"
        }
    }
    handleChangeComplete(color) {
        //在color-picker设置完颜色后回调：获取设置的颜色
        if (this.props.onColorChangeda) {
          this.props.onColorChanged(color.rgb);
        }
        //将颜色转换为rgba字符串的格式
        //注意！a控制透明度。没有a就无法返回透明态。
        let msg = "rgba(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + "," + color.rgb.a + ")";
        //将获取的颜色传给WebCanvas，从而设置被选中setter的颜色
        EventEmitter.emit("SelectedSetterColorChanged",msg);
    }
    handleChange(color, event) {
        //获取设置的颜色
        this.setState({ setterBgColor: color.rgb });
    }
    render(){
        return (<SketchPicker
            className="color-pick"
            color={this.state.setterBgColor}
            onChangeComplete={this.handleChangeComplete.bind(this)}
            onChange={this.handleChange.bind(this)}
     />);
    }
}
export default ColorPicker;