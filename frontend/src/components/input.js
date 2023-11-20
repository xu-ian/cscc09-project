import React, {setState} from "react"

class Input extends React.Component{
  constructor(props){
    //console.log(props);

    super(props);
    this.state = {
      dom: props.dom,
      obj: <input id={props.dom.id} type="text" className={props.dom.className}></input>
    };
  }

  componentDidMount(){
  }

  render(){
    return (this.state.obj);
  }
};

export default Input;