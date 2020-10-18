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
        };

        this.isChangeSettingMode = false;
        //常变动效设置模式下将要切换的选中组件
        this.keyToBeSelected = null;
        //画布组件的ref
        this.canvasRef = null;

        this.handleSetterClick = this.handleSetterClick.bind(this);
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSelectAnywayClose = this.handleSelectAnywayClose.bind(this);
        this.handleSaveClose = this.handleSaveClose.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
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
            //animeInfoArray[this.state.activeKey] = msg;
            animeInfoArray[this.state.activeKey].trailingContentArr = [...msg.trailingContentArr];
            animeInfoArray[this.state.activeKey].trailingInterval = msg.trailingInterval;
            animeInfoArray[this.state.activeKey].trailerWidth = msg.trailerWidth;
            animeInfoArray[this.state.activeKey].trailerHeight = msg.trailerHeight;
            animeInfoArray[this.state.activeKey].changingInterval = msg.changingInterval;
            animeInfoArray[this.state.activeKey].reveal = msg.reveal;
            animeInfoArray[this.state.activeKey].changingContentArr = [...msg.changingContentArr];
            this.setState({
              setterAniInfoArray : animeInfoArray
            })
          }
        })

        //开始/结束设置常变动效
        this.emitter5 = EventEmitter.addListener("isChangingSettingOn",(isExpanded) => {
          this.isChangeSettingMode = isExpanded;
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
          //console.log("event.clientY : " + event.clientY + ", event.clientX : " + event.clientX)
  }

  handleMouseOut(){
    this.setState({showTrailer : false});
  }

    canvasStyle = {
        width : "100%",
        height : "100%",
        //background : "red"
    };
    handleCanvasClick(){
        //点击非布局组件的画布部分时取消对任何组件的选中
        //在设置常变动效模式下不能取消选中
          if(!this.isChangeSettingMode){
            //不在修改常变动效模式：能取消选中
            this.setState({activeKey : null});
        }
    }
    handleSetterClick(key,e){
      if(this.state.activeKey !== null && key !== this.state.activeKey && this.isChangeSettingMode){        
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
              this.setState({
                LayoutSetterArray : setterArr,
                setterColorArray : colorSetterArr,
                setterContentArray : contentSetterArr,
                setterAniInfoArray : animeSetterArr
              })
              //广播被删除的setter的索引
              EventEmitter.emit("SelectedSetterDeleted", this.state.activeKey);
            this.state.activeKey = null;
          }
            break;
          default:
            break;
        }
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
            <Trailer
                top={this.state.trailTop}
                left={this.state.trailLeft}
                trailInfo={this.state.canvasAnimInfo}
                visibility={(this.state.canvasAnimInfo && this.state.showTrailer)}
            ></Trailer>
            {this.state.LayoutSetterArray.map((item,index) => item === undefined?null:
            <div key={index} onClick={(e) => this.handleSetterClick(index,e)}>
              <LayoutSetter 
                  index={index} 
                  onKeyDown={this.handleKeyDown} 
                  activeKey={getActiveKey()} 
                  selectedSetterColor={getSelectedSetterColor(index)} 
                  data={this.state.setterContentArray[index]}
                  animeInfo={this.state.setterAniInfoArray[index]}>
              </LayoutSetter>
            </div>)}
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