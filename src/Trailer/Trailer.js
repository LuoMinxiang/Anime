import React from 'react'
import {Color2Str} from '../Utils/Color2Str'

//跟随组件

class Trailer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //当前props的计时器时间间隔：用于在componentDidUpdata中判断props是否更新
            curInterval : this.props.trailInfo?this.props.trailInfo.trailingInterval:0,
            //当前内容项索引
            index : 0,
            //跟随组件的位置
            top : this.props.top,
            left : this.props.left
        }
        //跟随组件定时器
        this.timer = null;
        //跟随组件内容数组
        this.trailingContentArr = this.props.trailInfo?this.props.trailInfo.trailingContentArr:[];
        //跟随组件定时器时间间隔
        this.trailingInterval = this.props.trailInfo?this.props.trailInfo.trailingInterval:0;
        //跟随组件宽高
        this.trailerWidth = this.props.trailInfo?this.props.trailInfo.trailerWidth:0;
        this.trailerHeight = this.props.trailInfo?this.props.trailInfo.trailerHeight:0

        //函数绑定
        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.setTimer = this.setTimer.bind(this);
    }

    
    componentDidUpdate(prevProps, prevState){
        //每次props或者state更新后都会调用
        if(this.props.trailInfo && this.props.trailInfo.trailingInterval !== this.state.curInterval){
            //state没变，更新的是props：将新的props值赋给state
        this.setState({
            curInterval : this.props.trailInfo?this.props.trailInfo.trailingInterval:0,
            index : 0,
        })
        //重新设置定时器
        this.setTimer();
        }

        
      }
      

    componentDidMount(){
        this.setTimer();
    }

    //设置定时器
    setTimer(){
        if(this.timer){
            clearInterval(this.timer);
        }
        if(this.props.trailInfo && this.props.trailInfo.trailingInterval !== 0){
            this.timer = setInterval(this.handleIndexChange, this.props.trailInfo.trailingInterval * 100);

        }
    }

    handleIndexChange(){
        //定时器回调函数：循环递增跟随组件当前内容项索引
        let index = this.state.index;
        index++;
        if(index >= (this.props.trailInfo?this.props.trailInfo.trailingContentArr:[]).length){
            index = 0;
        }
        this.setState({index : index});
    }
    componentWillUnmount(){
        if(this.timer){
            clearInterval(this.timer);
        }
    }
    render(){
       const contentArr = this.props.trailInfo?this.props.trailInfo.trailingContentArr:[];
        const divStyle = {
            visibility : this.props.visibility?"visible":"hidden",
            position:"absolute",
            top : this.props.top + 10,
            left : this.props.left + 10,
            width : this.props.trailInfo?this.props.trailInfo.trailerWidth:0,
            height : this.props.trailInfo?this.props.trailInfo.trailerHeight:0,
            background : contentArr.length>0?Color2Str(contentArr[this.state.index<contentArr.length?this.state.index:0].activeKeyColor):"transparent"
        }
        return (
            <div 
                dangerouslySetInnerHTML={{__html:contentArr.length>0?contentArr[this.state.index<contentArr.length?this.state.index:0].activeKeyContent:""}}
                style={divStyle}>
            </div>
        )
    }
}
export default Trailer;