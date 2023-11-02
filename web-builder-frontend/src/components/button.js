import React, {setState} from "react"

class Button extends React.Component{
  constructor(props){
    //console.log(props);
    super(props);
    this.state = {
      dom: props.dom,
      obj: <input id={props.dom.id} type={props.type} value={props.dom.value} 
            className={props.dom.className}></input>
    };
  }

  componentDidMount(){
  }

  render(){
    return (this.state.obj);
  }
};

export default Button;