'use client'
import React from "react"
import Input from './input.js';
import Button from './button.js';
import { addFormIteration } from "../api/logic/api.mjs";

class Form extends React.Component{
  constructor(props){
    super(props);
    //console.log("DOM", props.dom.childNodes);
    //console.log("Inner", props.innerhtml);

    this.handleSubmit = this.handleSubmit.bind(this);

    const contents = [];
    props.dom.childNodes.forEach(function(node){
      if(node.type == 'text'){
        contents.push(<Input key={node.id} dom={node} innerhtml={node.innerHTML}/>);
      } else if(node.type == 'button'){
        // console.log(node);
        contents.push(<Button key={node.id} type={'submit'} dom={node} innerhtml={node.innerHTML}/>);
      }
    });


    this.state = {
      dom: props.dom,
      obj: <form onSubmit={this.handleSubmit} className={props.dom.className} id={props.dom.id}>
        {contents}</form>
    };

  };

  handleSubmit(event){
    event.preventDefault();
    const formId = event.target.id;
    const inputs = {};
    event.target.childNodes.forEach(function(child){
      if(child.type != 'submit'){
        inputs[child.id] = child.value;
      }
    });
    event.target.reset();
    addFormIteration(formId, inputs);
  }
  componentDidMount(){
  }

  render(){
    return (this.state.obj);
  }
};

export default Form;