import {getChoice, getSelectForm, getOperations, getDestination} from './helper.mjs';
import {addForm, getForms, getForm, removeForm, updateFormName, addDisplay, removeDisplay, 
        updateDisplay, addDatafield, createDatafield, removeDatafield, updateDatafield, getDatafield, 
        deleteDatafield, addField, createField, updateField, removeField, deleteField, addPage, 
        removePage, getPages, getPage, addButton, getButton, removeButton, storeData, loadData} from './api.mjs'
export function setupEditor(editor){

let prevent_endless_component_update_switch = true;

  /* Function that modify the traits tab if a button is selected */
function modify_button_traits(e){
  let traits = ["id", "name",
    {
      type: "select",
      label: 'Button Type',
      name: 'button_type',
      options: [
        {id: 'modify_field', name: "Modify Field"},
        {id: 'change_state', name: "Change State"},
      ],
    },
  ];
  if(e.attributes.attributes['button_type'] == 'modify_field'){
    if(e.attributes.attributes['operation'] == 'aggregate_sum' ||
        e.attributes.attributes['operation'] == 'mean'){

    }
    else {
      traits.push(getOperations("numeric"));
      if(e.attributes.attributes['input_1_type'] == 'Field'){
        traits.push(getSelectForm("First"));
      } else {
        traits.push("First Field");
      }
      traits.push(getChoice("input_1_type"));
      if(e.attributes.attributes['input_2_type'] == 'Field'){
        traits.push(getSelectForm("Second"));
      } else {
        traits.push("Second Field");
      }
      traits.push(getChoice("input_2_type"));
      traits.push(getDestination("field"));
    }
  } else if(e.attributes.attributes['button_type'] == 'change_state'){

    traits.push(getOperations(null));
    console.log(e.attributes);
    if(e.attributes.attributes['operation'] == 'page_change'){
      traits.push(getDestination("page"));
    }
  }
  e.setTraits(traits);
}

let loading = true;

/* This triggers whenever a component is added/deleted or modified on the canvas */
editor.on('storage:store', function(e){
  console.log("Storing");
  /* The statement below prints the entire DOM in the canvas*/
  //console.log("Store:", e);
});

editor.on("storage:end:store", function(){
  const parser = new DOMParser();
  const doc = parser.parseFromString(editor.getHtml(), 'text/html');
  const data = editor.getProjectData();
  console.log(data);
  console.log(doc.body.innerHTML, editor.getProjectData());
  storeData({assets: data.assets, pages: data.pages, styles: data.styles}, doc.body.innerHTML);
});

/* On component select, update the trait bar to show the correct traits */
/* This triggeres whenever a component is clicked on */
editor.on('component:selected', function(e){
  /* This prints the selected component */
  console.log("Selected");
  //console.log(e);
  if(e.attributes['custom-name'] == "Row") {
    console.log("Row");
    /* This is a function that can update the trait section of the grapesjs editor.
       Strings are the field names and have string inputs

       JSONs are more complicated inputs: 
        - name is the variable name in the DOM
        - label is the display on the trait tab
        - type determines how you choose the value(input, select, checkmark, radio, etc)
        - options gives you which options you can pick from depending on type of input. */
    e.setTraits(["id",
    "title",
    "comp",
    "var2",
    {
        type: "select",
        label: 'Form Name',
        name: 'form_name',
        options: [
          {id: 'form1', name: 'Form 1'},
          {id: 'form2', name: 'Form 2'},
        ],
      },]);
  } else if(e.attributes['custom-name'] == 'Form' || e.attributes['custom-name'] == 'Text-Input' ||
            e.attributes['custom-name'] == 'Iteration'){
    e.setTraits([
      "name",
    ]);
  } else if(e.attributes['custom-name'] == 'Button'){
    console.log("Button");
    modify_button_traits(e);
  } else if(e.attributes['custom-name'] == 'Iterable'){
    getForms(function(res){
      let form_options = [];
      for(let i = 0; i < res.length; i++){
        form_options.push({id: res[i].formId, name: res[i].name});
      }
      e.setTraits([
        "id",
        "name",
        {
          type: 'number',
          label: "Elements per page",
          name: 'elements',
          placeholder: 'Select number of items per page',
          min: 0,
          step: 1,
        },{
          type: 'checkbox',
          label: 'Page Navigation',
          name: 'navigateable',
          valueTrue: 'true',
          valueFalse: 'false',
        },
        {
          type: "select",
          label: 'Form',
          name: 'form',
          options: form_options,
        }
      ]);   
    });
  } else if(e.attributes['custom-name'] == 'Data-Out'){
    console.log("Data out");
    const iteration = e.parent();
    const iterator = iteration.parent();
    if(iteration.attributes['custom-name'] == 'Iteration'){
      const formId = iterator.attributes.attributes.form;
      if(formId){
        getForm(formId, function(err, res){
          if(err){
            return console.error(err);
          }
          let field_options = [];
          console.log(res.fields);
          for(let i = 0; i < res.fields.length; i++){
            field_options.push({id: res.fields[i].fieldId, name: res.fields[i].name});
          }
          e.setTraits([
            "id",
            "name",
            {
              type: "select",
              label: "Field",
              name: 'field',
              options: field_options,
            }
          ]);    
        });
      } else{
        e.setTraits([
          "name",
        ]);
      }
    }
  }
});

/* This triggers whenever the information of a component is updated */
editor.on('component:update', function(e){ 
  //console.log(editor.getHtml());
  /* The below statement prints the component */
  /* Statement below ensures no infinite component update loop occurs */
  if(prevent_endless_component_update_switch){
    console.log("Update");
    const attributes = e.attributes.attributes; 
    if(e.attributes["custom-name"] == "Iterator") {

    } else if(e.attributes["custom-name"] == 'Button'){
      modify_button_traits(e);
      prevent_endless_component_update_switch = false;
    } else if(e.attributes["custom-name"] == 'Form'){
      updateFormName(e.ccid, attributes.name);
    } else if(e.attributes["custom-name"] == 'Text-Input'){
      updateField(e.ccid, attributes.name);
    } else if(e.attributes["custom-name"] == 'Iterable'){
      updateDisplay(e.ccid, attributes.name, parseInt(attributes.elements), attributes.navigateable, attributes.form);
    } else if(e.attributes["custom-name"] == 'Data-Out'){
      updateDatafield(e.ccid, attributes.name, attributes.field);
    }
  } else{
    prevent_endless_component_update_switch = true;
  }
});

editor.on('component:add', function(e){
  //console.log(e.attributes["custom-name"]);
  if(e.attributes['custom-name'] == 'Form'){
    console.log("Adding form");
    addForm(e.ccid, '');

  }else if(e.attributes['custom-name'] == 'Text-Input'){
    //Currently only checks the parent. Should check recursive parents up to body
    if(e.parent().attributes['custom-name'] == 'Form'){
      addField(e.parent().ccid, '', e.ccid);
    }
  } else if(e.attributes["custom-name"] == 'Iterable'){
    addDisplay(e.ccid);
  } else if(e.attributes["custom-name"] == 'Data-Out'){
    if(e.parent().attributes['custom-name'] == 'Iteration'){
      addDatafield(e.parent().parent().ccid, '', e.ccid);
    }
  }
});

editor.on('component:remove', function(e){
  if(!loading){
  if(e.attributes['custom-name'] == 'Form'){
    removeForm(e.ccid);
  } else if(e.attributes['custom-name'] == 'Text-Input'){
    if(e.parent().attributes["custom-name"] == 'Form'){
      removeField(e.parent().ccid, e.ccid);
    }
  } else if(e.attributes["custom-name"] == 'Iterable'){
    removeDisplay(e.ccid);
  } else if(e.attributes["custom-name"] == 'Data-Out'){
    removeDatafield(e.parent().parent().ccid, '', e.ccid);
  }
  }
});

loadData(null, function(err, res){
  if(res){
    editor.loadProjectData(res.data);    
  }
  loading = false;
});
}