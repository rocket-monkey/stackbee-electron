import { Component } from 'react'
import DragArea from './dragArea'
export default class Layout extends Component {
  render () {
    return (
      <div>
        <DragArea />

        {this.props.children}

        <style jsx>{`
          div {
            padding: 18px 12px;
            position: relative;
            color: #ddd;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
          }
        `}</style>
      </div>
    )
  }
}
