import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ColorPicker from './ColorPicker'
import TinymceEditor from './Editor'
import TextAnimPanel from './TextAnimPanel'

//点击addLayoutSetter按钮下拉出现的设置面板：分为设置颜色区、设置内容区、设置动效区

class Tabbar extends React.Component{
  render(){
    return (
      <Tabs>
    <TabList>
      <Tab>Color</Tab>
      <Tab>Content</Tab>
      <Tab>Animation</Tab>
    </TabList>

    <TabPanel>
      <ColorPicker></ColorPicker>
    </TabPanel>
    <TabPanel>
          <TinymceEditor></TinymceEditor>
    </TabPanel>
    <TabPanel>
          <TextAnimPanel></TextAnimPanel>
    </TabPanel>
  </Tabs>
    );
  }
}
export default Tabbar;