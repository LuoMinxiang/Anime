import React from 'react'
import Zoom from 'react-reveal/Zoom';
import Fade from 'react-reveal/Fade';

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
            wrate : (1500/1024)
        }
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
            //alert("width = " + document.body.clientWidth + ", height = " + document.documentElement.clientHeight);
        
        //向后端发出请求，请求所有setter的信息
        //fetch('http://127.0.0.1:8081/setterInfo')
        //json-server测试地址
        
        fetch('http://127.0.0.1:3000/setterInfo')
        .then(res => res.json())
        .then(data => {
            console.log(data["setters"][0].totalN);
            
            //this.setState({totalSetter : 2})

            this.setState({
                totalSetter: data["totalN"],
                setters : data["setters"]
            }, ()=>{
                console.log("setState done!");
            })
            
           //this.setState({totalSetter : 2})
            console.log(this.state.setters);
            //this.setState({totalSetter : 0})
        })
     .catch(e => console.log('错误:', e))
     //this.setState({totalSetter : 2})
    }
    render(){
        //所有setter的样式数组
        const divStyles = [];

        //加了动效的setter数组
        const animatedSetters = [];

        //使用从后端得到的数据设置所有setter的样式和动效
        for(let i = 0;i < this.state.totalSetter;i++){
            const setter = this.state.setters[i];

            //当setter的宽高值是带单位px的字符串时，去掉单位并转换为浮点数
            if(typeof(setter.width) == "string"){
                let index = setter.width.lastIndexOf("p")
                setter.width =parseFloat(setter.width.substring(0,index));
                index = setter.height.lastIndexOf("p");
                setter.height = parseFloat(setter.height.substring(0,index));
            }

            //console.log(setter.index);
            //设置该setter的样式
            const setterStyle = {         
                width: setter.width * this.state.wrate,
                height: setter.height * this.state.wrate,
                left: setter.x * this.state.wrate,
                top: setter.y * this.state.wrate,
                background: setter.color,
                position : "absolute",
                display : "flex",
                flexDirection: 'column',
                justifyContent:'center',
        };
        divStyles.push(setterStyle);
        //设置setter的动效并将setter放进数组里
        const reveal = setter.animInfo.reveal;
        const basicComponent = <div style={setterStyle} dangerouslySetInnerHTML={{__html:setter.content}}></div>
        let revealComponent = basicComponent;
        switch(reveal){
            case "Zoom":
              revealComponent = <Zoom>{basicComponent}</Zoom>;
              break;
            case "Fade":
              revealComponent = <Fade>{basicComponent}</Fade>
              break;
          }
        animatedSetters.push(revealComponent);
    }

        return (
            //按样式动态生成setter
            <div>
            {this.state.setters.map((item,index) => item === undefined?null:
                animatedSetters[index])
            }
            </div>
        );
    }
}
export default Preview;

/**
 * <div>
            {this.state.setters.map((item,index) => item === undefined?null:
                <div style={divStyles[index]} dangerouslySetInnerHTML={{__html:this.state.setters[index].content}}></div>)
            }
            </div>
 */