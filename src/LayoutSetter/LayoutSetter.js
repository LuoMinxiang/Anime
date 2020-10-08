import * as React from 'react';
import { Rnd } from 'react-rnd'
import EventEmitter from '../Utils/EventEmitter'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';

//布局组件

  const imgStyle = {
    width : "100%",
    height : "auto"
  }
  //setter总数的计数变量
  let totalSetter = 0;
  //所有setter的信息集合
  //let data = {};

  //用于json-server测试
  let data = [];

class LayoutSetter extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      width : 320,
      height : 200,
      x : 0,
      y : 0,
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
        content: (typeof(this.props.data)=='undefined')?'':this.props.data,
        animInfo: this.props.animeInfo
      };
      data[this.props.index] = setterInfo;
    }
     let body = JSON.stringify(data);

     //json-server测试版数据：因为json-server没有后端处理，要在preview中使用必须上传同时包含totalN和setters属性的对象
      let settersInfo = {
        totalN : totalSetter,
        setters : data
      }
      body = JSON.stringify(settersInfo);
      
     //fetch('http://127.0.0.1:8081/',{
     //json-server测试接口
     fetch('http://127.0.0.1:3000/setterInfo',{
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

    //不带任何出现动效的布局组件
    this.basicComponent = 
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
    
    //加上出现动效后的布局组件
    this.revealComponent = this.basicComponent;
    //根据传入的动效设置数组判断应该添加什么动效
    switch(this.props.animeInfo.reveal){
      case "Zoom":
        this.revealComponent = <Zoom>{this.basicComponent}</Zoom>;
        break;
      case "Fade":
        this.revealComponent = <Fade>{this.basicComponent}</Fade>
        break;
    }
        return (
          this.revealComponent
        );
    }
}
export default LayoutSetter;
