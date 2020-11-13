import React from 'react';

//图片上传与截取组件

class ImageClip extends React.Component{
    constructor(props){
        super(props);

        //显示图片的窗口为500*500
        //截取窗口的宽高为setter的宽高，如果setter的宽高大于显示图片的窗口宽高，则
        //截取窗口的位置在正中间
        let W = 500,    //MH MW调为组件尺寸
            H = 500,
            MW = 320,
            MH = 200,
            ML = (W  - MW) / 2,
            MT = (H - MH) / 2;
        this.state = {
            W, H, MW, MH, ML, MT,
            S: false,
            curSetterPic : this.props.setterPic,
            curWithClip : true,
        }

        //高超出高度范围时的缩小比例
        this.hrate = 1;
        //宽超出宽度范围时的缩小比例
        //如果宽高都超出范围，高就按宽的缩小比例缩小（宽对齐，高适应）
        this.wrate = 1;

        //clip截取框的实际宽高
        this.clipWidth = 320;
        this.clipHeight = 200;


    }

    componentDidUpdate(){
        if(this.props.setterWidth !== this.state.MW || this.props.setterHeight !== this.state.MH){
            this.wrate = 1;
            this.hrate = 1;
            //console.log("imageClip - componentDidUpdate - this.props.setterWidth = " + this.props.setterWidth + ", this.props.setterHeight = " + this.props.setterHeight)
            if(this.props.setterWidth > this.state.W && this.props.setterHeight <= this.state.H){
                //宽超出范围，高没有超出范围
                //求宽的缩小比例
                this.wrate = this.state.W / this.props.setterWidth;
                this.hrate = 1;
            }else if(this.props.setterWidth <= this.state.W && this.props.setterHeight > this.state.H){
                //高超出范围，宽没有超出范围
                //求高的缩小比例
                this.wrate = 1;
                this.hrate = this.state.H / this.props.setterHeight;
            }else if(this.props.setterWidth > this.state.W && this.props.setterHeight > this.state.H){
                //宽高都超出范围
                if(this.props.setterWidth >= this.props.setterHeight){
                    //宽大于高
                    //求宽的缩小比例：宽对齐显示图片窗口的宽，高按宽的比例缩小
                    this.wrate = this.state.W / this.props.setterWidth;
                    this.hrate = 0;
                }else{
                    //高大于宽
                    //求高的缩小比例：高对齐显示图片窗口的高，宽按高的比例缩小
                    this.wrate = 0;
                    this.hrate = this.state.H / this.props.setterHeight
                }
                
            }
            this.setState({
                MW : this.props.setterWidth,
                MH : this.props.setterHeight,
            })
            this.clipHeight = this.props.setterHeight;
            this.clipWidth = this.props.setterWidth;

            //调整截取框的宽高使其落在图片显示窗口中
            if(this.wrate !== 1 || this.hrate !== 1){
                //宽或高超出范围
                if(this.hrate === 0 || this.wrate !== 1){
                    //宽高都超出范围且宽大于高：宽置为显示图片窗口的宽，高按宽的缩小比例缩小
                    //or
                    //宽超出范围，高没有超出范围：宽置为显示图片窗口的宽，高按宽的缩小比例缩小
                    this.clipWidth = this.state.W;
                    this.clipHeight *= this.wrate;
                }else if(this.wrate === 0 || this.hrate !== 1){
                    //宽高都超出范围且高大于宽：高置为显示图片窗口的高，宽按高的缩小比例缩小
                    //or
                    //高超出范围，宽没有超出范围：高置为显示图片窗口的高，宽按高的缩小比例缩小
                    this.clipWidth *= this.hrate;
                    this.clipHeight = this.state.H;
                }
            }
        }

        //判断传入setter图片的变化
        if(this.props.setterPic !== this.state.curSetterPic){
            this.setState({
                curSetterPic : this.props.setterPic,
            });
        }

        if(this.props.withClip !== this.state.curWithClip){
            this.setState({
                curWithClip : this.props.withClip,
            })
        }
    }
    render(){
        let { W, H, MW, MH, MT, ML, S } = this.state;

        if(this.state.curWithClip){
            //裁剪
            MW = this.clipWidth;
            MH = this.clipHeight;
            ML = (W  - MW) / 2;
            MT = (H - MH) / 2;
        }else{
            //不裁剪：上传的图片是啥样就是啥样
            MW = 0;
            MH = 0;
            ML = 0;
            MT = 0;
        }
        

        return <div className="clipImageBox" style={{
            //width : "520px",
            //height : "550px",
            background : "blue"}}>
            <div className="canvasBoxDiv"
                style={{
                    background : "green",
                    width : 500,
                    height : 500,
                    position : "relative"
                }}
                onTouchStart={ev => {
                    let point = ev.changedTouches[0];
                    this.startX = point.clientX;
                    this.startY = point.clientY;
                }}
                onTouchMove={ev => {
                    let point = ev.changedTouches[0];
                    let changeX = point.clientX - this.startX,
                        changeY = point.clientY - this.startY;
                    if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
                        this.IL += changeX;
                        this.IT += changeY;
                        this.drawImage();
                        this.startX = point.clientX;
                        this.startY = point.clientY;
                    }
                }}
                onMouseDown={this.fnDown.bind(this)}
                onMouseUp={this.fnUp.bind(this)}
            >

                {/* 图片容器canvas */}
                <canvas className="canvasBox"
                    ref = {x => this._canvas = x}
                    width = {W}
                    height = {H}
                    style={{
                        //background : "red",
                        position : 'relative',
                    }}
                >
                    
                </canvas>

                   {/* 裁剪区域 */}
                <div className="mark"
                    style = {{
                        width: MW,
                        height: MH,
                        left: ML,
                        top: MT,
                        position: 'absolute',                       
                        display: S ? 'block' : 'none',
                        background:'#7F778899',
                    }}></div>

               
            </div>
            <div className="buttonBox">
                <input  type ="file" accept="image/*" className="file"
                     ref = {x => this._file =x}
                     onChange = {this.fileChange}
                />

                <button className="choose"
                    style={{ display: 'none' }}  //隐藏重复按钮
                    onClick={ev => {
                        this._file.click();
                }}>选择图片</button>


                <button onClick={ev => {
                    if (!this.img) return;
                    this.IW += 10;
                    this.IH += 10;
                    this.drawImage();
                }}
                >放大</button>

                <button onClick={ev => {
                    if (!this.img) return;
                    this.IW -= 10;
                    this.IH -= 10;
                    this.drawImage();
                }}
                >缩小</button>
                
                <button className="submit" onClick={ev => {
                    if (!this.img) return;
                    if(this.state.curWithClip){
                        //裁剪
                        let imagedata = this.ctx.getImageData(ML, MT, MW, MH),
                            canvas2 = document.createElement('canvas'),
                            ctx2 = canvas2.getContext('2d');
                        canvas2.width = MW;
                        canvas2.height = MH;
                        ctx2.putImageData(imagedata, 0, 0, 0, 0, MW, MH);
                        this.props.change(canvas2.toDataURL("image/png"));
                    }else{
                        let imagedata = this.ctx.getImageData(this.IL, this.IT, this.IW, this.IH),
                            canvas2 = document.createElement('canvas'),
                            ctx2 = canvas2.getContext('2d');
                        canvas2.width = this.IW;
                        canvas2.height = this.IH;
                        ctx2.putImageData(imagedata, 0, 0, 0, 0, this.IW, this.IH);
                        this.props.change(canvas2.toDataURL("image/png"));
                    }
                    
                }}
                >预览图片</button>
            </div>
        </div>
    }

    // 获取上传图片,并渲染到canvas
    fileChange = () =>{
        this.setState({ S : true });
        let picOM = this._file.files[0];
        //console.log("imageClip - filrChange - picOM = " + picOM);
        if(!picOM) return;

        // 从获取的图像中读取图片数据,即图片的BASE64码
        let fileReade = new FileReader();
        fileReade.readAsDataURL(picOM);
        fileReade.onload = ev =>{
            // 创建一张图片
            this.img =  new Image();
            console.log("imageClip - onload - ev.target.result = " + ev.target.result);
            this.img.src = ev.target.result;
            this.img.onload = () =>{
                let n=1,
                    {W, H} = this.state;
                this.IW = this.img.width;
                this.IH = this.img.height;
                //console.log("image itself - width = " + this.img.width + ", height = " + this.img.height);
            
                // 修改的部分
                if(this.IW >this.IH){
                    n=this.IW / W;
                    this.IW = W;
                    this.IH =this.IH / n;
                }else{
                    n = this.IH / H;
                    this.IH =H;
                    this.IW =this.IW / n;
                }
                //IL和IT的初始值
                //this.IL = 0;
                //this.IT = 0;
                this.IL = (W-this.IW)/2;
                this.IT = (H-this.IH)/2;

                 // 将图片绘制到canvas
                this.drawImage();
            };
        } 
    }

    // 图片绘制
    drawImage = () => {
        let { W, H } = this.state;
        this.ctx = this._canvas.getContext('2d');
        this.ctx.clearRect(0, 0, W, H);
        //console.log("drawImage - this.IL = " + this.IL + ", this.IT = " + this.IT + ", this.IW = " + this.IW + ", this.IH = " + this.IH);
        this.ctx.drawImage(this.img, this.IL, this.IT, this.IW, this.IH);
        //console.log("ImageClip - drawImage - this.img = " + this.img);
        //this.ctx.drawImage(this.img, 0, 0, 400, 400);
    }



    //鼠标按下，记录拖拽起始位置，鼠标按下时document绑定onmousemove事件，实时改变元素的布局style
    fnDown(e) {
        this.startX = e.clientX ;
        this.startY = e.clientY ;
        document.onmousemove = this.fnMove.bind(this)
    }

    //鼠标移动
    fnMove(e) {
        let changeX = e.clientX - this.startX,
            changeY = e.clientY - this.startY;
        if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
            this.IL += changeX;
            this.IT += changeY;
            this.drawImage();
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    //鼠标抬起，鼠标放开时document移除onmousemove事件
    fnUp() {
        document.onmousemove = null
    }
    
}

export default ImageClip;
