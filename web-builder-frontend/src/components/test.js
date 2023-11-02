import React, {setState} from "react"
import {loadData} from './logic/api.mjs'
import Row from './row.js'
import Form from './form.js'
import Iterative from "./iterative.js"

class Test extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dom: "",
      obj:<div></div>
    };
  }

  componentDidMount(){
    loadData(this, function(err, res, out){
      const div = document.createElement('div');
      div.innerHTML = res.dom;
      const objlist = [];
      for(let i = 0; i < div.childNodes.length; i++){
        if(div.childNodes[i].className.search("form") != -1){
          objlist.push(<Form key={i} dom={div.childNodes[i]} innerhtml = {div.childNodes[i].innerHTML}/>);
        } else if(div.childNodes[i].className.search("iterout") != -1){
          objlist.push(<Iterative key={i} dom={div.childNodes[i]} innerhtml = {div.childNodes[i].innerHTML}/>);
        }
      };
      out.setState({obj: objlist});

      if(err){
        console.log(err);
      } else {
        out.setState({dom: res.dom});
      }
    });
  }

  render(){
    return (<div>
      {this.state.obj}
      <a href="credits">credits</a>
      <a href="/">build</a>
    </div>);
  }
};

export default Test;