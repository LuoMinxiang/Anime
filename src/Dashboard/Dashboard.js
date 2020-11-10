import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import UILink from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ListMenu } from './listItems';
import WebCanvas from '../WebCanvas/WebCanvas';
import Button from '@material-ui/core/Button';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import toolBarImage from "./toolbarBackground.JPG";

import EventEmitter from '../Utils/EventEmitter';
import { Link } from 'react-router-dom'

//操作界面全部内容

const drawerWidth = 240;
const canvasHeightUnit = 712;

//重写toolBar的主题
const theme = createMuiTheme({
  props: {
    // Style sheet name ⚛️
    Toolbar: {
      // Name of the rule
      primary: "deeporange",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    backgroundImage: 'url(' + toolBarImage + ')'
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  //规定画布宽高的样式
  fixedHeight: {
    width:1200,
    height: 712,
    //height: 1536,
    position: 'relative',
    //background : 'green'
  },
  //规定画布风格的样式
  canvasPaper : {
    padding : '0',
    display: 'flex',
    //overflow: 'auto',
    overflowX: 'hidden',
    overflowY: 'scroll',
    flexDirection: 'column',
  }
}));

//Dashboard = 左边的设置面板组件ListMenu + 上方的导航栏组件Toolbar + 右边的画布组件WebCanvas
export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [pageLength, setPageLength] = React.useState(712);
  const [canvasScrollTop, setCanvasScrollTop] = React.useState(0);
  //上传的图片字符串
  //const [picData, setPicData] = React.useState('');
  //上传的图片url
  const [picUrl, setPicUrl] = React.useState('');
  //上传的视频url
  const [vidUrl, setVidUrl] = React.useState('');

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.canvasPaper, classes.fixedHeight);
  const handlePreviewClick = () => {
    //将webCanvas中所有布局组件的数据发送给后端
    EventEmitter.emit("getSettersInfo","getSettersInfo");
  }
  
  //画布组件的下滚监听函数
  const handleCanvasScroll = (event) => {
    //通知ScrollSetter画布的scrollTop
    EventEmitter.emit("canvasScrolled", event.target.scrollTop);
    setCanvasScrollTop(event.target.scrollTop);
  }

  //点击添加画布长度的回调函数
  const handleLengthenPage = () => {
    setPageLength(pageLength + canvasHeightUnit);
  }

  const handleShortenPage = () =>{
    if(pageLength > canvasHeightUnit){
      setPageLength(pageLength - canvasHeightUnit);
    }
  }

  const handleImageUploaded = (imgUrl) => {
    console.log("dashboard - imgUrl = " + imgUrl);
    setPicUrl(imgUrl);
    
  }

  const handleImageClear = () => {
    setPicUrl('');
  }

  const handleVideoUploaded = (vidUrl) => {
    setVidUrl(vidUrl);
    //console.log("dashboard - img = " + img);
  }

  const handleVideoClear = () => {
    setVidUrl('');
  }

  return (
    <div className={classes.root}>
      
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          {/*<IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
          <MenuIcon />
          </IconButton>*/}
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Animé
          </Typography>

          <Button variant="outlined" color="inherit" onClick={handlePreviewClick}>
              <Link to="/preview" target="_blank" style={{ textDecoration:'none', color:'white'}}>预览</Link>
          </Button>
          
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <Button variant="outlined" color="inherit" onClick={handleLengthenPage}>
          加长画布
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleShortenPage}>
            缩短画布
        </Button>
        <ListMenu
          handleImageUploaded={handleImageUploaded}
          handleImageClear={handleImageClear}
          handleVideoUploaded={handleVideoUploaded}
          handleVideoClear={handleVideoClear}></ListMenu>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
        <Grid item xs={12}>
              <Paper className={fixedHeightPaper} onScroll={handleCanvasScroll}>
                <WebCanvas 
                  pageLength={pageLength}
                  scrollTop={canvasScrollTop}
                  imgUploaded={picUrl}
                  vidUploaded={vidUrl}
                ></WebCanvas>
              </Paper>
            </Grid>
        </Container>
      </main>
    </div>
  );
}
