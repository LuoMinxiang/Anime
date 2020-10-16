import React from 'react'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';
import {Color2Str} from '../Utils/Color2Str'

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
            changingIndex : []
        }
        //常变计时器数组
        this.changingTimers = [];
        //this.changingIndex = 0;
        this.handleChanging = this.handleChanging.bind(this);
    }
    
    componentDidMount(){
        //当预览窗口改变时，按比例改变setter的位置和大小
        window.onresize = function(){
            //画布宽为1024
            let wcanvas = 1024;
            let wwidth = document.body.clientWidth;
            this.setState({wrate : wwidth / wcanvas});
        }.bind(this)
            //初始化预览窗口和画布的宽度比
            let wcanvas = 1200;
            let wwidth = document.body.clientWidth;
            this.setState({wrate : wwidth / wcanvas});
        
        //向后端发出请求，请求所有setter的信息
        //fetch('http://127.0.0.1:8081/setterInfo')
        //json-server测试地址
        
        fetch('http://127.0.0.1:3000/setterInfo')
        .then(res => res.json())
        .then(data => {
            //console.log(data["setters"][0].totalN);
            
            //this.setState({totalSetter : 2})
//为每个setter设置对应的常变动效
     for(let i = 0;i < data["totalN"];i++){
        const setter = data["setters"][i];
        if(setter){
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
        const basicComponent = <div style={setterStyle} dangerouslySetInnerHTML={{__html:setterText}}></div>
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

            

        return (
            //按样式动态生成setter
            <div>
            {this.state.setters.map((item,index) => typeof(item) === undefined?null:
                animatedSetters[index])
            }
            </div>
        );
    }
}
export default Preview;