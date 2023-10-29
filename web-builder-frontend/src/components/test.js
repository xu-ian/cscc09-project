import React, {setState} from "react"
import {loadData} from './logic/api.mjs'

class Test extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dom: ""
    };
  }

  componentDidMount(){
    console.log("This", this);
    loadData(this, function(err, res, out){
      console.log("Out", out);
      if(err){
        console.log(err);
      } else {
        console.log(res.dom);
        out.setState({dom: res.dom});
      }
    });
  }

  render(){
    return (<div><div dangerouslySetInnerHTML={{__html : this.state.dom}}></div>
      <a href="credits">credits</a>
      <a href="/">build</a>
    </div>);
  }
};

export default Test;