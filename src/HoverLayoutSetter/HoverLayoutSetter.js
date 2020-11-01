import React from 'react'
import { Rnd } from 'react-rnd'
import {Color2Str} from '../Utils/Color2Str'

//设置悬停出现组件的位置和宽高

class HoverLayoutSetter extends React.Component{
    render(){
        //setter的颜色：hoversetter静态样式的颜色
      const setterColor = Color2Str(this.props.color);
        //未被选中的样式：蓝色实线边框
      const layoutSetterStyle = {
        border: "solid 1px blue",
        background: setterColor,
        overflow : "hidden",
      }
      //被选中的样式：橘色虚线边框
      const activeLayoutSetterStyle = {
        border: "dashed 2px orange",
        background: setterColor,
        overflow : "hidden",
      }

      let inner = null;
      if(this.props.pic !== ''){
        //图片不为空：是图片组件
        inner = <img 
                  id={this.props.index} 
                  src={this.props.pic} 
                  width="100%" 
                  onDragStop={e => {e.preventDefault()}}
                  onResizeStop={e => {e.preventDefault()}}
                  onMouseDown={e => {e.preventDefault()}}/>
      }else{
        //是文字组件
        //{/* div的内容必须是this.props.data，不然单一内容时手动修改setter内容无效 */}
        inner = <div  
          dangerouslySetInnerHTML={{__html:this.props.text}}>          
          </div>
      }

        return (
            <Rnd 
        id={this.props.index}
        style={this.props.activeKey==this.props.index?activeLayoutSetterStyle:layoutSetterStyle}
        size={{ width: this.props.width,  height: this.props.height }}
        position={{ x: this.props.x, y: this.props.y }}
        onDragStop={this.props.handleDragStop}
        onResizeStop={this.props.handleResizeStop}>
          {inner}
        
      </Rnd>
        )
    }
}

export default HoverLayoutSetter;