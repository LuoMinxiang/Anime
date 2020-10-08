import React from 'react'
import EventEmitter from '../Utils/EventEmitter'
import LayoutSetter from '../LayoutSetter/LayoutSetter.js'

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
          setterAniInfoArray : []
        };
        this.handleSetterClick = this.handleSetterClick.bind(this);
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    componentDidMount(){
      //新增布局组件函数
        this.emitter = EventEmitter.addListener("ClickedAddLayoutSetter",(msg) => {
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
              reveal : ""
            });
            this.setState({
              setterAniInfoArray : animeInfoArray
            })
        })

        //改变选中布局组件颜色函数
        this.emitter = EventEmitter.addListener("SelectedSetterColorChanged",(msg) => {
            // change the color of the selected layout setter
            let colorArr = [...this.state.setterColorArray];
            colorArr[this.state.activeKey] = msg;
            this.setState({
              setterColorArray : colorArr
            })
        })

        //改变选中布局组件内容函数
        this.emitter = EventEmitter.addListener("setSelectedSetterContent",(msg)=>{
          //按了富文本编辑器的ok之后设置setter中的内容
          let contentArray = [...this.state.setterContentArray];
          contentArray[this.state.activeKey] = msg;
          this.setState({
            setterContentArray : contentArray
          })
        })

        //监听删除键，将选中的setter删除
        document.addEventListener("keydown", this.handleKeyDown);

        //设置选中布局组件的动效
        this.emitter = EventEmitter.addListener("getAnim",(msg)=>{
          //alert("getAnim!!! msg.reveal = " + msg.reveal);
          //在动效设置区选好了动效后设置setter中的内容
          if(this.state.activeKey != null){
            let animeInfoArray = [...this.state.setterAniInfoArray];
            animeInfoArray[this.state.activeKey] = msg;
            this.setState({
              setterAniInfoArray : animeInfoArray
            })
            //演示加上的动效：将这个
          }
        })
    }
    canvasStyle = {
        width : "100%",
        height : "100%",
    };
    handleCanvasClick(){
        //点击非布局组件的画布部分时取消对任何组件的选中
        this.activeKey = null;
        this.setState({activeKey : null})
    }
    handleSetterClick(key,e){
      //点击布局组件时选中该组件
      this.activeKey = key;
      this.setState({activeKey : key});
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
              //从setter信息数组中删除该setter
              delete setterArr[this.state.activeKey];
              //从setter颜色数组中删除该setter
              delete colorSetterArr[this.state.activeKey];
              //从setter内容数组中删除该setter
              delete contentSetterArr[this.state.activeKey];
              this.setState({
                LayoutSetterArray : setterArr,
                setterColorArray : colorSetterArr,
                setterContentArray : contentSetterArr
              })
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
        <div style={this.canvasStyle} onClick={this.handleCanvasClick}>
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
        </div>);
    }
}

export default WebCanvas;