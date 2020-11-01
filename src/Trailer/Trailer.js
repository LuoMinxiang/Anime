import React from 'react'
import {Color2Str} from '../Utils/Color2Str'
import {GetFirstNotNullKey} from '../Utils/GetFirstNotNullKey'

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
        if(this.props.trailInfo){
            if(this.state.index < this.props.trailInfo.trailingContentArr.length){
                //还有非空的内容项：递增this.state.index
                let index = this.state.index;
                //由于内容数组更新时不调用componentDidUpdate，故不能在全空时即使将this.firstNotNullContentKey置为内容数组长度，可能造成计时器回调函数死循环
                //防止死循环计数器：index+1时count+1，count到内容数组的长度时将index置为内容数组的长度并退出循环
                let count = 0;
                index++;
                count++;
                if(index >= this.props.trailInfo.trailingContentArr.length){
                    //递增出界时回到0
                    index = 0;
                }
                while(index < this.props.trailInfo.trailingContentArr.length && this.props.trailInfo.trailingContentArr[index] === null){
                    //跳过为空的内容项
                    index++;
                    count++
                    if(index >= this.props.trailInfo.trailingContentArr.length){
                        //递增出界时回到0
                        index = 0;
                    }
                    if(count >= this.props.trailInfo.trailingContentArr.length){
                        index = this.props.trailInfo.trailingContentArr.length;
                        break;
                    }
                }
                this.setState({index : index});
            }
            
        }               
    }
    componentWillUnmount(){
        if(this.timer){
            clearInterval(this.timer);
        }
    }
    render(){        
        //删除chip后不调用计时器函数避免
        //求跟随组件的背景：如果firstNotNullContentKey为trailingContentArr的长度，则没有非空的内容项，设置颜色为透明，设置内容为空字符串
        //删除chip后componentDidUpdate不调用：可能this.state.index为空内容项的下标
        let contentBg = "transparent";
        let contentText = "";
        let contentPic = '';
        let contentArr = [];
        let firstNotNullContentKey = 0;
        if(this.props.trailInfo){
            contentArr = this.props.trailInfo.trailingContentArr;
            firstNotNullContentKey = GetFirstNotNullKey(this.props.trailInfo.trailingContentArr);
            if(firstNotNullContentKey < contentArr.length){
                //存在非空内容项：设置当前跟随组件的颜色和文字
                if(contentArr.length > 0 && contentArr[this.state.index] !== null && typeof(contentArr[this.state.index]) !== 'undefined'){
                    contentBg = Color2Str(contentArr[this.state.index<contentArr.length?this.state.index:firstNotNullContentKey].activeKeyColor);
                    contentText = contentArr[this.state.index<contentArr.length?this.state.index:firstNotNullContentKey].activeKeyContent;
                    contentPic = contentArr[this.state.index<contentArr.length?this.state.index:firstNotNullContentKey].activeKeyPic;
                }else if(contentArr.length > 0 && (contentArr[this.state.index] === null || typeof(contentArr[this.state.index]) === 'undefined')){
                    //当前内容下标对应内容为空：设置为第一个非空内容项
                    contentBg = Color2Str(contentArr[firstNotNullContentKey].activeKeyColor);
                    contentText = contentArr[firstNotNullContentKey].activeKeyContent;
                    contentPic = contentArr[firstNotNullContentKey].activeKeyPic;
                    this.setState({index : firstNotNullContentKey});
                }
            } 
        }
        
        const divStyle = {
            visibility : this.props.visibility?"visible":"hidden",
            position:"absolute",
            top : this.props.top + 10, 
            left : this.props.left + 10,
            width : this.props.trailInfo?this.props.trailInfo.trailerWidth:0,
            height : this.props.trailInfo?this.props.trailInfo.trailerHeight:0,
            background : contentBg
        }

        const imgStyle = {
            visibility : this.props.visibility?"visible":"hidden",
            position:"absolute",
            top : this.props.top + 10, 
            left : this.props.left + 10,
            display : "block",
            width : this.props.trailInfo?this.props.trailInfo.trailerWidth:0,
            height : this.props.trailInfo?this.props.trailInfo.trailerHeight:0,
        }

        let trailer = null;

        if(contentPic !== ''){
            //是图片跟随组件：返回img
            trailer = <img src={contentPic} style={imgStyle}></img>
        }else{
            //是文字跟随组件：返回div
            trailer = <div 
                dangerouslySetInnerHTML={{__html:contentText}}
                style={divStyle}>
            </div>
        }
        return (
            trailer
        )
    }
}
export default Trailer;