import React from 'react'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import {Color2Str} from '../Utils/Color2Str'
import Trailer from '../Trailer/Trailer'

//预览界面

class Preview extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //所有setter总数
            totalSetter : 0,
            //所有setter的信息数组
            setters : [],
            //预览窗口和画布的宽度比
            wrate : (1500/1024),
            //当前常变动效内容项索引数组（每个setter都有自己的当前内容项索引）
            changingIndex : [],
            //跟随动效
            //是否显示跟随
            showTrailer : false,
            //跟随组件的坐标
            trailTop : 0,
            trailLeft : 0,
        }
        //常变计时器数组
        this.changingTimers = [];
        //当前跟随动效设置对象（根据鼠标位置改变而改变）
        this.trailInfo = {
            trailingContentArr : [],
            trailingInterval : 0,
            trailerWidth : 0,
            trailerHeight : 0
        }
        this.canvasInfo = {
            trailingContentArr : [],
            trailingInterval : 0,
            trailerWidth : 0,
            trailerHeight : 0
        };

        this.wwidth = 0;

        this.handleChanging = this.handleChanging.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }
    
    componentDidMount(){
        //当预览窗口改变时，按比例改变setter的位置和大小
        window.onresize = function(){
            //画布宽为1024
            let wcanvas = 1024;
            this.wwidth = document.body.clientWidth;
            this.setState({wrate : this.wwidth / wcanvas});
        }.bind(this)
            //初始化预览窗口和画布的宽度比
            let wcanvas = 1200;
            this.wwidth = document.body.clientWidth;
            this.setState({wrate : this.wwidth / wcanvas});

        
        //向后端发出请求，请求所有setter的信息
        //fetch('http://127.0.0.1:8081/setterInfo')
        //json-server测试地址
        fetch('http://127.0.0.1:3000/setterInfo')
        .then(res => res.json())
        .then(data => {
            //定时器设置
            for(let i = 0;i < data["totalN"];i++){
                const setter = data["setters"][i];
                if(setter){
                    //为每个setter设置对应的常变动效
                    //如果设置了常变动效（定时器时间间隔不为0），则设置常变定时器
                    if(setter.animeInfo.changingInterval){
                        //setInterval必须传入函数！！！传入非函数只执行一次！！！
                        this.changingTimers[i] = setInterval(this.handleChanging(setter), setter.animeInfo.changingInterval * 50);
                        this.state.changingIndex[setter.index] = 0;
                    }
                }
            }
            this.setState({
                totalSetter: data["totalN"],
                setters : data["setters"]
            }, ()=>{
                console.log("setState done!");
            })
        })
        .catch(e => console.log('错误:', e))   
     
        //从数据库中取出画布信息
        //json-server测试地址
        fetch('http://127.0.0.1:3000/canvasInfo')
        .then(res => res.json())
        .then(data => {
            console.log("preview - canvasInfo - data = " + data);
            //设置画布跟随动效
            this.canvasInfo.trailingContentArr = [...data.trailingContentArr];
            this.canvasInfo.trailingInterval = data.trailingInterval;
            this.canvasInfo.trailerWidth = data.trailerWidth;
            this.canvasInfo.trailerHeight = data.trailerHeight;
            //监听全局鼠标移动
            window.onmousemove = function(event){
                //设置画布的跟随组件信息
                console.log("preview - window - onmousemove");
                this.trailInfo.trailerHeight = this.canvasInfo.trailerHeight;
                this.trailInfo.trailerWidth = this.canvasInfo.trailerWidth;
                this.trailInfo.trailingContentArr = this.canvasInfo.trailingContentArr;
                this.trailInfo.trailingInterval = this.canvasInfo.trailingInterval;
                this.setState({
                    trailTop : (event.clientY),
                    trailLeft : (event.clientX),
                    showTrailer : true
                })
            }.bind(this);
        })
        .catch(e => console.log('错误:', e))  
    }

    componentWillUnmount(){
        //清除计时器
        for(let i = 0;i < this.changingTimers.length;i++){
            if(this.changingTimers[i]){
                clearInterval(this.changingTimers[i]);
            }
        }
    }

    //改变当前的常变动效内容项索引
    handleChanging = (setter) => () => {
        let index = this.state.changingIndex;
        index[setter.index]++;
        if(index[setter.index] >= setter.animeInfo.changingContentArr.length){
            index[setter.index] = 0;
        }
        this.setState({changingIndex : index});
    }

    handleMouseMove = (index, event) =>  {
        console.log("preview - setter - onmousemove");
        //设置跟随组件信息
        this.trailInfo.trailerHeight = this.state.setters[index].animeInfo.trailerHeight;
        this.trailInfo.trailerWidth = this.state.setters[index].animeInfo.trailerWidth;
        this.trailInfo.trailingContentArr = this.state.setters[index].animeInfo.trailingContentArr;
        this.trailInfo.trailingInterval = this.state.setters[index].animeInfo.trailingInterval;
        this.setState({
            trailTop : (event.clientY),
            trailLeft : (event.clientX),
            showTrailer : true
        })

        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），在有setter的局部跟随区域内防止触发画布部分的跟随事件
        event.cancelBubble = true;
        event.stopPropagation();
    }

    handleMouseOut(){
        this.setState({showTrailer : false});
      }

    render(){
        //所有setter的样式数组
        const divStyles = [];

        //加了动效的setter数组
        const animatedSetters = [];

        //使用从后端得到的数据设置所有setter的样式和动效
        for(let i = 0;i < this.state.totalSetter;i++){
            const setter = this.state.setters[i];
            if(setter){
                console.log(setter.content);
                //当setter的宽高值是带单位px的字符串时，去掉单位并转换为浮点数
            if(typeof(setter.width) == "string"){
                let index = setter.width.lastIndexOf("p")
                setter.width =parseFloat(setter.width.substring(0,index));
                index = setter.height.lastIndexOf("p");
                setter.height = parseFloat(setter.height.substring(0,index));
            }

            const setterColor = setter.animeInfo.changingContentArr.length>0?Color2Str(setter.animeInfo.changingContentArr[this.state.changingIndex[setter.index]].activeKeyColor):Color2Str(setter.color);
            //设置该setter的样式
            const setterStyle = {         
                width: setter.width * this.state.wrate,
                height: setter.height * this.state.wrate,
                left: setter.x * this.state.wrate,
                top: setter.y * this.state.wrate,
                background: setterColor,
                position : "absolute",
                //默认不居中，只有内容设置居中才居中
                //display : "flex",
                //flexDirection: 'column',
                //justifyContent:'center',
        };
        divStyles[setter.index] = setterStyle;
        //设置setter的动效并将setter放进数组里
        const reveal = setter.animeInfo.reveal;
        const setterText = setter.animeInfo.changingContentArr.length>0?setter.animeInfo.changingContentArr[this.state.changingIndex[setter.index]].activeKeyContent:setter.content;
        const basicComponent = 
        <div 
            style={setterStyle} 
            dangerouslySetInnerHTML={{__html:setterText}}
            onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
            onMouseOut={this.handleMouseOut}
        >            
        </div>
        let revealComponent = basicComponent;
        switch(reveal){
            case "Zoom":
              revealComponent = <Zoom>{basicComponent}</Zoom>;
              break;
            case "Fade":
              revealComponent = <Fade>{basicComponent}</Fade>
              break;
          }
        animatedSetters[setter.index] = revealComponent;
    }
            }

        const divStyle = {
            width : "100%",
            height : "100%",
            background : "red"
        }
        return (
            //按样式动态生成setter
            <div 
            style={divStyle}
            >
            {this.state.setters.map((item,index) => typeof(item) === undefined?null:
                animatedSetters[index])
            }
            <Trailer
                    top={this.state.trailTop}
                    left={this.state.trailLeft}
                    trailInfo={this.trailInfo}
                    visibility={this.state.showTrailer}
                ></Trailer>
            </div>
        );
    }
}
export default Preview;