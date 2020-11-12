import React from 'react'
import EventEmitter from '../Utils/EventEmitter'
import LayoutSetter from '../LayoutSetter/LayoutSetter.js'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { ExploreOffOutlined } from '@material-ui/icons';
import Trailer from '../Trailer/Trailer'
import ReactDOM from 'react-dom'
import HoverLayoutSetter from '../HoverLayoutSetter/HoverLayoutSetter'
import ScrollLayoutSetter from '../ScrollLayoutSetter/ScrollLayoutSetter'
import Tooltip from '@material-ui/core/Tooltip';
//画布组件

class WebCanvas extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          //每增加一个setter，push入一个1，用来计算setter的数量
          LayoutSetterArray : [], 
          //被选中的setter的编号
          activeKey : null,
          //按编号排列的setter背景颜色集合
          setterColorArray : [],
          //按编号排列的setter内容集合
          setterContentArray : [],

          //按编号排列的setter图片集合
          setterPicArray : [],

          //按编号排列的setter视频集合
          setterVidArray : [],

          //按编号排列的setter动效信息集合
          setterAniInfoArray : [],

          //是否打开提示框
          open : false,

          //画布跟随动画信息对象
          canvasAnimInfo : null,
          //是否显示跟随
          showTrailer : false,
          //跟随组件的坐标
          trailTop : 0,
          trailLeft : 0,
          //被选中的hoverSetter下标
          selectedHoverIndex : null,
          //当前悬停的LayoutSetter的index
          hoveredSetterKey : null,
          //下滚动效位置设置组件可见性
          scrollLayoutSetterVisibility : "hidden",
          //下滚区域将要设置的起始和结束
          startScrollTopToBeSet : 0,
          endScrollTopToBeSet : 0,
          //当前画布的scrollTop
          curScrollTop : 0,
          //当前画布的高度
          curCanvasHeight : 712,
          //当前图片url：用于判断传入的图片参数有无变化
          curImgUploaded : '',
          //当前视频url：用于判断传入的视频url有无变化
          curVidUploaded : '',
        };

        //设置动效模式
        this.isChangeSettingMode = false;
        this.isTrailSettingMode = false;
        this.isHoverSettingMode = false;
        this.isScrollSettingMode = false;
        //常变动效设置模式下将要切换的选中组件
        this.keyToBeSelected = null;
        //悬停出现组件将要设置的位置和宽高
        this.hoverSetterTopToBeSet = 0;
        this.hoverSetterLeftToBeSet = 0;
        this.hoverSetterWidthToBeSet = 0;
        this.hoverSetterHeightToBeSet = 0;
        //set过下滚动效的边界
        this.hasSetStartScrollTop = false;
        this.hasSetEndScrollTop = false;

        //画布组件的ref
        this.canvasRef = null;
        //被拖拽/缩放的悬停出现组件的ref
        this.hoverLayoutSetterRef = null;

        //当前setter信息
        this.activeKeySetterInfo = null;
        //是否传递setter信息
        this.sendInfo = false;

        //当前是否保存
        this.save = false;

        //按编号排序的setter位置和大小信息集合
        this.setterPosSizeArray = [];

        this.handleSetterClick = this.handleSetterClick.bind(this);
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSelectAnywayClose = this.handleSelectAnywayClose.bind(this);
        this.handleSaveClose = this.handleSaveClose.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleHoverSetterSizeChange = this.handleHoverSetterSizeChange.bind(this);
        this.handleHoverSetterPositionChange = this.handleHoverSetterPositionChange.bind(this);
        this.handleHoverSetterClick = this.handleHoverSetterClick.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleScrollSetterPositionChange = this.handleScrollSetterPositionChange.bind(this);
        this.handleHasSetScrollEffect = this.handleHasSetScrollEffect.bind(this);
        this.handleScrollSetterSizeChange = this.handleScrollSetterSizeChange.bind(this);
        this.handleLayoutSetterPosChange = this.handleLayoutSetterPosChange.bind(this);
        this.handleLayoutSetterSizeChange = this.handleLayoutSetterSizeChange.bind(this);
    }
    componentDidMount(){
      //从后端请求数据结构
      //json-server测试地址
      //fetch('http://127.0.0.1:3000/webcanvasInfo')
      fetch('http://127.0.0.1:8081/webcanvasInfo/0')
      .then(res => res.json())
      .then(data => {
          //设置请求回来的数据结构
          this.setterPosSizeArray = data.setterPosSizeArray;
          console.log("typeof(data.LayoutSetterArray) = " + typeof(data.LayoutSetterArray))
          this.setState({
            LayoutSetterArray : data.LayoutSetterArray,
            setterColorArray : data.setterColorArray,
            setterContentArray : data.setterContentArray,
            setterPicArray : data.setterPicArray,
            setterVidArray : data.setterVidArray,
            setterAniInfoArray : data.setterAniInfoArray,
          });
      })
      .catch(e => console.log('错误:', e)) 

      //json-server测试地址
      //fetch('http://127.0.0.1:3000/canvasInfo')
      fetch('http://127.0.0.1:8081/canvasInfo/0')
      .then(res => res.json())
      .then(data => {
          //设置请求回来的数据结构
          let visibility = false;
          if(data.trailingContentArr.length !== 0){
            visibility = true;
          }
          this.setState({
            canvasAnimInfo : data,
            showTrailer : visibility,
          });
      })
      .catch(e => console.log('错误:', e)) 

      

      //新增布局组件函数
        this.emitter1 = EventEmitter.addListener("ClickedAddLayoutSetter",(msg) => {
            // add a LayoutSetter on click
            let arr = [...this.state.LayoutSetterArray];
            arr.push(1);
            this.setState({
                LayoutSetterArray : arr});
            //增加新增setter的颜色，初始为透明
            let colorArr = [...this.state.setterColorArray];
            colorArr.push("transparent");
            this.setState({setterColorArray : colorArr});
            //增加新增setter的默认图片，初始为空字符串
            let picArr = [...this.state.setterPicArray];
            picArr.push("");
            this.setState({setterPicArray : picArr});
            //增加新增setter的默认视频，初始为空字符串
            let vidArr = [...this.state.setterVidArray];
            vidArr.push("");
            this.setState({setterVidArray : vidArr});
            //增加新增setter的默认位置和大小，初始位置为（0，0），初始宽高为320 * 200
            let posSizeArr = [...this.setterPosSizeArray];
            posSizeArr.push({
              x : 0,
              y : 0,
              width : 320,
              height : 200,
            });
            this.setterPosSizeArray = posSizeArr;
            //初始化动效设置数据
            let animeInfoArray = [...this.state.setterAniInfoArray];
            animeInfoArray.push({
              //出现方式
              reveal : "",
              //是否设置走马灯效果
              setMarquee : false,
              //常变动效内容/样式数组
              changingContentArr : [],
              //常变动效定时器
              changingInterval : 0,
              //跟随动效内容/样式数组
              trailingContentArr : [],
              //跟随动效定时器
              trailingInterval : 0,
              //跟随组件宽高
              trailerWidth : 0,
              trailerHeight : 0,
              //悬停缩放是否只缩放图片，而固定框的大小
              hoverScalePicOnly : false,
              //悬停缩放比例：大于1是放大，小于1是缩小
              hoverScale : 1,
              //悬停出现内容数组
              hoverContentArr : [],
              //下滚动效数据
              //下滚动效：初始scrollTop、终止scrollTop、初始{x,y}，终止{x,y}、x方向单位增量、y方向单位增量
              startScrollTop : 0,
              endScrollTop : 0,
              startXY : {x:0, y:0},
              endXY : {x:-1, y:-1},
              deltaX : 0,
              deltaY : 0,
              startSize : {width:0, height:0},
              endSize : {width:-1, height:-1},
              deltaWidth : 0,
              deltaHeight : 0,
              //判断是否设置过下滚动效：方便preview中放进数组里在onscroll中遍历
              hasScrollEffect : false,
            });
            this.setState({
              setterAniInfoArray : animeInfoArray
            })
        })

        //改变选中布局组件颜色函数
        this.emitter2 = EventEmitter.addListener("SelectedSetterColorChanged",(msg) => {
          if(this.isChangeSettingMode === false){
              //只有不在常变动效设置模式下时才能改变setter的颜色
              // change the color of the selected layout setter
              let colorArr = [...this.state.setterColorArray];
              colorArr[this.state.activeKey] = msg;
              this.setState({
                setterColorArray : colorArr
              })
          }
            
        })

        //改变选中布局组件内容函数
        this.emitter3 = EventEmitter.addListener("setSelectedSetterContent",(msg)=>{
          if(this.isChangeSettingMode === false){
            //按了富文本编辑器的ok之后设置setter中的内容
            let contentArray = [...this.state.setterContentArray];
            contentArray[this.state.activeKey] = msg;
            this.setState({
              setterContentArray : contentArray
            })
          }
          
        })

        //监听删除键，将选中的setter删除
        document.addEventListener("keydown", this.handleKeyDown);

        //设置选中布局组件的出现动效
        this.emitter4 = EventEmitter.addListener("getAnim",(msg)=>{
          //在动效设置区选好了动效后设置setter中的内容
          if(this.state.activeKey != null){
            let animeInfoArray = [...this.state.setterAniInfoArray];
            animeInfoArray[this.state.activeKey].trailingInterval = msg.trailingInterval;
            animeInfoArray[this.state.activeKey].trailerWidth = msg.trailerWidth;
            animeInfoArray[this.state.activeKey].trailerHeight = msg.trailerHeight;
            animeInfoArray[this.state.activeKey].changingInterval = msg.changingInterval;
            animeInfoArray[this.state.activeKey].setMarquee = msg.setMarquee;
            animeInfoArray[this.state.activeKey].reveal = msg.reveal;
            animeInfoArray[this.state.activeKey].hoverScalePicOnly = msg.hoverScalePicOnly;
            animeInfoArray[this.state.activeKey].hoverScale = msg.hoverScale;
            animeInfoArray[this.state.activeKey].startScrollTop = msg.startScrollTop;
            animeInfoArray[this.state.activeKey].endScrollTop = msg.endScrollTop;
            animeInfoArray[this.state.activeKey].startXY.x = msg.startXY.x;
            animeInfoArray[this.state.activeKey].startXY.y = msg.startXY.y;
            animeInfoArray[this.state.activeKey].endXY.x = msg.endXY.x;
            animeInfoArray[this.state.activeKey].endXY.y = msg.endXY.y;
            animeInfoArray[this.state.activeKey].startSize.width = msg.startSize.width;
            animeInfoArray[this.state.activeKey].startSize.height = msg.startSize.height;
            animeInfoArray[this.state.activeKey].endSize.width = msg.endSize.width;
            animeInfoArray[this.state.activeKey].endSize.height = msg.endSize.height;
            animeInfoArray[this.state.activeKey].deltaX = (msg.endXY.x - msg.startXY.x) / (msg.endScrollTop - msg.startScrollTop);
            animeInfoArray[this.state.activeKey].deltaY = (msg.endXY.y - msg.startXY.y) / (msg.endScrollTop - msg.startScrollTop);
            animeInfoArray[this.state.activeKey].deltaWidth = (msg.endSize.width - msg.startSize.width) / (msg.endScrollTop - msg.startScrollTop);
            animeInfoArray[this.state.activeKey].deltaHeight = (msg.endSize.height - msg.startSize.height) / (msg.endScrollTop - msg.startScrollTop);
            animeInfoArray[this.state.activeKey].hasScrollEffect = msg.hasScrollEffect;
            msg.hoverContentArr.map((item, index) => {
              if(item !== null && typeof(item) !== 'undefined'){
                //将hoverSetter中设置的每一项悬停出现组件的颜色和文字合并到webCanvas维护的设置好位置和宽高的悬停出现信息数组中
                let hoverContent = animeInfoArray[this.state.activeKey].hoverContentArr[index];
                hoverContent.name = item.name;
                hoverContent.activeKeyColor = item.activeKeyColor;
                hoverContent.activeKeyContent = item.activeKeyContent;
                hoverContent.activeKeyPic = item.activeKeyPic;
                animeInfoArray[this.state.activeKey].hoverContentArr[index] = hoverContent;
              }else{
                animeInfoArray[this.state.activeKey].hoverContentArr[index] = null;
              }
            })

            msg.changingContentArr.map((item, index) => {
              if(item !== null && typeof(item) !== 'undefined'){
                //将hoverSetter中设置的每一项悬停出现组件的颜色和文字合并到webCanvas维护的设置好位置和宽高的悬停出现信息数组中
                animeInfoArray[this.state.activeKey].changingContentArr[index] = {};
                animeInfoArray[this.state.activeKey].changingContentArr[index].name = item.name;
                animeInfoArray[this.state.activeKey].changingContentArr[index].activeKeyColor = item.activeKeyColor;
                animeInfoArray[this.state.activeKey].changingContentArr[index].activeKeyContent = item.activeKeyContent;
                animeInfoArray[this.state.activeKey].changingContentArr[index].activeKeyPic = item.activeKeyPic;
              }else{
                animeInfoArray[this.state.activeKey].changingContentArr[index] = null;
              }
            })

            msg.trailingContentArr.map((item, index) => {
              if(item !== null && typeof(item) !== 'undefined'){
                //将hoverSetter中设置的每一项悬停出现组件的颜色和文字合并到webCanvas维护的设置好位置和宽高的悬停出现信息数组中
                animeInfoArray[this.state.activeKey].trailingContentArr[index] = {};
                animeInfoArray[this.state.activeKey].trailingContentArr[index].name = item.name;
                animeInfoArray[this.state.activeKey].trailingContentArr[index].activeKeyColor = item.activeKeyColor;
                animeInfoArray[this.state.activeKey].trailingContentArr[index].activeKeyContent = item.activeKeyContent;
                animeInfoArray[this.state.activeKey].trailingContentArr[index].activeKeyPic = item.activeKeyPic;
              }else{
                animeInfoArray[this.state.activeKey].trailingContentArr[index] = null;
              }
            })
            this.setState({
              setterAniInfoArray : animeInfoArray
            })
          }
        })

        //开始/结束设置常变动效
        this.emitter5 = EventEmitter.addListener("isChangingSettingOn",(isExpanded) => {
          this.isChangeSettingMode = isExpanded;
        })

        //监听是否处于跟随特效设置模式
        this.emitter51 = EventEmitter.addListener("isTrailingSettingOn",(isExpanded) => {
          this.isTrailSettingMode = isExpanded;
        })
        //监听是否处于悬停特效设置模式
        this.emitter52 = EventEmitter.addListener("isHoverSettingOn",(isExpanded) => {
          this.isHoverSettingMode = isExpanded;
        })

        //监听是否处于下滚特效设置模式
        this.emitter53 = EventEmitter.addListener("isScrollSettingOn",(isExpanded) => {
          this.isScrollSettingMode = isExpanded;
          if(this.state.activeKey !== null){
            if(isExpanded){
            this.setState({scrollLayoutSetterVisibility : "visible"});
          }else if(!this.state.setterAniInfoArray[this.state.activeKey].hasScrollEffect){
            this.setState({scrollLayoutSetterVisibility : "hidden"});
          }
          }
          
          
        })

        //监听画布跟随动效
        this.emitter6 = EventEmitter.addListener("getCanvasAnim",(canvasAnimInfo) => {
          //判断当前有无选中的setter：如果有就不管画布跟随；如果没有就设置画布跟随
          if(this.state.activeKey === null){
          this.setState({
            canvasAnimInfo : canvasAnimInfo
          });
        }
      }
        )

        //监听悬停出现组件的添加
        this.emitter7 = EventEmitter.addListener("addHoverSetter",() => {
          //判断当前有无选中的setter：如果有就在当前选中setter的动效设置数据的悬停出现内容数组中添加新项；如果没有就不管
          if(this.state.activeKey !== null){
            //当前有选中的setter：在对应动效设置数据的悬停出现数组中添加新项
            const animeInfoArray = [...this.state.setterAniInfoArray];
            let activeKeyHoverContentArr = [...animeInfoArray[this.state.activeKey].hoverContentArr];
            let index = activeKeyHoverContentArr.length;
            activeKeyHoverContentArr[index] = {}
            activeKeyHoverContentArr[index].width = 320;  
            activeKeyHoverContentArr[index].height = 200;
            activeKeyHoverContentArr[index].top = 0;
            activeKeyHoverContentArr[index].left = 0;
            activeKeyHoverContentArr[index].activeKeyColor = null;
            activeKeyHoverContentArr[index].activeKeyContent = "";
            activeKeyHoverContentArr[index].name = "default name";
            animeInfoArray[this.state.activeKey].hoverContentArr = [...activeKeyHoverContentArr];
          this.setState({
            setterAniInfoArray : animeInfoArray,
            selectedHoverIndex : index
          });
        }
      }
        )

        //监听下滚区域上界的设置
        this.emitter8 = EventEmitter.addListener("hasSetStartScrollTop", startScrollTop => {
          this.setState({
            startScrollTopToBeSet : startScrollTop
          });
          this.hasSetStartScrollTop = true;
        })

        //监听下滚区域下界的设置
        this.emitter9 = EventEmitter.addListener("hasSetEndScrollTop", endScrollTop => {
          this.setState({
            endScrollTopToBeSet : endScrollTop
          });
          this.hasSetEndScrollTop = true;
        })
    }

    componentDidUpdate(prevProps, prevState){
      //监听传入的画布长度
      if(this.props.pageLength !== this.state.curCanvasHeight){
        //画布高度改变
        //将传入的画布长度上传至数据库canvasLength接口
        //将画布高度信息上传至数据库
        /*
        const canvasLengthobj = {canvasHeight : this.props.pageLength};
        const body = JSON.stringify(canvasLengthobj);
        //json-server测试接口
        fetch('http://127.0.0.1:3000/canvasLength',{
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
          //console.log(data);
        })
        .catch(e => console.log('错误:', e))
        */
       this.setState({curCanvasHeight : this.props.pageLength});
      }
      if(this.props.scrollTop !== this.state.curScrollTop){
        //画布下滚幅度改变
        this.setState({curScrollTop : this.props.scrollTop});
      }
      //判断上传的图片有无变化
      if(this.props.imgUploaded !== this.state.curImgUploaded){
        this.setState({
          curImgUploaded : this.props.imgUploaded
        });
        if(this.state.activeKey !== null){
          //当前有选中的setter：将新上传的图片放入当前选中的setter在图片数组中对应的位置
          let picArr = [...this.state.setterPicArray];
          picArr[this.state.activeKey] = this.props.imgUploaded;
          this.setState({setterPicArray : picArr});
        }
        //console.log("webCanvas - new img uploaded! img = " + this.props.imgUploaded);
      }

      //判断上传的视频有无变化
      if(this.props.vidUploaded !== this.state.curVidUploaded){
        this.setState({
          curVidUploaded : this.props.vidUploaded
        });
        if(this.state.activeKey !== null){
          //当前有选中的setter：将新上传的视频放入当前选中的setter在视频数组中对应的位置
          let vidArr = [...this.state.setterVidArray];
          vidArr[this.state.activeKey] = this.props.vidUploaded;
          this.setState({setterVidArray : vidArr});
        }
      }

      //判断是否需要将数据结构上传到后端
      if(this.props.save !== this.save){
        if(this.props.save === true){
          //将数据结构上传到后端
          const data = {
            LayoutSetterArray: this.state.LayoutSetterArray,
            setterColorArray : this.state.setterColorArray,
            setterContentArray : this.state.setterContentArray,
            setterPicArray : this.state.setterPicArray,
            setterVidArray : this.state.setterVidArray,
            setterAniInfoArray : this.state.setterAniInfoArray,
            setterPosSizeArray : this.setterPosSizeArray,
          };
          let body = JSON.stringify(data);
          //json-server测试接口
          //fetch('http://127.0.0.1:3000/webcanvasInfo',{
            fetch('http://127.0.0.1:8081/webcanvasInfo/0', {
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
            //console.log(data);
          })
          .catch(e => console.log('错误:', e))

          //将画布高度信息上传至数据库
          const canvasLengthobj = {canvasHeight : this.props.pageLength};
          body = JSON.stringify(canvasLengthobj);
          //json-server测试接口
          //fetch('http://127.0.0.1:3000/canvasLength',{
            fetch('http://127.0.0.1:8081/canvasLength/0', {
              method:'post',
              mode:'cors',
              headers:{
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Accept':'application/json, text/plain'
              },
              body: body
          })
          .catch(e => console.log('错误:', e))
        
        
        //将全局跟随信息上传至后端 
        const canvasInfo = this.state.canvasAnimInfo;
        body = JSON.stringify(canvasInfo);
        //json-server测试接口
        //fetch('http://127.0.0.1:3000/canvasInfo',{
        fetch('http://127.0.0.1:8081/canvasInfo/0', {
          method:'post',
          mode:'cors',
          headers:{
              'Content-Type': 'application/json;charset=UTF-8',
              'Accept':'application/json, text/plain'
          },
          body: body
      })
      .catch(e => console.log('错误:', e))
        }

        this.save = this.props.save;
        this.props.handleSaveFinished();
      }
    }

    handleMouseMove(event){
          //鼠标移动到画布内，出现鼠标跟随
          //这里event.client指的是在整个屏幕中的坐标，不是以画布组件的左上角为原点，而是以屏幕左上角为原点
          //故直接用event.client设置鼠标跟随位置，跟随组件会始终与鼠标差一个画布左上角到屏幕左上角的差值
          //要想鼠标跟随控件直接跟随鼠标，必须用event.client减去画布左上角与屏幕左上角的差值作为鼠标跟随坐标
          //通过ReactDOM.findDOMNode(ref)（相当于js当中的document.getElementById之类的）.getBoundingClientRect获取画布元素的绝对位置
          //boundingRect.top是画布元素左上角相对屏幕的top，left是画布元素左上角left相对屏幕的left
          const boundingRect = ReactDOM.findDOMNode(this.canvasRef).getBoundingClientRect();
          //console.log("boundingRect.top = " + boundingRect.top + ", boundingRect.left = " + boundingRect.left);
          this.setState({
              trailTop : (event.clientY - boundingRect.top),
              trailLeft : (event.clientX - boundingRect.left)
          })
          this.setState({showTrailer : true});
  }

  handleMouseOut(){
    this.setState({showTrailer : false});
  }

    canvasStyle = {
        width : "100%",
        height : "100%",
    };
    handleCanvasClick(){
        //点击非布局组件的画布部分时取消对任何组件的选中
        //在设置常变和悬停动效模式下不能取消选中
          if(!this.isChangeSettingMode && !this.isHoverSettingMode && !this.isScrollSettingMode){
            //不在修改常变动效模式：能取消选中
            this.setState({
              activeKey : null,
              scrollLayoutSetterVisibility : "hidden"
            });
            this.activeKeySetterInfo = null;
            //EventEmitter.emit("activeKeyInfo", this.activeKeySetterInfo);
        }
    }

    //点击layoutSetter：切换选中
    handleSetterClick(key,e){
      if(this.state.activeKey !== null && key !== this.state.activeKey && (this.isChangeSettingMode || this.isHoverSettingMode || this.isTrailSettingMode || this.isScrollSettingMode)){        
        //切换选中组件并且当前处于常变动效设置模式：跳出对话框提示如果切换会丢失未应用的修改
        this.setState({open : true});
        this.keyToBeSelected = key;

        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
        e.cancelBubble = true;
        e.stopPropagation();
      }else{
        //点击布局组件时选中该组件
        this.setState({
          activeKey : key,
          startScrollTopToBeSet : this.state.setterAniInfoArray[key].startScrollTop,
          endScrollTopToBeSet : this.state.setterAniInfoArray[key].endScrollTop,
        });
        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
        e.cancelBubble = true;
        e.stopPropagation();
        if(this.state.setterAniInfoArray[key].hasScrollEffect){
          this.setState({scrollLayoutSetterVisibility : "visible"});
        }else{
          this.setState({scrollLayoutSetterVisibility : "hidden"});
        }
      }
      this.hasSetStartScrollTop = false;
      this.hasSetEndScrollTop = false;
    }

    //点击hoverLayoutSetter：切换hoverLayoutSetter的选中
    handleHoverSetterClick(key,e){
        //点击布局组件时选中该组件
        this.setState({selectedHoverIndex : key});
        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
        e.cancelBubble = true;
        e.stopPropagation();  
    }

    handleSelectAnywayClose(e){
      //关闭对话框并切换选中组件
      this.setState({open : false});
      this.setState({activeKey : this.keyToBeSelected});
      if(this.keyToBeSelected !== null && this.isScrollSettingMode){
        //在下滚动效设置模式切换到一个setter上：若该setter设置过下滚动效，则显示下滚动效设置setter
        this.setState({scrollLayoutSetterVisibility : "visible"});
      }
      //对话框也在画布上！所以也要阻止事件冒泡
      //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
      e.cancelBubble = true;
      e.stopPropagation();
    }

    handleSaveClose(e){
      //关闭对话框并不切换选中组件
      this.setState({open : false});
      //对话框也在画布上！所以也要阻止事件冒泡
      //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
      e.cancelBubble = true;
      e.stopPropagation();
    }

    handleKeyDown(e){
      //监听键盘
        switch(e.keyCode){
          case 46:
            //del删除键按下
            if(typeof(this.state.activeKey)!=undefined){
              //按下删除键时有setter被选中：删除该setter
              let setterArr = [...this.state.LayoutSetterArray];
              let colorSetterArr = [...this.state.setterColorArray];
              let contentSetterArr = [...this.state.setterContentArray];
              let animeSetterArr = [...this.state.setterAniInfoArray];
              //从setter信息数组中删除该setter
              delete setterArr[this.state.activeKey];
              //从setter颜色数组中删除该setter
              delete colorSetterArr[this.state.activeKey];
              //从setter内容数组中删除该setter
              delete contentSetterArr[this.state.activeKey];
              //从setter动效数组中删除该setter
              delete animeSetterArr[this.state.activeKey];
              //广播被删除的setter的索引
              EventEmitter.emit("SelectedSetterDeleted", this.state.activeKey);
              this.setState({
                LayoutSetterArray : setterArr,
                setterColorArray : colorSetterArr,
                setterContentArray : contentSetterArr,
                setterAniInfoArray : animeSetterArr,
                hoveredSetterKey : null,
                activeKey : null
              })
            this.state.activeKey = null;
          }
            break;
          default:
            break;
        }
    }

    //设置hover出现组件宽高的组件设置完成的回调函数
    handleHoverSetterSizeChange(e, direction, ref, d){
      //判断当前有无选中的setter：如果有就在当前选中setter的动效设置数据的悬停出现内容数组中添加新项/修改原项；如果没有就不管
      if(this.state.activeKey !== null){
        //当前有选中的setter：在对应动效设置数据的悬停出现数组中添加新项/修改原项
        const index = parseInt(ref.id);
        const animeInfoArray = [...this.state.setterAniInfoArray];
        let activeKeyHoverContentArr = [...animeInfoArray[this.state.activeKey].hoverContentArr];
        activeKeyHoverContentArr[index].width += d.width;
        activeKeyHoverContentArr[index].height += d.height;
        animeInfoArray[this.state.activeKey].hoverContentArr = [...activeKeyHoverContentArr];
      this.setState({
        setterAniInfoArray : animeInfoArray,
        selectedHoverIndex : index
      });
    }
    }

    //设置hover出现组件位置的组件设置完成的回调函数
    handleHoverSetterPositionChange(e, d){
      //判断当前有无选中的setter：如果有就在当前选中setter的动效设置数据的悬停出现内容数组中添加新项/修改原项；如果没有就不管
      if(this.state.activeKey !== null){
        //当前有选中的setter：在对应动效设置数据的悬停出现数组中添加新项/修改原项
        const index = parseInt(e.target.id);
        const animeInfoArray = [...this.state.setterAniInfoArray];
        let activeKeyHoverContentArr = [...animeInfoArray[this.state.activeKey].hoverContentArr];
        activeKeyHoverContentArr[index].top = d.y;
        activeKeyHoverContentArr[index].left = d.x;
        animeInfoArray[this.state.activeKey].hoverContentArr = [...activeKeyHoverContentArr];
      this.setState({
        setterAniInfoArray : animeInfoArray
      });
    }
    }

    //悬停在LayoutSetter上的回调函数
    handleMouseEnter(index){
      //index是被悬停的LayoutSetter的下标
      this.setState({hoveredSetterKey : index});
    }

    //鼠标移出被悬停的LayoutSetter的回调函数
    handleMouseLeave(){
      this.setState({hoveredSetterKey : null});
    }

    //设置下滚最终位置设置组件的拖拽回调函数
    handleScrollSetterPositionChange(e,d){
      //判断当前有无选中的setter：如果有就修改当前选中setter的动效设置数据的下滚最终位置endXY；如果没有就不管
      if(this.state.activeKey !== null){
        //当前有选中的setter：修改对应动效设置数据的下滚最终位置endXY
        const animeInfoArray = [...this.state.setterAniInfoArray];
        let curXY = {
          x : d.x,
          y : d.y
        }
        animeInfoArray[this.state.activeKey].endXY = curXY;
        this.setState({
          setterAniInfoArray : animeInfoArray
        });
      }

    }

    //设置下滚最终大小设置组件的缩放回调函数
    handleScrollSetterSizeChange(width, height){
      //判断当前有无选中的setter：如果有就修改当前选中setter的动效设置数据的下滚最终位置endSize；如果没有就不管
      if(this.state.activeKey !== null){
        //当前有选中的setter：修改对应动效设置数据的下滚最终位置endSize
        const animeInfoArray = [...this.state.setterAniInfoArray];
        let curSize = {
          width : width,
          height : height
        }
        animeInfoArray[this.state.activeKey].endSize = curSize;
        this.setState({
          setterAniInfoArray : animeInfoArray
        });
      }
    }

    //下滚动效终止位置设置组件拖拽停止：当前setter已设置过下滚动效
    handleHasSetScrollEffect(){
      if(this.state.activeKey !== null){
        if(!this.state.setterAniInfoArray[this.state.activeKey].hasScrollEffect){
          //没设置过下滚动效：改成设置过
          let arr = [...this.state.setterAniInfoArray];
          arr[this.state.activeKey].hasScrollEffect = true;
          this.setState({setterAniInfoArray : arr});
        }
      }
    }

    //layoutSetter拖拽到终止位置的回调函数
    handleLayoutSetterPosChange(index, x, y){
      //let posSizeArr = [...this.setterPosSizeArray];
      //let setterPosInfo = posSizeArr[index];
      this.setterPosSizeArray[index].x = x;
      this.setterPosSizeArray[index].y = y;
      //posSizeArr[index] = setterPosInfo;

    }

    //layoutSetter缩放到终止大小的回调函数
    handleLayoutSetterSizeChange(index, width, height){
      this.setterPosSizeArray[index].width = width;
      this.setterPosSizeArray[index].height = height;
    }


    render(){
   //根据setter的编号值取出指定setter的颜色
    const getSelectedSetterColor = (index) => {
      return this.state.setterColorArray[index];
    }
    //获取当前被选中的setter
    const getActiveKey = () => {
      return this.state.activeKey;
    }

    const hoverContainerStyle = {
      background : "green"
    }

    const lengthDivStyle = {
      background : "red",
      height: "0.1px",
      width: "0.11px",
      position : "absolute",
      top : this.props.pageLength,
      left : 0
    }

    //设置下滚动效区域分割线的开始位置、结束位置、可见性、样式
    //只有选中setter并且(设置过下滚动效设置状态 或者 在scrollSetter中set过分割线)时显示下滚动效分割线
    let startLineVisibility = false;
    let endLineVisibility = false;
    if(this.state.activeKey !== null){
      if(this.state.setterAniInfoArray[this.state.activeKey].hasScrollEffect){
        //设置过下滚动效：区域分割线和下滚动效位置确定组件都可见，且都显示在已设置好的位置
        startLineVisibility = true;
        endLineVisibility = true;
      }
      if(this.hasSetEndScrollTop){
        endLineVisibility = true;
      }
      if(this.hasSetStartScrollTop){
        startLineVisibility = true;
      }
      
    }


    const startScrollTopLine = {
      visibility : startLineVisibility?"visible":"hidden",
      width : "100%",
      borderTop : "dashed 3px orange",
      position : "absolute",
      top : this.state.startScrollTopToBeSet,  //activeStartScrollTop,
      left : 0
    }

    const endScrollTopLine = {
      visibility : endLineVisibility?"visible":"hidden",
      width : "100%",
      borderTop : "dashed 3px blue",
      position : "absolute",
      top : this.state.endScrollTopToBeSet,  //activeEndScrollTop,
      left : 0
    } 
    
        return (
          //LayoutSetter直接作为子组件时不能响应自定义的onClick事件（可能是组件自身的onClick优先级较高）。
          //只能在LayoutSetter外面套一层div（不占空间的一条线），才能响应点击。
          //父组件div必须定义宽高，不然只有一条线，无法响应点击事件。
        <div 
          ref={element => this.canvasRef = element}
          style={this.canvasStyle} 
          onClick={this.handleCanvasClick}
          onMouseMove={this.handleMouseMove}
          onMouseOut={this.handleMouseOut}>
            {/* 控制画布组件高度的看不见div */}
            <div style={lengthDivStyle}></div>

            {/* 设置下滚动效时起始和终止scrollTop线 */}
            <Tooltip title="The start of scrolling effect" placement="top">
            <div style={startScrollTopLine}></div>
            </Tooltip>
            <Tooltip title="The end of scrolling effect" placement="bottom">
            <div style={endScrollTopLine}></div>
            </Tooltip>

            {this.state.LayoutSetterArray.map((item,index) => item === undefined?null:
            <div key={index} onClick={(e) => this.handleSetterClick(index,e)}>
              <LayoutSetter 
                  index={index} 
                  onKeyDown={this.handleKeyDown} 
                  activeKey={getActiveKey()} 
                  selectedSetterColor={getSelectedSetterColor(index)} 
                  data={this.state.setterContentArray[index]}
                  pic={this.state.setterPicArray[index]}
                  vid={this.state.setterVidArray[index]}
                  animeInfo={this.state.setterAniInfoArray[index]}
                  handleMouseEnter={this.handleMouseEnter}
                  handleMouseLeave={this.handleMouseLeave}
                  canvasScrollTop={this.state.curScrollTop}
                  handleLayoutSetterPosChange={this.handleLayoutSetterPosChange}
                  handleLayoutSetterSizeChange={this.handleLayoutSetterSizeChange}
                  x={this.setterPosSizeArray[index].x}
                  y={this.setterPosSizeArray[index].y}
                  width={this.setterPosSizeArray[index].width}
                  height={this.setterPosSizeArray[index].height}
                  >
              </LayoutSetter>
            </div>)}
            {this.state.activeKey!==null?this.state.setterAniInfoArray[this.state.activeKey].hoverContentArr.map((item,index) => typeof(item) === 'undefined' || item === null?null:
            <div style={hoverContainerStyle} onClick={(e) => this.handleHoverSetterClick(index,e)}>
              <HoverLayoutSetter 
                  index={index} 
                  color={item.activeKeyColor}
                  activeKey={this.state.selectedHoverIndex} 
                  width={item.width}
                  height={item.height}
                  x={item.left}
                  y={item.top}
                  pic={item.activeKeyPic}
                  handleDragStop={this.handleHoverSetterPositionChange}
                  handleResizeStop={this.handleHoverSetterSizeChange}
                  text={item.activeKeyContent}>
              </HoverLayoutSetter>
            </div>
            ):null}
            {this.state.hoveredSetterKey !== null?this.state.setterAniInfoArray[this.state.hoveredSetterKey].hoverContentArr.map((item,index) => typeof(item) === 'undefined' || item === null?null:
            <div style={hoverContainerStyle} onClick={(e) => this.handleHoverSetterClick(index,e)}>
              <HoverLayoutSetter 
                  index={index} 
                  color={item.activeKeyColor}
                  activeKey={this.state.selectedHoverIndex} 
                  width={item.width}
                  height={item.height}
                  x={item.left}
                  y={item.top}
                  pic={item.activeKeyPic}
                  handleDragStop={this.handleHoverSetterPositionChange}
                  handleResizeStop={this.handleHoverSetterSizeChange}
                  text={item.activeKeyContent}>
              </HoverLayoutSetter>
            </div>
            ):null}

            <ScrollLayoutSetter
              visibility={this.state.scrollLayoutSetterVisibility}
              onDrag={this.handleScrollSetterPositionChange}
              onResize={this.handleScrollSetterSizeChange}
              //onDragStop={this.handleHasSetScrollEffect}
            ></ScrollLayoutSetter>
            
            
            <Trailer
                top={this.state.trailTop}
                left={this.state.trailLeft}
                trailInfo={this.state.canvasAnimInfo}
                visibility= {(this.state.canvasAnimInfo && this.state.showTrailer)}
            ></Trailer>
            <Dialog
          open={this.state.open}
          keepMounted
          onClose={this.handleDialogClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{"Set Change Content"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              你还有未应用的动效设置，取消选中或切换会导致这些设置丢失！
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => this.handleSelectAnywayClose(e)} color="primary">
              取消/切换
            </Button>
            <Button onClick={(e) => this.handleSaveClose(e)} color="primary">
              去应用设置
            </Button>
          </DialogActions>
        </Dialog> 
        </div>);
    }
}

export default WebCanvas;