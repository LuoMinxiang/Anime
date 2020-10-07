import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EventEmitter from '../Utils/EventEmitter'

//Tabbar中动效设置面板

class TextAnimPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //reveal
            revealFade : false
        }
        this.reveal = "";
    }
  handleChange = (event) => {
    this.reveal = event.target.value;
    //alert("reveal = " + this.reveal);
    const animInfo = {};
    animInfo["reveal"] = this.reveal;
    EventEmitter.emit("getAnim", animInfo);
  };
    render(){
        const formControl = {
            //margin: theme.spacing(1),
            minWidth: 120,
            //width : 200
          }
        const selectEmpty = {
            //marginTop: theme.spacing(2),
          }
        return(
            <FormControl variant="outlined" style={formControl}>
                <InputLabel id="demo-simple-select-outlined-label">Reveal</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    //只有用defaultValue才能在选中的时候改变显示的值！
                    defaultValue={this.reveal}
                    onChange={this.handleChange}
                    label="Reveal"
                >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={"Fade"}>Fade</MenuItem>
                <MenuItem value={"Zoom"}>Zoom</MenuItem>
                </Select>
            </FormControl>
        );
    }
}

export default TextAnimPanel;