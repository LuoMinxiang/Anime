import * as React from 'react';
import { Rnd } from 'react-rnd'
import EventEmitter from '../Utils/EventEmitter'
import Zoom from 'react-reveal/Zoom';

//布局组件

  const imgStyle = {
    width : "100%",
    height : "auto"
  }
  //setter总数的计数变量
  let totalSetter = 0;
  //所有setter的信息集合
  let data = {};
class LayoutSetter extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      width : 320,
      height : 200,
      x : 0,
      y : 0,
      reveal : ""
    }
  }

  componentDidMount(){
    //当setter渲染出来之后总数加1
    totalSetter++;
    //点击preview后将所有setter的信息传给后端
    this.emitter1 = EventEmitter.addListener("getSettersInfo",(msg) => {
    for(let i = 0;i < totalSetter;i++){
      let setterInfo = {
        //静态效果
        totalN : totalSetter,
        index: this.props.index,
        width: this.state.width,
        height: this.state.height,
        x: this.state.x,
        y: this.state.y,
        color: this.props.selectedSetterColor,
        content: (typeof(this.props.data)=='undefined')?'':this.props.data
      };
      data[this.props.index] = setterInfo;
    }
     let body = JSON.stringify(data);
     fetch('http://127.0.0.1:8081/',{
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
       console.log(data);
     })
     .catch(e => console.log('错误:', e))
  })
  //设置动效
    this.emitter2 = EventEmitter.addListener("getAnim", (animInfo) => {
        this.setState({reveal : animInfo["reveal"]},()=>{alert("reveal : " + this.state.reveal);});
        
    })
}
    render(){
      //未被选中的样式：灰色实线边框
      const layoutSetterStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "solid 1px #ddd",
        background: this.props.selectedSetterColor
      }
      //被选中的样式：红色虚线边框
      const activeLayoutSetterStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "dashed 2px red",
        background: this.props.selectedSetterColor
      }

        return (
            <Rnd 
            style={this.props.activeKey==this.props.index?activeLayoutSetterStyle:layoutSetterStyle}
            size={{ width: this.state.width,  height: this.state.height }}
            position={{ x: this.state.x, y: this.state.y }}
            onDragStop={(e, d) => { this.setState({ x: d.x, y: d.y }) }}
            onResizeStop={(e, direction, ref, delta, position) => {
              this.setState({
                width: ref.style.width,
                height: ref.style.height,
                ...position,
              });
            }}>
              <div  dangerouslySetInnerHTML={{__html:this.props.data}}></div>
          </Rnd>
          );
    }
}
export default LayoutSetter;

