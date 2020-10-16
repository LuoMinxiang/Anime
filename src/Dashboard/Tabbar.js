import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ColorPicker from './ColorPicker'
import TinymceEditor from './Editor'
import TextAnimPanel from './TextAnimPanel'
import { ActiveKeyInfoContext } from './listItems'
import EventEmitter from '../Utils/EventEmitter'
import WarningDialog from '../Utils/WarningDialog'

//点击addLayoutSetter按钮下拉出现的设置面板：分为设置颜色区、设置内容区、设置动效区

class Tabbar extends React.Component{
  constructor(props){
    super(props);
    this.isChangeSettingMode = false;
    this.state = {
      //当前选择的tab索引
      tabIndex : 0,
      //当前参数传入的tab索引
      curPropsTabIndex : 0,
      //警告对话框是否打开
      open : false,
    }
    //用户点击的tab索引
    this.tabToBeChanged = 0;

    //函数绑定
    this.setTabIndex = this.setTabIndex.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleDialogChooseChange = this.handleDialogChooseChange.bind(this);
    this.handleDialogChooseSave = this.handleDialogChooseSave.bind(this);
  }

  componentDidMount(){
    //监听是否处于常变特效设置模式
    this.emitter1 = EventEmitter.addListener("isChangingSettingOn",(isExpanded) => {
      this.isChangeSettingMode = isExpanded;
    })
  }

  //真正设置tab索引的切换：常变动效设置模式下（没保存）切换到其他tab要发出警告。其他时候点哪儿切换哪儿
  setTabIndex(index){
    if(this.isChangeSettingMode && this.props.anime && index !== 2){
      //常变动效设置模式下，切换tab发出警告
      this.setState({open : true});
      this.tabToBeChanged = index;
    }else{
      //非常变模式下，随意切换
      this.setState({tabIndex : index});
    }
    
  }

  //关闭对话窗口
  handleDialogClose(){
    this.setState({open : false});
  }

  //点击save关闭对话窗口：不切换
  handleDialogChooseSave(){
    this.handleDialogClose();
  }

  //点击不save关闭对话窗口：切换
  handleDialogChooseChange(){
    this.setState({tabIndex : this.tabToBeChanged});
    this.handleDialogClose();
  }

  //监听props（每次设置常变动效的内容项显示tabbar时都从tab0开始显示）的改变，并在改变时切换到tab0
  static getDerivedStateFromProps (props, state) {
    if(props.tabIndex !== state.curPropsTabIndex){
      //设置弹窗中的tab，切换至tab0
      return {
        tabIndex : 0,
        curPropsTabIndex : props.tabIndex
      };
      
    }
  }


  render(){
    return (
      //在常变动效设置模式时，如果切换到其他tab，就关掉常变动效设置模式
      <Tabs selectedIndex={this.state.tabIndex} onSelect={index => this.setTabIndex(index)}>
    <TabList>
      <Tab>Color</Tab>
      <Tab>Content</Tab>
      {this.props.anime? <Tab>Animation</Tab> : null }
    </TabList>

    <TabPanel>
    <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
              //alert("Tabbar got activeKeyInfo!!! " + (activeKeyInfo !== null? activeKeyInfo.totalN : null));
              if(this.props.anime){
                //设置静态内容，颜色为当前选中setter的颜色
                return <ColorPicker color={activeKeyInfo? activeKeyInfo.color : null}></ColorPicker>
              }else{
                //设置常变动效内容，颜色为传入参数的颜色
                return <ColorPicker color={this.props.color} onColorChanged={this.props.onColorChanged}></ColorPicker>
              }
      
      }}
    </ActiveKeyInfoContext.Consumer>
    </TabPanel>
    <TabPanel>
    <ActiveKeyInfoContext.Consumer>
            {(activeKeyInfo) => {
              //alert("Tabbar got activeKeyInfo!!! " + (activeKeyInfo !== null? activeKeyInfo.totalN : null));
              if(this.props.anime){
                //主设置栏：初始值为Hello，World
                return <TinymceEditor text="<b>Hello World</b>"></TinymceEditor>
              }else{
                //设置常变动效内容，文本为传入参数的文本
                return <TinymceEditor text={this.props.text} onTextChanged={this.props.onTextChanged}></TinymceEditor>
              }
      
      }}
    </ActiveKeyInfoContext.Consumer>
    </TabPanel>
    {this.props.anime? 
      <TabPanel>
          <TextAnimPanel></TextAnimPanel>
    </TabPanel> :
    null}
    <WarningDialog
      open={this.state.open}
      handleClose={this.handleDialogClose}
      dialogContent="If you change tabs, all your editing on changing effect will be lost!"
      agree="GO BACK AND SAVE"
      disagree="I DON'T CARE. CHANGE ANYWAY"
      handleDisagreeClose={this.handleDialogChooseChange}
      handleAgreeClose={this.handleDialogChooseSave}>
    </WarningDialog>
  </Tabs>
    );
  }
}
export default Tabbar;