import React from 'react'
import { SketchPicker } from 'react-color'
import EventEmitter from '../Utils/EventEmitter'

//颜色选择器

class ColorPicker extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            setterBgColor : props.color !== null? props.color : "transparent",
            //记录当前props值，在getDerivedStateFromProps调用时与新的props值对比，判断是props还是state引起的调用
            curPropsColor : props.color !== null? props.color : "transparent"
        }
        //this.colorString2Rgb = this.colorString2Rgb.bind(this);
        //alert("ColorPicker : props.color = " + props.color);
    }

    //监听props（选中setter/内容的颜色）的改变，并在改变时更新对应的颜色值
    //props的改变分为3种情况：
    //1. 传入的props为空或者undefined，但是当前props不为透明
    //2. 传入的props与当前props类型不同，且传入的props不为空或undefined（props为object，当前为transparent）
    //3. 传入的props和当前的props都是对象，但rgba中有值不相等
    static getDerivedStateFromProps (props, state) {
        //alert("colorPicker - getDerivedStateFromProps props.color = " + props.color);
        if((props.color === null || typeof(props.color) === 'undefined')){
            //alert("colorPicker - enter 1");
            if(state.curPropsColor !== "transparent"){
                return {
                setterBgColor : "transparent",
                curPropsColor : "transparent"
            }
            }
            
        }else if(typeof(props.color) !== typeof(state.curPropsColor)){
            return {
                setterBgColor : props.color,
                curPropsColor : props.color
            }
        }else if(props.color instanceof Object && (props.color.r !== state.curPropsColor.r || props.color.b !== state.curPropsColor.b || props.color.g !== state.curPropsColor.g || props.color.a !== state.curPropsColor.a)){
            return {
                setterBgColor : props.color,
                curPropsColor : props.color
            }
        }
    }
    
    //在color-picker设置完颜色后回调：获取设置的颜色
    handleChangeComplete(color) {
        //将颜色转换为rgba字符串的格式
        //注意！a控制透明度。没有a就无法返回透明态。
        let msg = "rgba(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + "," + color.rgb.a + ")";

        if (this.props.onColorChanged) {
          this.props.onColorChanged(color.rgb);
        }

        //将获取的颜色传给WebCanvas，从而设置被选中setter的颜色
        EventEmitter.emit("SelectedSetterColorChanged",color.rgb);
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