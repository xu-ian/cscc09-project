'use client'
import React from 'react';
import { getFormIterationPage } from '../api/logic/api.mjs';

class Iterative extends React.Component{

  constructor(props){
    super(props); 

    const contents = [];
    
    const children = props.dom.childNodes[0].childNodes;
    children.forEach(function(node){

      contents.push(<div className={props.dom.childNodes[0].className}>
      <div key={node.id} id={node.id} field={node.attributes.field.value} 
        className={node.className}></div></div>);
    });

    this.updateIteration = this.updateIteration.bind(this);

    this.state = {
      dom: props.dom,
      data: [],
      obj: <div className={props.dom.className}>
        {contents}
      </div>
    }
  }

  componentDidMount(){
    this.interval = setInterval(this.updateIteration, 3000);
    this.updateIteration();
  }

  updateIteration(){
    if(this.state.obj){
      getFormIterationPage(this, this.state.dom.attributes.form.value, 0, this.state.dom.attributes.elements.value, function(ths, res, abc=this){
        const contents = [];
        let iteration = [];
        const children = ths.state.dom.childNodes[0].childNodes;
        res.forEach(function(entry){
          children.forEach(function(node){
          iteration.push(
          <div key={node.id} id={node.id} field={node.attributes.field.value} 
            className={node.className}>{entry.fields[node.attributes.field.value]}</div>);
          });
          contents.push(<div className={ths.state.dom.childNodes[0].className}>{iteration}</div>)
          iteration = [];
        });
        ths.setState({obj: <div className={ths.state.dom.className}>
          {contents}
        </div>});
      });
    }
  };

  render(){
    return(this.state.obj);
  }
}

export default Iterative