import * as React from 'react';
import { Rnd } from 'react-rnd'
import EventEmitter from '../Utils/EventEmitter'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import {Color2Str} from '../Utils/Color2Str'
import {GetFirstNotNullKey} from '../Utils/GetFirstNotNullKey'
import Trailer from '../Trailer/Trailer'
import ReactDOM from 'react-dom'
import { Motion, spring } from 'react-motion'
import './LayoutSetter.css'
import { TransferWithinAStationSharp } from '@material-ui/icons';
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
      width : this.props.width? this.props.width: 320,
      height : this.props.height? this.props.height: 200,
      x : this.props.x? this.props.x: 0,
      y : this.props.y? this.props.y: this.props.canvasScrollTop?this.props.canvasScrollTop:0,
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

      //当前画布的下滚幅度：判断画布下滚幅度有无改变
      curScrollTop : this.props.canvasScrollTop?this.props.canvasScrollTop:0,
      
      //文字走马灯marginLeft
      marqueeLeft : 0,
      //当前是否设置走马灯效果
      curSetMarquee : false,

      //图片宽高和位置
      picWidth : 320,
      picHeight : 200,
      picTop : 0,
      picLeft : 0,
    }
    //当前常变数组内容项索引
    this.contentIndex = 0;
    //当前常变数组第一个非空内容索引：当常变内容数组全空时置为常变内容数组的长度
    this.firstNotNullContentKey = 0;

    //div的ref
    this.divRef = null;

    //走马灯div的ref
    this.marqueeRef = null;
    //走马灯文字填充数组
    this.marqueeFillingArr = "";

    //缩放前的宽高：防止恢复时由于计算累计误差无法恢复宽高
    this.originalWidth = this.state.width;
    this.originalHeight = this.state.height;
    //缩放前的位置：缩放应该是以中心点辐射性缩放，而不是保持左上角坐标不变缩放，所以位置也要表
    this.originalX = this.state.x;
    this.originalY = this.state.y;

    //记录下滚动效前的原始位置：防止下滚时出现累计误差
    this.originalScrollX = this.state.x;
    this.originalScrollY = this.state.y;
    //记录下滚动效前的宽高：防止下滚时出现累计误差
    this.originalScrollWidth = this.state.width;
    this.originalScrollHeight = this.state.height;

    //basicComponent组件是否使用motion效果：只有文字/图片缩放和下滚缩放/移动时使用
    this.usingMotion = false;
    
    //函数绑定
    this.handleContentChange = this.handleContentChange.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.setMarqueeTimer = this.setMarqueeTimer.bind(this);
    this.handleMouseEnterPic = this.handleMouseEnterPic.bind(this);
    this.handleMouseLeavePic = this.handleMouseLeavePic.bind(this);
    this.sendSetterInfo = this.sendSetterInfo.bind(this);
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
      pic : this.props.pic,
      vid : this.props.vid,
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
      
     fetch('http://127.0.0.1:8081/setterInfo/0',{
     //json-server测试接口
     //fetch('http://127.0.0.1:3000/setterInfo',{
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
  this.emitter2 = EventEmitter.addListener("SelectedSetterDeleted",(index) => {
    totalSetter--;
    if(typeof(data[index]!=='undefined')){
      delete data[index];
    }
    EventEmitter.emit("activeKeyInfo", null);
  })
  
}

handleContentChange(){
  if(this.contentIndex < this.props.animeInfo.changingContentArr.length){
    //存在非空常变内容项：改变当前常变内容项
    //由于内容数组更新时不调用componentDidUpdate，故不能在全空时即使将this.firstNotNullContentKey置为内容数组长度，可能造成计时器回调函数死循环
    //防止死循环计数器：index+1时count+1，count到内容数组的长度时将index置为内容数组的长度并退出循环
    let count = 0;
    this.contentIndex++;
    count++;
    if(this.contentIndex >= this.props.animeInfo.changingContentArr.length){
      this.contentIndex = 0
    }
    while(this.contentIndex < this.props.animeInfo.changingContentArr.length && this.props.animeInfo.changingContentArr[this.contentIndex] === null){
      //跳过为空的内容项
      this.contentIndex++;
      count++;
      if(this.contentIndex >= this.props.animeInfo.changingContentArr.length){
        //递增出界时回到0
        this.contentIndex = 0;
      }
      if(count >= this.props.animeInfo.changingContentArr.length){
        this.contentIndex = this.props.animeInfo.changingContentArr.length;
        break;
      }
    }
}

if(this.contentIndex === this.props.animeInfo.changingContentArr.length){
  this.setState({curContent : null});
}else{
  //用来调用render
  this.setState({curContent : this.props.animeInfo.changingContentArr[this.contentIndex].activeKeyContent});
}
  
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
    pic : this.props.pic,
    vid : this.props.vid,
    color: this.props.selectedSetterColor,  //颜色对象
    content: (typeof(this.props.data)=='undefined')?'':this.props.data,
    //动态效果
    animeInfo: this.props.animeInfo
  };
  data[this.props.index] = setterInfo;

  //监听画布下滚幅度的变化：下滚幅度在下滚动效范围内时改变x和y值
  if(this.props.canvasScrollTop !== this.state.curScrollTop && this.props.activeKey !== this.props.index){
    if(this.props.animeInfo.hasScrollEffect){
      //设置了下滚动效：判断当前下滚幅度是否落在下滚动效范围内
      if(this.props.canvasScrollTop >= this.props.animeInfo.startScrollTop && this.props.canvasScrollTop <= this.props.animeInfo.endScrollTop){
        //当前下滚幅度落在下滚动效范围内：改变x和y值
        const deltaX = this.props.animeInfo.deltaX;
        const deltaY = this.props.animeInfo.deltaY;
        const deltaScrollTop = this.props.canvasScrollTop - this.props.animeInfo.startScrollTop;
        const curX = this.originalScrollX + deltaX * deltaScrollTop;
        const curY = this.originalScrollY + deltaY * deltaScrollTop;
        //改变width和height值
        const deltaWidth = this.props.animeInfo.deltaWidth;
        const deltaHeight = this.props.animeInfo.deltaHeight;
        const curWidth = this.originalScrollWidth + deltaWidth * deltaScrollTop;
        const curHeight = this.originalHeight + deltaHeight * deltaScrollTop;
        this.setState({
          x : curX,
          y : curY,
          width : curWidth,
          height : curHeight,
        });
        this.usingMotion = true;
      }else if(this.props.canvasScrollTop < this.props.animeInfo.startScrollTop){
        this.setState({
          x : this.originalScrollX,
          y : this.originalScrollY,
          width : this.originalWidth,
          height : this.originalHeight,
        });
        this.usingMotion = false;
      }else{
        this.usingMotion = false;
      }

    }
    this.setState({curScrollTop : this.props.canvasScrollTop});
  }
  /*
  if(this.props.activeKey === this.props.index && (this.state.x !== this.originalScrollX || this.state.y !== this.originalScrollY)){
    this.setState({
      x : this.originalScrollX,
      y : this.originalScrollY,
    });
  }
  */

  //判断设置走马灯效果是否改变
  if(this.props.animeInfo.setMarquee !== this.state.curSetMarquee){
    //设置走马灯效果改变：判断打开还是关闭
    if(this.props.animeInfo.setMarquee === true && this.props.data !== null && typeof(this.props.data) !== 'undefined'){
      //打开走马灯效果
      //容器的宽度
      const containerWidth = this.state.width;
      //文字的宽度
      const textWidth = this.marqueeRef.scrollWidth;
      //计算多少span能填满div，然后把这些span都放进div中
      let textNum = containerWidth / textWidth;
      //文字内容
      const text = this.props.data.replace(/<p/g,'<span').replace(/p>/g,'span>');
      //这里刚刚将marqueeFillArr赋值，渲染的div其实还是空的，故textWidth=0，textNum=infinite，报错Invalid string length
      this.marqueeFillingArr = "";
      if(textNum < 1) textNum = 1;
      for(let i = 0;i<textNum;i++){
        this.marqueeFillingArr += text;
      }
      //设置走马灯定时器
      this.setMarqueeTimer(textWidth);
    }else{
      //关闭走马灯效果
      if(this.marqueeTimer){
        clearInterval(this.marqueeTimer);
      }
    }
    this.setState({
      curSetMarquee : this.props.animeInfo.setMarquee
    })
  }
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

//设置走马灯定时器
setMarqueeTimer(spanWidth){
  if(this.marqueeTimer){
    clearInterval(this.marqueeTimer);
  }
  if(this.props.animeInfo.setMarquee){
    this.marqueeTimer = setInterval(() => {
      this.setState(state=>({marqueeLeft : ((state.marqueeLeft - 1) % spanWidth)}));
    },10);
  }
}

handleMouseMove(event){
  //console.log("LayoutSetter - handleMouseMove");
  //鼠标移动到画布内，出现鼠标跟随
  //这里event.client指的是在整个屏幕中的坐标，不是以画布组件的左上角为原点，而是以屏幕左上角为原点
  //故直接用event.client设置鼠标跟随位置，跟随组件会始终与鼠标差一个画布左上角到屏幕左上角的差值
  //要想鼠标跟随控件直接跟随鼠标，必须用event.client减去画布左上角与屏幕左上角的差值作为鼠标跟随坐标
  if(this.props.vid === '' && this.props.pic === '' && !this.props.animeInfo.setMarquee){
    const boundingRect = ReactDOM.findDOMNode(this.divRef).getBoundingClientRect();
    this.setState({
        trailTop : (event.clientY - boundingRect.top),
        trailLeft : (event.clientX - boundingRect.left)
    })
    this.setState({showTrailer : true});

    //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），在有setter的局部跟随区域内防止触发画布部分的跟随事件
    event.cancelBubble = true;
    event.stopPropagation();
  }
  
}

handleMouseOut(){
  //console.log("LayoutSetter - handleMouseOut");

  this.setState({showTrailer : false});
}

//悬停回调函数
handleMouseEnter(){
  //console.log("LayoutSetter - handleMouseEnter");

  //缩放:记下原始宽高，改变state中的宽高
  if(this.props.animeInfo.hoverScalePicOnly !== true && this.props.activeKey !== this.props.index){
    //没选中：只有没选中时才有悬停缩放的效果，否则不好拖拽
    if(this.props.animeInfo.hoverScale !== 1){
    this.originalHeight = this.state.height;
    this.originalWidth = this.state.width;
    this.originalX = this.state.x;
    this.originalY = this.state.y;
    this.setState(state => ({
      height : (state.height) * this.props.animeInfo.hoverScale,
      width : state.width * this.props.animeInfo.hoverScale,
      x : state.x - (state.width * this.props.animeInfo.hoverScale - state.width) / 2,
      y : state.y - (state.height * this.props.animeInfo.hoverScale - state.height) / 2,
    }))
    this.usingMotion = true;
  }
  }
  
  this.props.handleMouseEnter(this.props.index);
}

//悬停图片缩放回调函数
handleMouseEnterPic(){
  //放大1.1倍
  if(this.props.animeInfo.hoverScalePicOnly === true && this.props.activeKey !== this.props.index){
    this.setState({
      picWidth : this.state.width * 1.1,
      picHeight : this.state.height * 1.1,
      picTop : -(this.state.width * 1.1 - this.state.width) / 2,
      picLeft : -(this.state.height * 1.1 - this.state.height) / 2,
    })
    
  }
}

//悬停取消图片缩放回调函数
handleMouseLeavePic(){
  if(this.props.animeInfo.hoverScalePicOnly === true && this.props.activeKey !== this.props.index){
    this.setState({
      picWidth : this.state.width,
      picHeight : this.state.height,
      picTop : 0,
      picLeft : 0,
    })
    
  }
}

//取消悬停回调函数
handleMouseLeave(){
  //console.log("LayoutSetter - handleMouseLeave");

  //恢复缩放
    //选没选中都要恢复：有可能缩放后才选中
    if(this.props.animeInfo.hoverScalePicOnly !== true && this.props.animeInfo.hoverScale !== 1){
    this.setState({
      height : this.originalHeight,
      width : this.originalWidth,
      x : this.originalX,
      y : this.originalY
    })
  }
  this.usingMotion = false;
  this.props.handleMouseLeave();
}

//在宽高/位置改变时发送setter信息
sendSetterInfo(){
  if(this.props.activeKey === this.props.index){
    if(this.state.width === this.originalWidth && this.state.height === this.originalHeight && this.state.x === this.originalX && this.state.y === this.originalY){
      const setterInfo = {
      //静态效果
      totalN : data.length,
      index: this.props.index,
      width: this.state.width,
      height: this.state.height,
      x: this.state.x,
      y: this.state.y,
      pic : this.props.pic,
      vid : this.props.vid,
      color: this.props.selectedSetterColor,  //颜色对象
      content: (typeof(this.props.data)=='undefined')?'':this.props.data,
      animeInfo: this.props.animeInfo
    };
    EventEmitter.emit("activeKeyInfo", setterInfo);
    }
    
  }else if(this.props.activeKey === null){
    if(this.state.width === this.originalWidth && this.state.height === this.originalHeight && this.state.x === this.originalX && this.state.y === this.originalY){
      EventEmitter.emit("activeKeyInfo", null);
    }

  }
  
}

    render(){
      /*
      if(this.props.activeKey === this.props.index){
        this.sendSetterInfo();
      }else if(this.props.activeKey === null){
        this.sendSetterInfo();
      }
      */
      /*
      if((this.props.activeKey === this.props.index 
          && (this.state.width === this.originalWidth 
          && this.state.height === this.originalHeight 
          && this.state.x === this.originalX 
          && this.state.y === this.originalY)
          || (this.props.animeInfo.hasScrollEffect
            && this.state.width === this.originalScrollWidth
            && this.state.height === this.originalScrollHeight
            && this.state.x === this.originalScrollX
            && this.state.y === this.originalScrollY))){
        //广播当前组件的信息
        let setterInfo = {
          //静态效果
          totalN : data.length,
          index: this.props.index,
          width: this.state.width,
          height: this.state.height,
          x: this.state.x,
          y: this.state.y,
          pic : this.props.pic,
          vid : this.props.vid,
          color: this.props.selectedSetterColor,  //颜色对象
          content: (typeof(this.props.data)=='undefined')?'':this.props.data,
          animeInfo: this.props.animeInfo
        };
        EventEmitter.emit("activeKeyInfo", setterInfo);
      }else if(this.props.activeKey === null){
        EventEmitter.emit("activeKeyInfo", null);
      }
      */
     this.sendSetterInfo();


      //确定setter的颜色和文字
      let contentBg = Color2Str(this.props.selectedSetterColor);
      let contentText = this.props.data;
      let contentPic = this.props.pic;
      const contentVid = this.props.vid;
      let contentArr = [];
      let firstNotNullContentKey = 0;
      if(this.props.animeInfo.changingInterval){
         contentArr = this.props.animeInfo.changingContentArr;
         firstNotNullContentKey = GetFirstNotNullKey(this.props.animeInfo.changingContentArr);
         if(firstNotNullContentKey < contentArr.length){
             //存在非空内容项：设置当前常变组件的颜色和文字和图片
             if(contentArr.length > 0 && this.contentIndex < contentArr.length && contentArr[this.contentIndex] !== null && typeof(contentArr[this.contentIndex]) !== 'undefined'){
                 contentBg = Color2Str(contentArr[this.contentIndex].activeKeyColor);
                 contentText = contentArr[this.contentIndex].activeKeyContent;
                 contentPic = contentArr[this.contentIndex].activeKeyPic;
             }else if(contentArr.length > 0 && this.contentIndex < contentArr.length && (contentArr[this.contentIndex] === null || typeof(contentArr[this.contentIndex]) === 'undefined')){
                 contentBg = Color2Str(contentArr[firstNotNullContentKey].activeKeyColor);
                 contentText = contentArr[firstNotNullContentKey].activeKeyContent;
                 contentPic = contentArr[firstNotNullContentKey].activeKeyPic;
                 this.contentIndex = firstNotNullContentKey;
             }
         } 
      }
      
      //setter的颜色：常变数组种当前项的颜色，如果常变数组为空，则是静态样式的颜色
      const setterColor = contentBg;
      //未被选中的样式：灰色实线边框
      const layoutSetterStyle = {
        //完全按富文本文字显示，不默认水平和垂直居中
        //display: "flex",
        //alignItems: "center",
        //justifyContent: "center",
        border: "solid 1px #ddd",
        background: setterColor,
        overflow : (this.props.animeInfo.setMarquee || this.props.vid !== '' || this.props.animeInfo.hoverScalePicOnly)? "hidden":"none",
        whiteSpace : this.props.animeInfo.setMarquee?"nowrap":"normal",
      }
      //被选中的样式：红色虚线边框
      const activeLayoutSetterStyle = {
        //display: "flex",
        //alignItems: "center",
        //justifyContent: "center",
        border: "dashed 2px red",
        background: setterColor,
        overflow : (this.props.animeInfo.setMarquee || this.props.vid !== '' || this.props.animeInfo.hoverScalePicOnly)? "hidden":"none",
        whiteSpace : this.props.animeInfo.setMarquee?"nowrap":"normal",
      }
      const divStyle = {
        height : "100%",
        width : "100%",
        overflow : "none",
        //background : "green"
      }

      //走马灯div的样式
      const marqueeStyle = {
            marginLeft : this.state.marqueeLeft,
            padding : 0,
            display : "inline-block",
            //background : "red",
      }

      const trailInfo = {
        trailingContentArr : this.props.animeInfo.trailingContentArr,
        trailingInterval : this.props.animeInfo.trailingInterval,
        trailerWidth : this.props.animeInfo.trailerWidth,
        trailerHeight : this.props.animeInfo.trailerHeight
      }

      /*
      const imgHoverScalePicOnlyStyle = {
        //transition: "all 2s ease 0",
        //transition: "width 2s ease 0",
        width : this.state.picWidth,
        //height : this.state.picHeight,
        top : this.state.picTop,
        left : this.state.picLeft,
        position : "absolute"
        
      }

      const imgNormalStyle = {
        //transition: "width 2s ease 0",
        width : "100%",  //"100%",
        top : 0,
        left : 0,
        position: "absolute",
      }
      */
     const innerBasicComponent = 
     <div>
     {contentVid !== ''? 
     <div style={{
       width : "100%",
       //height : 200
     }}>
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
         <source src={this.props.vid} type="video/mp4"/>
       </video>  
       </div>: null}

     {(contentVid === '' && contentPic !== '')? 
   <Motion 
    style={{
     width : spring(this.state.picWidth),  //"100%",
     height : spring(this.state.picHeight),
     top : spring(this.state.picTop),
     left : spring(this.state.picLeft),
     //position : "absolute"
   }}>
     {interpolatingStyle =>
     <div 
     /*
     style={{
       width : interpolatingStyle.width,
       height : interpolatingStyle.height,
       //transform: `translate3d(${interpolatingStyle.left}px, ${interpolatingStyle.top}px, 0)`,
       top : interpolatingStyle.top,
       left : interpolatingStyle.left,
       position: "absolute",
     }}*/>
     <img 
     style={{
       width : this.props.animeInfo.hoverScalePicOnly? interpolatingStyle.width: "100%",
       top : this.props.animeInfo.hoverScalePicOnly? interpolatingStyle.top: 0,
       left : this.props.animeInfo.hoverScalePicOnly? interpolatingStyle.left: 0,
       position: "absolute",
     }}
     //style={this.props.animeInfo.hoverScalePicOnly? imgHoverScalePicOnlyStyle : imgNormalStyle}
     //className={this.props.animeInfo.hoverScalePicOnly?'scaleComponent':''}
     onMouseDown={event => {event.preventDefault()}} 
     //onMouseMove={this.handleMouseMove}
     //onMouseOut={this.handleMouseOut}
     onMouseEnter={this.handleMouseEnterPic}
     onMouseLeave={this.handleMouseLeavePic}
     src={contentPic} 
     alt=" pic not here " 
     //width={this.state.picWidth}
     /></div>}
   </Motion> : null}
  
   
   
   {/* div的内容必须是this.props.data，不然单一内容时手动修改setter内容无效 */}
   {this.props.vid === '' && this.props.pic === ''? this.props.animeInfo.setMarquee? 
   <div ref={element => this.marqueeRef = element} style={marqueeStyle} dangerouslySetInnerHTML={{__html:(this.props.data !== null && typeof(this.props.data) !== 'undefined') ? this.props.data.replace(/<p/g,'<span').replace(/p>/g,'span>') + this.marqueeFillingArr : this.props.data}}></div>
   : <div  
     //dangerouslySetInnerHTML={{__html:contentText}}
     dangerouslySetInnerHTML={{__html:contentText}}
     style={divStyle}
     onMouseMove={this.handleMouseMove}
     onMouseOut={this.handleMouseOut}
     onMouseEnter={this.handleMouseEnter}
     onMouseLeave={this.handleMouseLeave}
     ref={element => this.divRef = element}>
     
     </div> : null}
     <Trailer
         top={this.state.trailTop}
         left={this.state.trailLeft}
         trailInfo={trailInfo}
         visibility={this.state.showTrailer}
     ></Trailer> 
     </div>

      if(this.usingMotion === true){
        //使用带motion的basicComponent
    this.basicComponent = 
    <Motion style={{
      width : spring(this.state.width), 
      height : spring(this.state.height),
      top : spring(this.state.y),
      left : spring(this.state.x)
    }}>
      {motionStyle => 
        <Rnd 
        style={this.props.activeKey==this.props.index?activeLayoutSetterStyle:layoutSetterStyle}
        //size={{ width: this.props.activeKey === this.props.index?this.originalWidth:this.state.width,  height: this.props.activeKey === this.props.index?this.originalHeight:this.state.height }}
        size={{ width: this.props.activeKey === this.props.index?this.originalWidth:motionStyle.width,  height: this.props.activeKey === this.props.index?this.originalHeight:motionStyle.height }}
        //position={{ x: this.props.activeKey === this.props.index?this.originalX:this.state.x, y: this.props.activeKey === this.props.index?this.originalY:this.state.y }}
        position={{ x: this.props.activeKey === this.props.index?this.originalX:motionStyle.left, y: this.props.activeKey === this.props.index?this.originalY:motionStyle.top }}
        onDragStart={() => {
          this.setState({
            x : this.originalX,
            y : this.originalY
          })
        }}
        onDragStop={(e, d) => { 
          this.setState({ x: d.x, y: d.y }, ()=>{
              this.sendSetterInfo();
          });
          this.originalX = d.x;
          this.originalY = d.y; 
          this.originalScrollX = d.x;
          this.originalScrollY = d.y;
          this.props.handleLayoutSetterPosChange(this.props.index, d.x, d.y);
        }}
        onResizeStart={() => {
          this.setState({
            width : this.originalWidth,
            height : this.originalHeight,
          })
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          let setterWidth = ref.style.width;
          let setterHeight = ref.style.height;
          if(typeof(ref.style.width) == "string"){
            let index = ref.style.width.lastIndexOf("p")
            setterWidth =parseFloat(ref.style.width.substring(0,index));
            index = ref.style.height.lastIndexOf("p");
            setterHeight = parseFloat(ref.style.height.substring(0,index));
        }
          this.setState({
            width: setterWidth,
            height: setterHeight,
            ...position,

            picWidth : setterWidth,
            picHeight : setterHeight,
          },()=>{
            this.sendSetterInfo();
          });
          this.originalHeight = setterHeight;
          this.originalWidth = setterWidth;
          this.props.handleLayoutSetterSizeChange(this.props.index, setterWidth, setterHeight);
      }}>

        {innerBasicComponent}
          
      </Rnd>
      }
      
      </Motion>
      }else{
        //使用不带motion的basicComponent
        this.basicComponent = 
        <Rnd 
        onMouseMove={this.handleMouseMove}
     onMouseOut={this.handleMouseOut}
     onMouseEnter={this.handleMouseEnter}
     onMouseLeave={this.handleMouseLeave}
        style={this.props.activeKey==this.props.index?activeLayoutSetterStyle:layoutSetterStyle}
        //size={{ width: this.props.activeKey === this.props.index?this.originalWidth:this.state.width,  height: this.props.activeKey === this.props.index?this.originalHeight:this.state.height }}
        size={{ width: this.state.width,  height: this.state.height }}
        //position={{ x: this.props.activeKey === this.props.index?this.originalX:this.state.x, y: this.props.activeKey === this.props.index?this.originalY:this.state.y }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStart={() => {
          this.setState({
            x : this.originalX,
            y : this.originalY
          })
        }}
        onDragStop={(e, d) => { 
          this.setState({ x: d.x, y: d.y }, ()=>{
              this.sendSetterInfo();
          });
          this.originalX = d.x;
          this.originalY = d.y; 
          this.originalScrollX = d.x;
          this.originalScrollY = d.y;

          this.props.handleLayoutSetterPosChange(this.props.index, d.x, d.y);
        }}
        onResizeStart={() => {
          this.setState({
            width : this.originalWidth,
            height : this.originalHeight,
          })
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          let setterWidth = ref.style.width;
          let setterHeight = ref.style.height;
          if(typeof(ref.style.width) == "string"){
            let index = ref.style.width.lastIndexOf("p")
            setterWidth =parseFloat(ref.style.width.substring(0,index));
            index = ref.style.height.lastIndexOf("p");
            setterHeight = parseFloat(ref.style.height.substring(0,index));
        }
          this.setState({
            width: setterWidth,
            height: setterHeight,
            ...position,

            picWidth : setterWidth,
            picHeight : setterHeight,
          },()=>{
            this.sendSetterInfo();
          });
          this.originalHeight = setterHeight;
          this.originalWidth = setterWidth;

          this.props.handleLayoutSetterSizeChange(this.props.index, setterWidth, setterHeight);
      }}>

        {innerBasicComponent}
          
      </Rnd>
      }
    
    
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
          <div>
            {this.revealComponent}
            </div>
        );
    }
}
export default LayoutSetter;
