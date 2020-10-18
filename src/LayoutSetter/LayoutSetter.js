import * as React from 'react';
import { Rnd } from 'react-rnd'
import EventEmitter from '../Utils/EventEmitter'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import {Color2Str} from '../Utils/Color2Str'
import Trailer from '../Trailer/Trailer'
import ReactDOM from 'react-dom'

//布局组件

  const imgStyle = {
    width : "100%",
    height : "auto"
  }
  //setter总数的计数变量
  let totalSetter = 0;

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
      //当前参数的计时器时间间隔值（用于判断传入参数是否发生改变）
      curPropsInterval : 0,
      //修改当前内容，用来调用render：）
      curContent : this.props.data,

      //跟随动效
      //是否显示跟随
      showTrailer : false,
      //跟随组件的坐标
      trailTop : 0,
      trailLeft : 0,
    }
    //当前常变数组内容项索引
    this.contentIndex = 0;

    //div的ref
    this.divRef = null;
    
    //函数绑定
    this.handleContentChange = this.handleContentChange.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  componentDidMount(){
    //当setter渲染出来之后总数加1
    totalSetter++;

    //将新的setter信息放入data数组中
    let setterInfo = {
      //静态效果
      totalN : data.length,
      index: this.props.index,
      width: this.state.width,
      height: this.state.height,
      x: this.state.x,
      y: this.state.y,
      color: this.props.selectedSetterColor,  //颜色对象
      content: (typeof(this.props.data)=='undefined')?'':this.props.data,
      //动态效果
      animeInfo: this.props.animeInfo
    };
    data[this.props.index] = setterInfo;

    //点击preview后将所有setter的信息传给后端
    this.emitter1 = EventEmitter.addListener("getSettersInfo",(msg) => {
     let body = JSON.stringify(data);

     //json-server测试版数据：因为json-server没有后端处理，要在preview中使用必须上传同时包含totalN和setters属性的对象
      let settersInfo = {
        totalN : data.length,
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
     })
     .catch(e => console.log('错误:', e))
  })

  //接收到被删除setter的索引：totalSetter--，并从data中删除该索引的setter
  this.emitter1 = EventEmitter.addListener("SelectedSetterDeleted",(index) => {
    totalSetter--;
    if(typeof(data[index]!=='undefined')){
      delete data[index];
    }
  })
  
}

handleContentChange(){
  this.contentIndex++;
  if(this.contentIndex >= this.props.animeInfo.changingContentArr.length){
    this.contentIndex = 0
  }
  //用来调用render
  this.setState({curContent : this.props.animeInfo.changingContentArr[this.contentIndex].activeKeyContent});
}

componentDidUpdate(prevProps, prevState){
  //每次props或者state更新后都会调用
  //拿到的prevProps值是所有的props旧值，prevState值是所有的state新值
  if(this.props.animeInfo.changingInterval !== this.state.curPropsInterval){
    //计时器时间间隔改变，更新计时器
    this.setState({curPropsInterval : this.props.animeInfo.changingInterval});
    this.setTimer();
  }
  //更新data数组
  let setterInfo = {
    //静态效果
    totalN : data.length,
    index: this.props.index,
    width: this.state.width,
    height: this.state.height,
    x: this.state.x,
    y: this.state.y,
    color: this.props.selectedSetterColor,  //颜色对象
    content: (typeof(this.props.data)=='undefined')?'':this.props.data,
    //动态效果
    animeInfo: this.props.animeInfo
  };
  data[this.props.index] = setterInfo;
}

//设置定时器
setTimer(){
  if(this.timer){
    clearInterval(this.timer);
  }
  if(this.props.animeInfo.changingInterval){
    this.timer = setInterval(this.handleContentChange, this.props.animeInfo.changingInterval * 50);
  }
}

handleMouseMove(event){
  //鼠标移动到画布内，出现鼠标跟随
  //这里event.client指的是在整个屏幕中的坐标，不是以画布组件的左上角为原点，而是以屏幕左上角为原点
  //故直接用event.client设置鼠标跟随位置，跟随组件会始终与鼠标差一个画布左上角到屏幕左上角的差值
  //要想鼠标跟随控件直接跟随鼠标，必须用event.client减去画布左上角与屏幕左上角的差值作为鼠标跟随坐标
  const boundingRect = ReactDOM.findDOMNode(this.divRef).getBoundingClientRect();
  this.setState({
      trailTop : (event.clientY - boundingRect.top),
      trailLeft : (event.clientX - boundingRect.left)
  })
  this.setState({showTrailer : true});
  //console.log("event.clientY : " + event.clientY + ", event.clientX : " + event.clientX)

  //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），在有setter的局部跟随区域内防止触发画布部分的跟随事件
  event.cancelBubble = true;
  event.stopPropagation();
}

handleMouseOut(){
  this.setState({showTrailer : false});
}

    render(){
      if(this.props.activeKey === this.props.index){
        //广播当前组件的信息
        let setterInfo = {
          //静态效果
          totalN : data.length,
          index: this.props.index,
          width: this.state.width,
          height: this.state.height,
          x: this.state.x,
          y: this.state.y,
          color: this.props.selectedSetterColor,  //颜色对象
          content: (typeof(this.props.data)=='undefined')?'':this.props.data,
          animeInfo: this.props.animeInfo
        };
        EventEmitter.emit("activeKeyInfo", setterInfo);
      }else if(this.props.activeKey === null){
        EventEmitter.emit("activeKeyInfo", null);
      }


      //setter的颜色：常变数组种当前项的颜色，如果常变数组为空，则是静态样式的颜色
      const setterColor = this.props.animeInfo.changingInterval? Color2Str(this.props.animeInfo.changingContentArr[this.contentIndex<this.props.animeInfo.changingContentArr.length?this.contentIndex:0].activeKeyColor) : Color2Str(this.props.selectedSetterColor);
      //未被选中的样式：灰色实线边框
      const layoutSetterStyle = {
        //完全按富文本文字显示，不默认水平和垂直居中
        //display: "flex",
        //alignItems: "center",
        //justifyContent: "center",
        border: "solid 1px #ddd",
        background: setterColor
      }
      //被选中的样式：红色虚线边框
      const activeLayoutSetterStyle = {
        //display: "flex",
        //alignItems: "center",
        //justifyContent: "center",
        border: "dashed 2px red",
        background: setterColor
      }
      const divStyle = {
        height : "100%",
        width : "100%",
        //background : "green"
      }

      const trailInfo = {
        trailingContentArr : this.props.animeInfo.trailingContentArr,
        trailingInterval : this.props.animeInfo.trailingInterval,
        trailerWidth : this.props.animeInfo.trailerWidth,
        trailerHeight : this.props.animeInfo.trailerHeight
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
        <Trailer
              top={this.state.trailTop}
              left={this.state.trailLeft}
              trailInfo={trailInfo}
              visibility={this.state.showTrailer}
          ></Trailer>
        {/* div的内容必须是this.props.data，不然单一内容时手动修改setter内容无效 */}
        <div  
          dangerouslySetInnerHTML={{__html:this.props.animeInfo.changingInterval?this.props.animeInfo.changingContentArr[this.contentIndex<this.props.animeInfo.changingContentArr.length?this.contentIndex:0].activeKeyContent:this.props.data}}
          style={divStyle}
          onMouseMove={this.handleMouseMove}
          onMouseOut={this.handleMouseOut}
          ref={element => this.divRef = element}>
          
          </div>
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
