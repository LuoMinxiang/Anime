import React from 'react'
import {Resizable} from 're-resizable'

//图形化设置跟随组件的宽高的组件

class TrailerSizeSetter extends React.Component{
    render(){
        const trailerStyle = {
            border : "solid 1px grey"
        }
        return <Resizable
                style={trailerStyle}
                size={{ width: this.props.width, height: this.props.height }}
                onResizeStop={this.props.onResizeStop}
                >
        Sample with default size
      </Resizable>
    }
}
export default TrailerSizeSetter;