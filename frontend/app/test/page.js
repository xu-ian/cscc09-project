'use client'
import React from "react"
import {loadData} from '../../api/logic/api.mjs'
import Form from '../../components/form.js'
import Iterative from "../../components/iterative.js"
import Button from "../../components/button.js"
import "../../components/styles/main.css"

class Test extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dom: "",
      obj:<div></div>,
      pageData: {},
      pageSwitches:<div></div>
    };
  }


  componentDidMount(){
    loadData(this, function(err, res, out){
      const div = document.createElement('div');
      const switches = [];
      const pages = {};
      Object.entries(res.dom).forEach(function(entry){
        div.innerHTML = entry[1];
        const objlist = [];
        for(let i = 0; i < div.childNodes.length; i++){
          if(div.childNodes[i].className.search("form") != -1){
            objlist.push(<Form key={div.childNodes[i].id} dom={div.childNodes[i]} innerhtml = {div.childNodes[i].innerHTML}/>);
          } else if(div.childNodes[i].className.search("iterout") != -1){
            objlist.push(<Iterative key={div.childNodes[i].id} dom={div.childNodes[i]} innerhtml = {div.childNodes[i].innerHTML}/>);
          } else if(div.childNodes[i].className.search("button") != -1){
            objlist.push(<Button key={div.childNodes[i].id} dom={div.childNodes[i]} type="button"/>)
          }
        };
        switches.push(<Button key={entry[0]} onClick={()=>{
          out.setState({obj: out.state.pageData[entry[0]]});
        }} type="button" dom={{type: "button", id: entry[0], value: entry[0], className: "button button-class"}}>{entry[0]}</Button>);
        pages[entry[0]] = objlist;
      });
      out.setState({pageData: pages});
      out.setState({obj: pages[Object.keys(res.dom)[0]]});
      out.setState({pageSwitches: switches});

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
      {this.state.pageSwitches}
      <a href="credits">credits</a>
      <a href="/">build</a>
    </div>);
  }
};

export default Test;