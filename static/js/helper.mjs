/* Returns a trait with a modified name and Label */
export function getChoice(name){
  return {
    type: "checkbox",
    label: "Is your input a field?",
    name: name,
    valueTrue: 'Field',
    valueFalse: 'Numeric'
  };
}

export function getSelectForm(field_prefix){
  return {
    type: "select",
    label: field_prefix + 'Field',
    name: toLowerCase(field_prefix) + '_field',
    options: [
      //Set this to be filled out dynamically later
      {id: 'fieldId', name: "Field Name"},
      {id: 'fieldId2', name: "Field Name 2"},
    ]
  }
}

export function getOperations(type){
  if(type == "numeric"){
    return {
      type: "select",
      label: 'Operation',
      name: 'operation',
      options: [{id: 'add', name: "Add"},
                {id: 'subtract', name: "Subtract"},
                {id: 'multiply', name: "Multiply"},
                {id: 'divide', name: "Divide"},
                {id: 'power', name: "Exponent"},
                //Implement these two later
                //{id: 'sum', name: "Add Multiple"},
                //{id: 'mean', name: "Average"},
              ]
    }
  }else if(type == "state"){
    return {
      type: "select",
      label: 'Operation',
      name: 'operation',
      options: [
        {id: 'toggle_visibility', name: 'Change Visibility'},
        {id: 'page_change', name: 'Change Page'},
      ],
    };
  }
  return "Operation"
}

export function getDestination(type){
  if(type == "field"){
    return {
      type: "select",
      label: 'Destination',
      name: 'destination',
      //Set this to be filled out dynamically later
      options: [{id: 'fieldid', name: "Field Name"},
                {id: 'fieldid2', name: "Field Name 2"}]
    }
  } else if(type == "page"){
    return {
      type: "select",
      label: 'Destination',
      name: 'destination',
      //Set this to be filled out dynamically later
      options: [{id: 'pageid', name: "Page Name"},
                {id: 'pageid2', name: "Page Name 2"}]
    }
  }   
  return "Destination"; 
}