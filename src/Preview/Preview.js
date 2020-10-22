import React from 'react'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import {Color2Str} from '../Utils/Color2Str'
import {GetFirstNotNullKey} from '../Utils/GetFirstNotNullKey'
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
        
        //被悬停的setter下标
        this.hoveredSetterIndex = null;
        //悬停缩放前的位置和宽高数组
        this.originalWidth = null;
        this.originalHeight = null;
        this.originalX = null;
        this.originalY = null;
        
        this.handleChanging = this.handleChanging.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
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
        if(this.state.changingIndex[setter.index] < setter.animeInfo.changingContentArr.length){
            //存在非空常变内容项：改变当前常变内容项
            //由于内容数组更新时不调用componentDidUpdate，故不能在全空时即使将this.firstNotNullContentKey置为内容数组长度，可能造成计时器回调函数死循环
            //防止死循环计数器：index+1时count+1，count到内容数组的长度时将index置为内容数组的长度并退出循环
            let count = 0;
            let index = this.state.changingIndex[setter.index];
            index++;
            count++;
            if(index >= setter.animeInfo.changingContentArr.length){
                index = 0
            }
            while(index < setter.animeInfo.changingContentArr.length && setter.animeInfo.changingContentArr[index] === null){
                //跳过为空的内容项
                index++;
                count++;
                if(index >= setter.animeInfo.changingContentArr.length){
                    //递增出界时回到0
                    index = 0;
                }
                if(count >= setter.animeInfo.changingContentArr.length){
                    index = setter.animeInfo.changingContentArr.length;
                    break;
                }
            }
            let indexArr = [...this.state.changingIndex];
            indexArr[setter.index] = index;
            this.setState({changingIndex : indexArr});
        }

    }

    //跟随：鼠标进入并移动
    handleMouseMove = (index, event) =>  {
        if(this.state.setters[index].animeInfo.trailerHeight !== 0){
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
        
    }

    //跟随：鼠标退出
    handleMouseOut(){
        this.setState({showTrailer : false});
      }

    //悬停：鼠标进入（不冒泡）
    handleMouseEnter(index){
        this.hoveredSetterIndex = index;
        const setter = this.state.setters[index];
        this.originalWidth = setter.width;
        this.originalHeight = setter.height;
        this.originalX = setter.x;
        this.originalY = setter.y;
        setter.x = setter.x - (setter.width * setter.animeInfo.hoverScale - setter.width) / 2;
        setter.y = setter.y - (setter.height * setter.animeInfo.hoverScale - setter.height) / 2;
        setter.height = setter.height * setter.animeInfo.hoverScale;
        setter.width = setter.width * setter.animeInfo.hoverScale;
        this.state.setters[index] = setter;
    }

    //悬停：鼠标退出（冒泡）
    handleMouseLeave(index){
        this.hoveredSetterIndex = null;
        const setter = this.state.setters[index];
        setter.x = this.originalX;
        setter.y = this.originalY;
        setter.height = this.originalHeight;
        setter.width = this.originalWidth;
        this.state.setters[index] = setter;
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
                //console.log(setter.content);
                //当setter的宽高值是带单位px的字符串时，去掉单位并转换为浮点数
            if(typeof(setter.width) == "string"){
                let index = setter.width.lastIndexOf("p")
                setter.width =parseFloat(setter.width.substring(0,index));
                index = setter.height.lastIndexOf("p");
                setter.height = parseFloat(setter.height.substring(0,index));
            }

            //确定setter的颜色和文字：考虑全空的常变数组（长度不为0，全部删除）、空的常变数组内容项
            let contentBg = Color2Str(setter.color);
            let contentText = setter.content;
            let contentArr = [];
            let firstNotNullContentKey = 0;
            if(setter.animeInfo.changingInterval){
                contentArr = setter.animeInfo.changingContentArr;
                firstNotNullContentKey = GetFirstNotNullKey(setter.animeInfo.changingContentArr);
                if(firstNotNullContentKey < contentArr.length){
                    //存在非空内容项：设置当前常变组件的颜色和文字
                    if(contentArr.length > 0 && this.state.changingIndex[setter.index] < contentArr.length && contentArr[this.state.changingIndex[setter.index]] !== null){
                        contentBg = Color2Str(contentArr[this.state.changingIndex[setter.index]].activeKeyColor);
                        contentText = contentArr[this.state.changingIndex[setter.index]].activeKeyContent;
                    }else if(contentArr.length > 0 && this.state.changingIndex[setter.index] < contentArr.length && contentArr[this.state.changingIndex[setter.index]] === null){
                        contentBg = Color2Str(contentArr[firstNotNullContentKey].activeKeyColor);
                        contentText = contentArr[firstNotNullContentKey].activeKeyContent;
                        let indexArr = [...this.state.changingIndex];
                        indexArr[setter.index] = firstNotNullContentKey;
                        this.setState({changingIndex : indexArr});
                    }
                } 
            }

            const setterColor = contentBg;
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
        const setterText = contentText;
        const basicComponent = 
        <div 
            style={setterStyle} 
            dangerouslySetInnerHTML={{__html:setterText}}
            onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
            onMouseOut={this.handleMouseOut}
            onMouseEnter={() => this.handleMouseEnter(setter.index)}
            onMouseLeave={() => this.handleMouseLeave(setter.index)}
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
            {this.hoveredSetterIndex !== null? this.state.setters[this.hoveredSetterIndex].animeInfo.hoverContentArr.map(item => {
                if(typeof(item) === 'undefined' || item === null){
                    return null
                }else{
                    const hoverStyle = {
                    width : item.width * this.state.wrate,
                    height : item.height * this.state.wrate,
                    position : "absolute",
                    left: item.left * this.state.wrate,
                    top: item.top * this.state.wrate,
                    background : Color2Str(item.activeKeyColor),
                }
                return <div 
                        style={hoverStyle}
                        dangerouslySetInnerHTML={{__html: item.activeKeyContent}}
                ></div>
                }
                
            }):null}
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