import React from 'react'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import Flip from 'react-reveal/Flip';
import Rotate from 'react-reveal/Rotate';
import Bounce from 'react-reveal/Bounce';
import Slide from 'react-reveal/Slide';
import Roll from 'react-reveal/Roll';
import LightSpeed from 'react-reveal/LightSpeed';
import {Color2Str} from '../Utils/Color2Str'
import {GetFirstNotNullKey} from '../Utils/GetFirstNotNullKey'
import Trailer from '../Trailer/Trailer'
import './Preview.css'
import {ResizeFontSizeinHTMLStr} from '../Utils/ResizeFontSizeinHTMLStr'
import {Motion, spring} from 'react-motion'

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
            //鼠标当前位置
            mouseTop : 0,
            //mouseLeft : 0,
            //是否显示跟随
            showTrailer : false,
            //跟随组件的坐标
            trailTop : 0,
            trailLeft : 0,
            //设置了下滚动效的setter数组
            scrolledSetterArr : [],
            canvasHeight : 712,
            //文字走马灯marginLeft
            marqueeLeft : 0,

            //记录图片setter的图片宽高和位置的数组
            picSetterInfoArr : [],
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
        this.originalWidth = {};
        this.originalHeight = {};
        this.originalX = {};
        this.originalY = {};

        //当前页面下滚幅度
        this.curScrollTop = 0;

        //走马灯div的ref数组
        this.marqueeRef = [];
        //走马灯文字填充数组
        this.marqueeFillingArr = [];
        //走马灯定时器
        this.marqueeTimer = [];
        //走马灯文字宽度数组
        this.textWidth = [];
        //获取走马灯初始字符串的div数组
        this.marqueeTestArr = [];

        this.resized = false;

        
        this.handleChanging = this.handleChanging.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);   
        this.setMarqueeTimer = this.setMarqueeTimer.bind(this);     
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
            ResizeFontSizeinHTMLStr(this.wwidth / wcanvas, document);

        //监听窗口滚动回调函数：
        window.onscroll = function(){
            this.curScrollTop = window.scrollY;
            //改变鼠标跟随位置
            this.setState(state => ({
                trailTop : (state.mouseTop + this.curScrollTop),
            }));
            //遍历设置了下滚动效的setter：当前下滚幅度落在下滚动效区间时改变setter位置
            for(let i = 0;i < this.state.scrolledSetterArr.length;i++){
                //console.log("preview - this.state.scrolledSetterArr.length = " + this.state.scrolledSetterArr.length);
                if(this.state.setters[i] !== null && typeof(this.state.setters[i]) !== 'undefined' && typeof(this.state.scrolledSetterArr[i])!=='undefined'){
                    //console.log("preview - this.state.scrolledSetterArr[" + i + "] = " + this.state.scrolledSetterArr[i]);
                    const setterAnimeInfo = this.state.scrolledSetterArr[i].setter.animeInfo;
                    const originalScrollX = this.state.scrolledSetterArr[i].originalX;
                    const originalScrollY = this.state.scrolledSetterArr[i].originalY;
                    const originalScrollWidth = this.state.scrolledSetterArr[i].originalWidth;
                    const originalScrollHeight = this.state.scrolledSetterArr[i].originalHeight;
                    const deltaScrollTop = this.curScrollTop - setterAnimeInfo.startScrollTop;
                    if(this.curScrollTop >= setterAnimeInfo.startScrollTop && this.curScrollTop <= setterAnimeInfo.endScrollTop){
                        //当前下滚幅度落在下滚动效范围内：改变位置
                        let arr = this.state.setters;
                        let setter = arr[i];
                        setter.x = originalScrollX + setterAnimeInfo.deltaX * this.state.wrate * deltaScrollTop;
                        setter.y = originalScrollY + setterAnimeInfo.deltaY * this.state.wrate * deltaScrollTop;
                        //改变大小
                        setter.width = originalScrollWidth + setterAnimeInfo.deltaWidth * this.state.wrate * deltaScrollTop;
                        setter.height = originalScrollHeight + setterAnimeInfo.deltaHeight * this.state.wrate * deltaScrollTop;
                        arr[i] = setter;
                        this.setState({setters : arr});
                    }
                    if(this.curScrollTop <= setterAnimeInfo.startScrollTop){
                        //下滚幅度小于起点幅度：强行将setter位置设置为初始位置
                        let arr = this.state.setters;
                        let setter = arr[i];
                        setter.x = originalScrollX;
                        setter.y = originalScrollY;
                        setter.width = originalScrollWidth;
                        setter.height = originalScrollHeight;
                        arr[i] = setter;
                        this.setState({setters : arr});
                    }else if(this.curScrollTop >= setterAnimeInfo.endScrollTop){
                        //下滚幅度大于终点幅度：强行将setter位置设置为终止位置
                        let arr = this.state.setters;
                        let setter = arr[i];
                        const totalScrollTop = setterAnimeInfo.endScrollTop - setterAnimeInfo.startScrollTop;
                        setter.x = originalScrollX  + setterAnimeInfo.deltaX * totalScrollTop;
                        setter.y = originalScrollY  + setterAnimeInfo.deltaY* totalScrollTop;
                        setter.width = originalScrollWidth  + setterAnimeInfo.deltaWidth * totalScrollTop;
                        setter.height = originalScrollHeight  + setterAnimeInfo.deltaHeight * totalScrollTop;
                        arr[i] = setter;
                        this.setState({setters : arr});
                        //console.log("preview - onscroll - setter.y = " + setter.y);
                    }
                }
                
            }
        }.bind(this);
        
        //向后端发出请求，请求所有setter的信息
        //fetch('http://127.0.0.1:8081/setterInfo/0')
        //json-server测试地址
        fetch('http://127.0.0.1:3000/setterInfo')
        .then(res => res.json())
        .then(data => {
            //定时器设置
            for(let i = 0;i < data["totalN"];i++){
                const setter = data["setters"][i];
                if(setter !== null && typeof(setter) !== 'undefined'){
                    this.originalWidth[setter.index] = setter.width;
                    this.originalHeight[setter.index] = setter.height;
                    this.originalX[setter.index] = setter.x;
                    this.originalY[setter.index] = setter.y;
                    //为每个setter设置对应的常变动效
                    //如果设置了常变动效（定时器时间间隔不为0），则设置常变定时器
                    if(setter.animeInfo.changingInterval){
                        //setInterval必须传入函数！！！传入非函数只执行一次！！！
                        this.changingTimers[i] = setInterval(this.handleChanging(setter), setter.animeInfo.changingInterval * 50);
                        this.state.changingIndex[setter.index] = 0;
                    }
                    //判断setter有没有设置下滚动效：如果设置了，则放进下滚动效数组中
                    if(setter.animeInfo.hasScrollEffect){
                        let arr = [...this.state.scrolledSetterArr];
                        const scrollInfo = {
                            setter : setter,
                            originalX : setter.x,
                            originalY : setter.y,
                            originalWidth : setter.width,
                            originalHeight : setter.height,
                        }
                        arr[setter.index] = scrollInfo;
                        //arr.push(scrollInfo);
                        this.setState({scrolledSetterArr : arr});
                    }

                    const marqueeContainerStyle = {
                        width: setter.width * this.state.wrate,
                        position : "absolute",
                        overflow : "hidden",
                        whiteSpace : "nowrap",
                        visibility : "hidden",
                        margin : 0,
                        padding : 0
                    }

                    
                        //设置走马灯setter样式
                        const marqueeStyle = {
                            margin : 0,
                            padding : 0,
                            padding : 0,
                            display : "inline-block",
                            visibility : "none"
                    }


                    //设置setter的走马灯动效
                    //设置走马灯效果改变：判断打开还是关闭
                    if(setter.animeInfo.setMarquee === true && setter.content !== null && typeof(setter.content) !== 'undefined'){
                        //打开走马灯效果
                        //文字内容
                        const text = setter.content.replace(/<p/g,'<span').replace(/p>/g,'span>');
                        //容器的宽度
                        const containerWidth = setter.width;
                        //在文字宽度的对应index中加1
                        this.textWidth[setter.index] = 1;
                        //this.textWidth = this.marqueeRef.scrollWidth;
                        //计算多少span能填满div，然后把这些span都放进div中
                        let textNum = 20;
                        //这里刚刚将marqueeFillArr赋值，渲染的div其实还是空的，故textWidth=0，textNum=infinite，报错Invalid string length
                        this.marqueeFillingArr[setter.index] = "";
                        if(textNum < 1) textNum = 1;
                        for(let i = 0;i<textNum;i++){
                            this.marqueeFillingArr[setter.index] += text;
                        }
                        this.marqueeTestArr[setter.index] = 
                            <div style={marqueeContainerStyle}>
                                <div style={marqueeStyle} 
                                     ref={ref => this.marqueeRef[setter.index] = ref}
                                     dangerouslySetInnerHTML={{__html:text}}
                      ></div></div>
                    }else{
                        //关闭走马灯效果
                        if(this.marqueeTimer[setter.index]){
                            clearInterval(this.marqueeTimer[setter.index]);
                        }
                    }

                    //将图片setter的宽高和位置信息放入图片setter信息数组
                    //if(setter.pic !== ''){
                        //是图片组件
                        let arr = [...this.state.picSetterInfoArr];
                        arr[setter.index] = {
                            picWidth : setter.width,
                            picHeight : setter.height,
                            picTop : 0,
                            picLeft : 0,
                        }
                        this.setState({
                            picSetterInfoArr : arr,
                        })
                    //}
                }

            }
            this.setState({
                totalSetter: data["totalN"],
                setters : data["setters"]
            })
        })
        .catch(e => console.log('错误:', e)) 
     
        //从数据库中取出画布信息
        //json-server测试地址
        fetch('http://127.0.0.1:3000/canvasInfo')
        //fetch('http://127.0.0.1:8081/canvasInfo/0')
        .then(res => res.json())
        .then(data => {
            //设置画布跟随动效
            this.canvasInfo.trailingContentArr = [...data.trailingContentArr];
            this.canvasInfo.trailingInterval = data.trailingInterval;
            this.canvasInfo.trailerWidth = data.trailerWidth;
            this.canvasInfo.trailerHeight = data.trailerHeight;
            //监听全局鼠标移动
            window.onmousemove = function(event){
                //设置画布的跟随组件信息
                this.trailInfo.trailerHeight = this.canvasInfo.trailerHeight;
                this.trailInfo.trailerWidth = this.canvasInfo.trailerWidth;
                this.trailInfo.trailingContentArr = this.canvasInfo.trailingContentArr;
                this.trailInfo.trailingInterval = this.canvasInfo.trailingInterval;
                this.setState({
                    trailTop : (event.clientY + this.curScrollTop),
                    trailLeft : (event.clientX),
                    showTrailer : true,
                    mouseTop : event.clientY,
                })
            }.bind(this);
        })
        .catch(e => console.log('错误:', e))  

        //从数据库中取出画布高度
        //json-server测试地址
        fetch('http://127.0.0.1:3000/canvasLength')
        //fetch('http://127.0.0.1:8081/canvasLength/0')
        .then(res => res.json())
        .then(data => {
            //设置画布高度
            this.setState({canvasHeight : data.canvasHeight});
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

    setMarqueeTimer(index){
        if(this.state.setters[index].animeInfo.setMarquee){
            //设置了走马灯动效：检查是否开过计时器，如果没有就开一个；有就不管
            if(this.marqueeTimer[index] === null || typeof(this.marqueeTimer[index]) === 'undefined'){
                //没开过计时器：开一个
                this.marqueeTimer[index] = setInterval(() => {
                    this.setState(state=>({marqueeLeft : ((state.marqueeLeft - 1) % this.textWidth[index])}));
                  },10);
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
                trailTop : (event.clientY + this.curScrollTop),
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

    //悬停：鼠标进入（不冒泡）：文字缩放
    handleMouseEnter(index){
        this.hoveredSetterIndex = index;
        const setter = this.state.setters[index];
        const hoverScale = setter.animeInfo.hoverScale;
        if(setter.animeInfo.hoverScalePicOnly){
            //只缩放图片不缩放框
            let arr = [...this.state.picSetterInfoArr];
            const setterPicInfo = arr[setter.index];
            setterPicInfo.picWidth = setter.width * 1.2; //hoverScale;
            setterPicInfo.picHeight = setter.height * 1.2; //hoverScale;
            setterPicInfo.picTop = -(setterPicInfo.picWidth - setter.width) / 2;
            setterPicInfo.picLeft = -(setterPicInfo.picHeight - setter.height) / 2;
            this.setState({
                picSetterInfoArr : arr,
            })
        }else{
            //缩放框
            //this.originalWidth = setter.width;
            //this.originalHeight = setter.height;
            //this.originalX = setter.x;
            //his.originalY = setter.y;
            setter.x = this.originalX - (this.originalWidth[index] * setter.animeInfo.hoverScale - this.originalWidth[index]) / 2;
            setter.y = this.originalY - (this.originalHeight[index] * setter.animeInfo.hoverScale - this.originalHeight[index]) / 2;
            setter.height = this.originalHeight[index] * setter.animeInfo.hoverScale;
            setter.width = this.originalWidth[index] * setter.animeInfo.hoverScale;
            this.state.setters[index] = setter;
        }
        
    }

    //悬停：鼠标退出（冒泡）：文字缩放
    handleMouseLeave(index){
        this.hoveredSetterIndex = null;
        const setter = this.state.setters[index];
        if(setter.animeInfo.hoverScalePicOnly){
            //只缩放图片不缩放框
            let arr = [...this.state.picSetterInfoArr];
            const setterPicInfo = arr[setter.index];
            setterPicInfo.picWidth = setter.width;
            setterPicInfo.picHeight = setter.height;
            setterPicInfo.picTop = 0;
            setterPicInfo.picLeft = 0;
            this.setState({
                picSetterInfoArr : arr,
            })
        }else{
            setter.x = this.originalX[index];
            setter.y = this.originalY[index];
            setter.height = this.originalHeight[index];
            setter.width = this.originalWidth[index];
            this.state.setters[index] = setter;
        }
        
    }

    render(){
        if(!this.resized && document.getElementsByTagName('span').length !== 0){
            ResizeFontSizeinHTMLStr(this.state.wrate, document);
            this.resized = true
        }
        //所有setter的样式数组
        const divStyles = [];

        //加了动效的setter数组
        const animatedSetters = [];

        //使用从后端得到的数据设置文字setter的样式和动效
        for(let i = 0;i < this.state.setters.length;i++){
            const setter = this.state.setters[i];
            if(setter){
                //当setter的宽高值是带单位px的字符串时，去掉单位并转换为浮点数
                /*
            if(typeof(setter.width) == "string"){
                let index = setter.width.lastIndexOf("p")
                setter.width =parseFloat(setter.width.substring(0,index));
                index = setter.height.lastIndexOf("p");
                setter.height = parseFloat(setter.height.substring(0,index));
            }
            */

            //确定setter的颜色和文字：考虑全空的常变数组（长度不为0，全部删除）、空的常变数组内容项
            let contentBg = Color2Str(setter.color);
            let contentText = setter.content;
            let contentPic = setter.pic;
            const contentVid = setter.vid;
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
                        contentPic = contentArr[this.state.changingIndex[setter.index]].activeKeyPic;
                    }else if(contentArr.length > 0 && this.state.changingIndex[setter.index] < contentArr.length && contentArr[this.state.changingIndex[setter.index]] === null){
                        contentBg = Color2Str(contentArr[firstNotNullContentKey].activeKeyColor);
                        contentText = contentArr[firstNotNullContentKey].activeKeyContent;
                        contentPic = contentArr[firstNotNullContentKey].activeKeyPic;
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
                overflow : (setter.animeInfo.setMarquee || setter.vid !== '' || setter.animeInfo.hoverScalePicOnly)? "hidden":"none",
                whiteSpace : (setter.animeInfo.setMarquee || setter.vid !== '' || setter.animeInfo.hoverScalePicOnly)?"nowrap":"normal",
                //默认不居中，只有内容设置居中才居中
                //display : "flex",
                //flexDirection: 'column',
                //justifyContent:'center',
        };

            //设置走马灯setter样式
            const marqueeStyle = {
                marginLeft : this.state.marqueeLeft,
                padding : 0,
                display : "inline-block",
                //background : "red",
          }
          
        const containerStyle = {
            width: setter.width * this.state.wrate,
            height: setter.height * this.state.wrate,
            left: setter.x * this.state.wrate,
            top: setter.y * this.state.wrate,
            background: Color2Str(setter.color),
            position : "absolute",
            overflow : setter.animeInfo.setMarquee? "hidden":"none",
            whiteSpace : setter.animeInfo.setMarquee?"nowrap":"normal",
        }

        divStyles[setter.index] = setterStyle;
        //设置setter的动效并将setter放进数组里
        const reveal = setter.animeInfo.reveal;
        const setterText = contentText;
        let basicComponent = null;
        if(contentVid !== ''){
            basicComponent = 
            <div 
                style={setterStyle} > 
                <video 
                    loop="loop"
                    muted="muted"
                    playsInline="playsinline"
                    autoPlay="autoplay"
                    style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    preload : "none",
                    }}>
                    <source src={setter.vid} type="video/mp4"/>
                </video> 
            </div>
        }
        else if(contentPic !== ''){
            //是图片组件

            //图片样式
            const setterPicInfo = this.state.picSetterInfoArr[setter.index];
            //悬停只缩放图片，不缩放整个布局框大小的图片style
            const imgHoverScalePicOnlyStyle = {
                width : setterPicInfo.picWidth * this.state.wrate,
                //height : this.state.picHeight,
                top : setterPicInfo.picTop * this.state.wrate,
                left : setterPicInfo.picLeft * this.state.wrate,
                position : "absolute"
                
            }
            //console.log("imgHoverScalePicOnlyStyle.width = " + imgHoverScalePicOnlyStyle.width + ", imgHoverScalePicOnlyStyle.top = " + imgHoverScalePicOnlyStyle.top + "imgHoverScalePicOnlyStyle.left = " +imgHoverScalePicOnlyStyle.left);  
        
            const imgNormalStyle = {
                width : "100%",
            }

            if(setter.animeInfo.hoverScale === 1){
                //没有缩放效果：不要motion
                basicComponent = 
                <div 
                style={setterStyle} 
                onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                onMouseOut={this.handleMouseOut}
                onMouseEnter={() => this.handleMouseEnter(setter.index)}
                onMouseLeave={() => this.handleMouseLeave(setter.index)}> 
                <img 
                    style={{
                        width : "100%",
                    }}
                    //style={setter.animeInfo.hoverScalePicOnly? imgHoverScalePicOnlyStyle : imgNormalStyle}
                    onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                    onMouseOut={this.handleMouseOut}
                    onMouseEnter={() => this.handleMouseEnter(setter.index)}
                    onMouseLeave={() => this.handleMouseLeave(setter.index)}
                    src={contentPic} 
                    alt="failed to load picture:(" 
                    //width="100%"
                    />      
            </div>}
            else{
                //设置了缩放：要motion
                basicComponent = 
            <Motion style={{
                width : spring(setterStyle.width),
                height : spring(setterStyle.height),
                top : spring(setterStyle.top),
                left : spring(setterStyle.left)
            }}>
            {containerMotionStyle => <div 
                style={{
                    width : containerMotionStyle.width,
                    //height : containerMotionStyle.height,
                    top : containerMotionStyle.top,
                    left : containerMotionStyle.left,
                    position : setterStyle.position,
                    overflow : setterStyle.overflow,
                    whiteSpace : setterStyle.whiteSpace,
                }} 
                onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                onMouseOut={this.handleMouseOut}
                onMouseEnter={() => this.handleMouseEnter(setter.index)}
                onMouseLeave={() => this.handleMouseLeave(setter.index)}> 
                <Motion style={{
                    width : spring(imgHoverScalePicOnlyStyle.width),
                    top : spring(imgHoverScalePicOnlyStyle.top),
                    left : spring(imgHoverScalePicOnlyStyle.left),
                }}>
                {motionStyle => 
                <img 
                    style={{
                        width : setter.animeInfo.hoverScalePicOnly?motionStyle.width: "100%",
                        top : setter.animeInfo.hoverScalePicOnly?motionStyle.top: 0,
                        left : setter.animeInfo.hoverScalePicOnly?motionStyle.left: 0,
                        position: "relative"
                    }}
                    //style={setter.animeInfo.hoverScalePicOnly? imgHoverScalePicOnlyStyle : imgNormalStyle}
                    onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                    onMouseOut={this.handleMouseOut}
                    onMouseEnter={() => this.handleMouseEnter(setter.index)}
                    onMouseLeave={() => this.handleMouseLeave(setter.index)}
                    src={contentPic} 
                    alt="failed to load picture:(" 
                    //width="100%"
                    />}
                </Motion>           
            </div>}
            </Motion>
            }
            
        }else if(setter.animeInfo.setMarquee){
            //是文字组件，且有走马灯动效
            //走马灯动效与其他动效不同时使用
            basicComponent = <div style={containerStyle}><div 
                    //ref={element => this.marqueeRef[setter.index] = element} 
                    style={marqueeStyle} 
                    dangerouslySetInnerHTML={{__html:(setter.content !== null && typeof(setter.content) !== 'undefined') ? setter.content.replace(/<p/g,'<span').replace(/p>/g,'span>') + this.marqueeFillingArr[setter.index] : setter.content}}></div></div>
            if(this.marqueeRef[setter.index] !== null && typeof(this.marqueeRef[setter.index]) !== 'undefined'){
                this.textWidth[setter.index] = this.marqueeRef[setter.index].scrollWidth;
                this.setMarqueeTimer(setter.index);
            }

            
        }else{
            if(setter.animeInfo.hoverScale === 1){
                //没设置缩放：不要motion
                basicComponent = 
                <div 
                    style={setterStyle} 
                    dangerouslySetInnerHTML={{__html:setterText}}
                    onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                    onMouseOut={this.handleMouseOut}
                    onMouseEnter={() => this.handleMouseEnter(setter.index)}
                    onMouseLeave={() => this.handleMouseLeave(setter.index)}
                    >            
                    </div>
            }else{
                //设置了缩放：要motion
                //是文字组件，且无走马灯动效
            basicComponent = 
            <Motion style={{
                width : spring(setterStyle.width),
                height : spring(setterStyle.height),
                top : spring(setterStyle.top),
                left : spring(setterStyle.left)
            }}>
                {motionStyle => 
                    <div 
                    style={{
                        width : motionStyle.width,
                        height : motionStyle.height,
                        top : motionStyle.top,
                        left : motionStyle.left,
                        background : setterStyle.background,
                        position : setterStyle.position,
                        overflow : setterStyle.overflow,
                        whiteSpace : setterStyle.whiteSpace,
                    }} 
                    dangerouslySetInnerHTML={{__html:setterText}}
                    onMouseMove={(event) => this.handleMouseMove(setter.index, event)}
                    onMouseOut={this.handleMouseOut}
                    onMouseEnter={() => this.handleMouseEnter(setter.index)}
                    onMouseLeave={() => this.handleMouseLeave(setter.index)}
                    >            
                    </div>
                }
            
        </Motion>
            }
            
        }
        
        
        let revealComponent = basicComponent;
        switch(reveal){
            case "Zoom":
              revealComponent = <Zoom>{basicComponent}</Zoom>;
              break;
            case "Fade":
              revealComponent = <Fade>{basicComponent}</Fade>
              break;
            case "Flip":
                revealComponent = <Flip>{basicComponent}</Flip>
                break;
            case "Rotate":
                revealComponent = <Rotate>{basicComponent}</Rotate>
                break;
            case "Bounce":
                revealComponent = <Bounce>{basicComponent}</Bounce>
                break;
            case "Slide":
                revealComponent = <Slide>{basicComponent}</Slide>
                break;
            case "Roll":
                revealComponent = <Roll>{basicComponent}</Roll>
                break;
            case "LightSpeed":
                revealComponent = <LightSpeed>{basicComponent}</LightSpeed>
                break;
          }
        animatedSetters[setter.index] = revealComponent;
    }
            }

        const divStyle = {
            width : this.wwidth,
            //height : "100%",
            overflowX : "hidden",
            overflowY : "scroll",
            background : "red"
        }

        const lengthDivStyle = {
            background : "red",
            height: "1px",
            width: "1px",
            position : "absolute",
            top : this.state.canvasHeight * this.state.wrate,
            left : 0
          }
          //console.log("preview - lengthDivStyle - this.state.canvasHeight = " + this.state.canvasHeight);
        return (
            //按样式动态生成setter
            <body style={{overflowX : "hidden"}}>
            <div 
            style={divStyle}
            >
                {/* 控制画布组件高度的看不见div */}
                <div style={lengthDivStyle}></div>
                {/* 获取走马灯初始文字宽度的div */}
                {this.marqueeTestArr.map(item => item)}

            {this.state.setters.map((item,index) => typeof(item) === undefined?null:
                animatedSetters[index])
            }
            {this.hoveredSetterIndex !== null? this.state.setters[this.hoveredSetterIndex].animeInfo.hoverContentArr.map(item => {
                if(typeof(item) === 'undefined' || item === null){
                    return null
                }else{
                    if(item.activeKeyPic !== ''){
                        //是图片组件
                        const hoverStyle = {
                            width : item.width * this.state.wrate,
                            height : item.height * this.state.wrate,
                            position : "absolute",
                            left: item.left * this.state.wrate,
                            top: item.top * this.state.wrate,
                            overflow : "hidden",
                        }
                        return <div style={hoverStyle}><img src={item.activeKeyPic}  /></div>
                    }else{
                        //是文字组件
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
                }
                
            }):null}
            <Trailer
                    top={this.state.trailTop}
                    left={this.state.trailLeft}
                    trailInfo={this.trailInfo}
                    visibility={this.state.showTrailer}
                ></Trailer>
            </div></body>
        );
    }
}
export default Preview;