import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import VolumeUp from '@material-ui/icons/VolumeUp';

//计时器设置滑块+表单

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  input: {
    width: 42,
  },
});

export default function InputSlider(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(props.interval===null? 0 : props.interval);

  //改变滑块回调函数
  const handleSliderChange = (event, newValue) => {
    //只有直接滑动滑块的时候调用，改变input不会调用
    //滑动滑块的时候会导致input值改变（因为都用的value），但不会调用handleInputChange
    setValue(newValue);

    props.handleIntervalChange(newValue);
  };

  //改变表单回调函数
  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));

    props.handleIntervalChange(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    //不知道什么时候调用，似乎是当input将value改成整数后再滑动滑块时调用
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <div className={classes.root}>
      <Typography id="input-slider" gutterBottom>
        Interval
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            //value={typeof value === 'number' ? value : 0}
            value={(props.interval !== null && typeof(props.interval) !== 'undefined')? props.interval : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item>
          <Input
            className={classes.input}
            //value={value}
            value={(props.interval !== null && typeof(props.interval) !== 'undefined')? props.interval : 0}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}
