'use client'
import React from "react"

class Row extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dom: "",
      obj: <div></div>
    };
  }

  componentDidMount(){
  }

  render(){
    return (this.state.obj);
  }
};

export default Row;