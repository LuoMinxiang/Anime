import React from 'react'
import './ImageLoader.css'
import ImageClip from './ImageClip'
import { ActiveKeyInfoContext } from '../Dashboard/listItems'
class ImageLoader extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            stage: 0,
            curSetterPic : this.props.setterPic,
            pic:this.props.setterPic,
        }
    }

    componentDidUpdate(prevProps, prevState){
      if(this.props.setterPic !== this.state.curSetterPic){
        this.setState({
          curSetterPic : this.props.setterPic,
          pic : this.props.setterPic
        })
      }
    }

    render(){

        let {stage, pic}=this.state;
        return <main className="mainBox">
    
          {/* 点击上传图片 */}
          <div className ="baseInfo" style={{
            display: stage === 0?'block':'none'
          }}>
    
    
            {/* 图片框 */}
            <div className ="imgBox" 
              onClick = {ev =>{
                this.setState({ stage : 1 })
              }}>
              <img src={pic} alt ="" />
              <p>选择图片</p>
            </div>
          </div >
    
    
          {/* 图片上传与处理框 */}
          <div className="handleBox" style={{
            display: stage === 0 ?'none':'block'
          }}>
            <div className="returnBtn" >
              <span 
              onClick={ev =>{
              this.setState({ stage : 0 })
            }}>返回</span>
            </div>
                <ImageClip 
                          change={this.change}
                          setterWidth={this.props.setterWidth}
                          setterHeight={this.props.setterHeight}
                          setterPic={this.props.setterPic}
                          withClip={this.props.withClip}
                        ></ImageClip>
          </div>
        </main>
      }
    
      change = imagedata => {
        this.setState({
          stage: 0,
          pic: imagedata
        });

        this.props.handleImageUploaded(imagedata);
      }
    
}

export default ImageLoader;