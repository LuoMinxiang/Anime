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
        };

        //是否在各个动效的设置模式：判断能否切换setter
        this.isChangeSettingMode = false;
        this.isTrailSettingMode = false;
        this.isHoverSettingMode = false;
        //常变动效设置模式下将要切换的选中组件
        this.keyToBeSelected = null;
        //悬停出现组件将要设置的位置和宽高
        this.hoverSetterTopToBeSet = 0;
        this.hoverSetterLeftToBeSet = 0;
        this.hoverSetterWidthToBeSet = 0;
        this.hoverSetterHeightToBeSet = 0;

        //画布组件的ref
        this.canvasRef = null;
        //被拖拽/缩放的悬停出现组件的ref
        this.hoverLayoutSetterRef = null;

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

    }
    componentDidMount(){
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
            //初始化动效设置数据
            let animeInfoArray = [...this.state.setterAniInfoArray];
            animeInfoArray.push({
              //出现方式
              reveal : "",
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
              //悬停缩放比例：大于1是放大，小于1是缩小
              hoverScale : 1,
              //悬停出现内容数组
              hoverContentArr : []
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
            animeInfoArray[this.state.activeKey].reveal = msg.reveal;
            animeInfoArray[this.state.activeKey].hoverScale = msg.hoverScale;
            msg.hoverContentArr.map((item, index) => {
              if(item !== null && typeof(item) !== 'undefined'){
                //将hoverSetter中设置的每一项悬停出现组件的颜色和文字合并到webCanvas维护的设置好位置和宽高的悬停出现信息数组中
                let hoverContent = animeInfoArray[this.state.activeKey].hoverContentArr[index];
                hoverContent.name = item.name;
                hoverContent.activeKeyColor = item.activeKeyColor;
                hoverContent.activeKeyContent = item.activeKeyContent;
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
          if(!this.isChangeSettingMode || !this.isHoverSettingMode){
            //不在修改常变动效模式：能取消选中
            this.setState({activeKey : null});
        }
    }

    //点击layoutSetter：切换选中
    handleSetterClick(key,e){
      if(this.state.activeKey !== null && key !== this.state.activeKey && (this.isChangeSettingMode || this.isHoverSettingMode || this.isTrailSettingMode)){        
        //切换选中组件并且当前处于常变动效设置模式：跳出对话框提示如果切换会丢失未应用的修改
        this.setState({open : true});
        this.keyToBeSelected = key;

        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
        e.cancelBubble = true;
        e.stopPropagation();
      }else{
        //点击布局组件时选中该组件
        this.setState({activeKey : key});
        //阻止事件冒泡（子组件直接处理事件，父组件不会再处理事件），防止触发画布部分的点击事件
        e.cancelBubble = true;
        e.stopPropagation();
      }
      
    }

    //点击hoverLayoutSetter：切换hoverLayoutSetter的选中
    handleHoverSetterClick(key,e){
      //alert("webcanvas - handleHoverSetterClick key = " + key)
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
            {this.state.LayoutSetterArray.map((item,index) => item === undefined?null:
            <div key={index} onClick={(e) => this.handleSetterClick(index,e)}>
              <LayoutSetter 
                  index={index} 
                  onKeyDown={this.handleKeyDown} 
                  activeKey={getActiveKey()} 
                  selectedSetterColor={getSelectedSetterColor(index)} 
                  data={this.state.setterContentArray[index]}
                  animeInfo={this.state.setterAniInfoArray[index]}
                  handleMouseEnter={this.handleMouseEnter}
                  handleMouseLeave={this.handleMouseLeave}>
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
                  handleDragStop={this.handleHoverSetterPositionChange}
                  handleResizeStop={this.handleHoverSetterSizeChange}
                  text={item.activeKeyContent}>
              </HoverLayoutSetter>
            </div>
            ):null}
            <Trailer
                top={this.state.trailTop}
                left={this.state.trailLeft}
                trailInfo={this.state.canvasAnimInfo}
                visibility={(this.state.canvasAnimInfo && this.state.showTrailer)}
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
              The changes you made to the current selected setter has not been applied yet.
              If you select another setter or cancel selecting, those changes won't be saved.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => this.handleSelectAnywayClose(e)} color="primary">
              I don't care. Select/Cancel select anyway
            </Button>
            <Button onClick={(e) => this.handleSaveClose(e)} color="primary">
              Go back and save
            </Button>
          </DialogActions>
        </Dialog> 
        </div>);
    }
}

export default WebCanvas;