import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';

import EventEmitter from '../Utils/EventEmitter'
import Tabbar from './Tabbar'

//左侧设置面板

//Tabbar的context，用于共享当前选中布局组件
const ActiveKeyInfoContext = React.createContext(null);
class ListMenu extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      //显示还是隐藏setter的颜色/内容/动效设置面板（Tabbar）：false为隐藏，true为显示
      addBtnDrop : false,
      activeKeyInfo : null
    }
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount(){
    this.emitter1 = EventEmitter.addListener("activeKeyInfo",(msg) => {
      if(msg !== null){
        //有选中的setter
      this.setState({activeKeyInfo : msg},()=>{
      });
    }else{
      //没有选中的setter，将选中setter信息设置为空
      this.setState({activeKeyInfo : null});
    }
    });
      
  }

  //添加setter按钮的回调函数：点击后通知WebCanvas，添加一个空白的setter
  handleClick(){
    if(!this.state.addBtnDrop){this.setState({addBtnDrop : true});}
    EventEmitter.emit("ClickedAddLayoutSetter","ClickedAddLayoutSetter");
  }

  //Tabbar的样式
  tabStyle = {
    margin : "0 10px"
  }

  render(){
    return (
      <div>
    <ListItem button onClick={this.handleClick}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Add LayoutSetter" />
    </ListItem>
    {this.state.addBtnDrop?
    <div style={this.tabStyle}>
      <ActiveKeyInfoContext.Provider value={this.state.activeKeyInfo}>
        <Tabbar anime={true}/>
      </ActiveKeyInfoContext.Provider>
    </div>
      :null}
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Customers" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Integrations" />
    </ListItem>
  </div>
    );
  }
}
export { ListMenu, ActiveKeyInfoContext };