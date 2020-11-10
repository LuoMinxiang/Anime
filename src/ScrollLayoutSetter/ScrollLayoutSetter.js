import React from 'react'
import { Rnd } from 'react-rnd'
import EventEmitter from '../Utils/EventEmitter'
class ScrollLayoutSetter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            width : 0,
            height : 0,
            x : 0,
            y : 0,
            startX : 0,
            startY : 0,
            curActiveKey : null,
            //visibility : "hidden"
        }
        //console.log("scrollLayoutSetter - constructor - width = " + this.props.width + ", height = " + this.props.height + ", x = " + this.props.x + ", curActiveKey = " + this.state.curActiveKey);
        this.canvasRef = React.createRef();
    }

    componentDidMount(){
        //接收选中layoutSetter的信息：如果收到的layoutSetter的index与当前curActiveKey不同，则认为切换setter或取消选中
        this.emitter = EventEmitter.addListener("activeKeyInfo", (activeKeyInfo) => {
            if(activeKeyInfo !== null){
                //判断是否切换setter
                if(activeKeyInfo.index !== this.state.curActiveKey){
                    //切换setter：使用新传入的setter的位置和宽高
                    this.setState({
                        width : activeKeyInfo.animeInfo.hasScrollEffect? activeKeyInfo.animeInfo.endSize.width : activeKeyInfo.width,
                        height : activeKeyInfo.animeInfo.hasScrollEffect? activeKeyInfo.animeInfo.endSize.height : activeKeyInfo.height,
                        x : activeKeyInfo.animeInfo.hasScrollEffect? activeKeyInfo.animeInfo.endXY.x : activeKeyInfo.x + 200,
                        y : activeKeyInfo.animeInfo.hasScrollEffect? activeKeyInfo.animeInfo.endXY.y : activeKeyInfo.y + 200,
                        startX : activeKeyInfo.x,
                        startY : activeKeyInfo.y,
                        curActiveKey : activeKeyInfo.index
                    });
                }
                if(activeKeyInfo.x !== this.state.startX || activeKeyInfo.y !== this.state.startY){
                    //原setter移动了位置，改变连线原点的位置
                    this.setState({
                        startX : activeKeyInfo.x,
                        startY : activeKeyInfo.y,
                    })
                }
            }else{
                //取消对setter的选中（点击画布）：将curActiveKey置空，宽高和位置置零
                if(this.state.curActiveKey !== null){
                    this.setState({
                        width : 0,
                        height : 0,
                        x : 0,
                        y : 0,
                        startY : 0,
                        startX : 0,
                        curActiveKey : null
                    });
                }
            }
        })

    /*
    const canvas = this.canvasRef.current;
    if(canvas.getContext){
      var ctx = canvas.getContext("2d");
            //console.log(ctx);
            //console.log(Object.getPrototypeOf(ctx));
            (function () {
              Object.getPrototypeOf(ctx).line = function (x, y, x1, y1) {
                  this.save();
                  this.beginPath();
                  this.moveTo(x, y);
                  this.lineTo(x1, y1);
                  this.stroke();
                  this.restore();
              }
          })();
          ctx.strokeStyle = "#7C8B8C";
          ctx.line(0,0,200,200)
          //ctx.line(this.state.startX, this.state.startY, this.state.x, this.state.y);
    }
    */
    }

    render(){
        const containerStyle = {
            visibility : this.props.visibility,
            //background : "red",
            width : "100%",
            height : "100%",
        }
        const scrollLayoutSetterStyle = {
            border : "dashed 2px blue",
            //zIndex : 2,
        }
        const svgStyle = {
            width : "100%",
            height : "100%",
            version : "1.1",
            xmlns : "http://www.w3.org/2000/svg",
            //zIndex : 2,
        }
        const lineStyle = {
            //x1 : 0,
            //x2 : 300,
            //y1 : 0,
            //y2 : 300,
            //虚线中实线的长度和间隙的长度
            strokeDasharray : "4 2",
            stroke:'blue',
            strokWidth:2
        }

        const canvasStyle = {
            width : "100%",
            height : "100%",
            background : "red"
        }

        return (
            <div style={containerStyle}>
            <Rnd 
                style={scrollLayoutSetterStyle}
                size={{ width: this.state.width,  height: this.state.height }}
                position={{ x: this.state.x, y: this.state.y }}
                onClick={(e) => {
                    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
                    e.cancelBubble = true;
                    e.stopPropagation();
                }}
                onDragStop={(e, d) => { 
                    this.setState({ x: d.x, y: d.y });
                    this.originalX = d.x;
                    this.originalY = d.y;
                    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
                    e.cancelBubble = true;
                    e.stopPropagation();
                    if(this.props.onDragStop){
                        this.props.onDragStop();
                    }
                  }}
                  onDrag={(e, d) => {
                      //在拖拽过程中就实时改变state的位置信息，使得svg直线可以在拖拽过程中跟随下滚位置设置组件移动 
                    this.setState({ x: d.x, y: d.y });
                    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
                    e.cancelBubble = true;
                    e.stopPropagation();
                    if(this.props.onDrag){
                        this.props.onDrag(e,d);
                    }
                  }}
                  
                  onResizeStop={(e, direction, ref, delta, position) => {
                    this.setState({
                      width: ref.style.width,
                      height: ref.style.height,
                      ...position,
                    });
                    if(this.props.onResize){
                        if(typeof(ref.style.width) == "string"){
                            let index = ref.style.width.lastIndexOf("p")
                            const width =parseFloat(ref.style.width.substring(0,index));
                            index = ref.style.height.lastIndexOf("p");
                            const height = parseFloat(ref.style.height.substring(0,index));
                            this.props.onResize(width, height);
                        }else{
                            this.props.onResize(ref.style.width, ref.style.height);
                        }
                        
                    }
                    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
                    e.cancelBubble = true;
                    e.stopPropagation();
                }}

                onResize={(e, direction, ref, delta, position) => {
                    this.setState({
                      width: ref.style.width,
                      height: ref.style.height,
                      ...position,
                    });
                    /*
                    if(this.props.onResize){
                        this.props.onResize(ref.style.width, ref.style.height);
                    }
                    */
                    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
                    e.cancelBubble = true;
                    e.stopPropagation();
                }}
                >
            </Rnd>

                {/**<canvas ref={this.canvasRef}
                style={canvasStyle}
                ></canvas> */}
            


            <svg style={svgStyle}>
                <line x1={this.state.startX} y1={this.state.startY} x2={this.state.x} y2={this.state.y} style={lineStyle}/>
            </svg> 
            
            </div>
        );
    }
}
export default ScrollLayoutSetter;