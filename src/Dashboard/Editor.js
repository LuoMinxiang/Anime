import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import EventEmitter from '../Utils/EventEmitter'

//富文本编辑器

//使用TinyMce api的许可证
const apiKey = 'qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc';
//富文本编辑器的初始内容
const sampleContent = `
<h2 style="text-align: center;">
  TinyMCE provides a <span style="text-decoration: underline;">full-featured</span> rich text editing experience, and a featherweight download.
</h2>
<p style="text-align: center;">
  <strong><span style="font-size: 14pt;"><span style="color: #7e8c8d; font-weight: 600;">No matter what you're building, TinyMCE has got you covered.</span></span></strong>
</p>`;

class TinymceEditor extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          //如果传入的文本不为空就将初始文本设置为传入的文本，否则初始的文本是sampleContent
          data: this.props.text || ""
        };
      }
    
      //在富文本编辑器内容改变时，使用改变的内容修改state，引起重新绘制
      handleChange(data) {
        this.setState({ data });
        if (this.props.onTextChanged) {
          this.props.onTextChanged(data);
        }
      }
    
      render() {
        //在太里面不能获取this时在外面定义箭头函数获取this，在里面使用外面定义的函数获取this的属性值。
        const getData = () => {
            EventEmitter.emit("setSelectedSetterContent", this.state.data);
        }
        return (
          <div>
            <Editor
              apiKey={apiKey}
              init={{ 
                  height: 300,
                  //设置工具栏的内容：向前 向后 粗体 斜体 链接 图片 左对齐 居中 右对齐 增大字号 缩小字号 ok（设置选中setter的内容）
                  toolbar: [
                    'undo redo bold italic link image alignleft aligncenter alignright increasefont decreasefont OK'
                  ],
                  setup: function (editor) {
                    //自定义OK按钮：调用getData函数将富文本编辑器中的内容发送给WebCanvas，来设置选中setter的内容
                    editor.ui.registry.addButton('OK', {
                      text: 'OK',
                      onAction: getData
                    });
                    //自定义increasefont按钮（待实现）：点击时增加选中文本的字号
                    editor.ui.registry.addButton('increasefont', {
                        icon: 'zoom-in',
                        tooltip: 'Increase Font',
                        onAction: function () {
                            //思路
                            //getRng():Range - Returns the browsers internal range object.
                            //The Range.startOffset read-only property returns a number representing where in the startContainer the Range starts.
                            //编辑器中第一个字母为0，startOffset返回选中部分的第一个字母的序号
                            //endOffset返回选中部分的 最后一个字母的下一个字母的序号
                            alert("font-increase button clicked! start-offset : " + editor.selection.getRng().startOffset);
                            alert("font-increase button clicked! end-offset : " + editor.selection.getRng().endOffset);
                            console.log(editor.getContent({format : 'text'}));
                            console.log(editor.getContent());
                        }
                      });
                      //自定义decreasefont按钮（待实现）：点击时缩小选中文本的字号
                      editor.ui.registry.addButton('decreasefont', {
                        icon: 'zoom-out',
                        tooltip: 'Decrease Font',
                        onAction: function () {
                            //测试按钮能触发回调函数
                            alert("font-decrease button clicked!");
                            editor.setContent("<p><span style='font-size:40px;' id='0'>Hello, World!</span></p>");
                        }
                      });
                  }
                 }}
              value={this.state.data}
              onEditorChange={(e) => this.handleChange(e)}
            />
            
          </div>
        );
      }
    }
export default TinymceEditor;