import React from 'react'

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
            let wcanvas = 1024;
            let wwidth = document.body.clientWidth;
            this.setState({wrate : wwidth / wcanvas});
        
        //向后端发出请求，请求所有setter的信息
        fetch('http://127.0.0.1:8081/setterInfo')
        .then(res => res.json())
        .then(data => {
            console.log(data["totalN"]);
            this.setState({
                totalSetter: data["totalN"],
                setters : data["setters"]
            })
        })
     .catch(e => console.log('错误:', e))
     
    }
    render(){
        //所有setter的样式数组
        const divStyles = [];
        //使用从后端得到的数据设置所有setter的样式
        for(let i = 0;i < this.state.totalSetter;i++){
            const setter = this.state.setters[i];
            console.log(setter.index);
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
    }
        return (
            //按样式动态生成setter
            <div>
            {this.state.setters.map((item,index) => item === undefined?null:
                <div style={divStyles[index]} dangerouslySetInnerHTML={{__html:this.state.setters[index].content}}></div>)
            }
            </div>
        );
    }
}
export default Preview;