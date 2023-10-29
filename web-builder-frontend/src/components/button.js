import React from "react";


function Button(){

  return (
    <input class="button centered" type="button" value="Click Me" 
                       data-gjs-droppable="false" data-gjs-draggable="true" data-gjs-custom-name="Button"/>
  )
};

export default Button;