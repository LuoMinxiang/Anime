import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { SketchPicker } from 'react-color'
import { Editor } from '@tinymce/tinymce-react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ImageLoader from '../ImageLoader/ImageLoader'

//弹出设置窗口中的跟随动效设置tabbar

//使用TinyMce api的许可证
const apiKey = 'qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc';

class HoverSettingTabbar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      contentType : "text",
    }
    this.handleContentTypeChange = this.handleContentTypeChange.bind(this);
  }

  handleContentTypeChange(event){
    this.setState({
      contentType : event.target.value
    })
  }
    render(){
        return (
          <div>
            <InputLabel>Content Type</InputLabel>
            <Select
              style={{width : "100%"}}
              value={this.state.contentType}
              onChange={this.handleContentTypeChange}
            >
            <MenuItem value={"text"}>Edit Text</MenuItem>
            <MenuItem value={"image"}>Upload Image</MenuItem>
            </Select>
            {this.state.contentType === "image"?
            <ImageLoader
              handleImageUploaded={this.props.handleImageUploaded}
              setterPic={this.props.pic}
              withClip={false}
            ></ImageLoader>:
            <Tabs defaultIndex={0}>
            <TabList>
              <Tab>Color</Tab>
              <Tab>Content</Tab>
            </TabList>
        
            <TabPanel>
            <SketchPicker
            className="color-pick"
            color={this.props.color? this.props.color : "transparent"}
            onChangeComplete={this.props.onColorChanged}
            onChange={this.props.onColorChanged}/>
            </TabPanel>
            <TabPanel>
            <Editor
              apiKey={apiKey}
              init={{ 
                  height: 300,
                  //设置工具栏的内容：向前 向后 粗体 斜体 链接 图片 左对齐 居中 右对齐 增大字号 缩小字号 ok（设置选中setter的内容）
                  toolbar: [
                    'undo redo bold italic link image alignleft aligncenter alignright increasefont decreasefont'
                  ],
                  setup: function (editor) {
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
                            editor.setContent("<b>Hello, World!</b>");
                        }
                      });
                  }
                 }}
              value={this.props.text}
              onEditorChange={this.props.onTextChanged}
            />
            </TabPanel>
          </Tabs>}
          </div>
        );
    }
}
export default HoverSettingTabbar;