import grapesjs from '../../node_modules/grapesjs/dist/grapes.mjs';
import {getChoice, getSelectForm, getOperations, getDestination} from './helper.mjs';
import {addForm, getForms, getForm, removeForm, updateFormName, addDisplay, removeDisplay, 
        updateDisplay, addDatafield, createDatafield, removeDatafield, updateDatafield, getDatafield, 
        deleteDatafield, addField, createField, updateField, removeField, deleteField, addPage, 
        removePage, getPages, getPage, addButton, getButton, removeButton, storeData, loadData} from './api.mjs'

/* Odd quirk of Grapesjs is that the ccid of components remain fluid until it is updated.
  After a component is modified, the ccid is constant. This means that newly added components do
  not save their ccid across sessions. This makes consistency difficult. To solve this, add a buffer
  where added components do not get their respective add component called on them, until they have 
  their properties modified. This is a TODO item for later. */

const editor = grapesjs.init({
  height: '100hv',
  container : '#gjs',
  fromElement: true,
  showOffsets: true,
  canvas: {
    scripts: ["./js/index.mjs"],
    styles: ['../style/main.css'],    
  },
  StorageManager: false,
  selectorManager: { componentFirst: true },
  styleManager: {
    sectors: [{/* These are the defaults I copied from the website and don't need to be changed for th emost part */
        name: 'General',
        properties:[
          {
            extend: 'float',
            type: 'radio',
            default: 'none',
            options: [
              { value: 'none', className: 'fa fa-times'},
              { value: 'left', className: 'fa fa-align-left'},
              { value: 'right', className: 'fa fa-align-right'}
            ],
          },
          'display',
          { extend: 'position', type: 'select' },
          'top',
          'right',
          'left',
          'bottom',
        ],
      }, {
          name: 'Dimension',
          open: false,
          properties: [
            'width',
            {
              id: 'flex-width',
              type: 'integer',
              name: 'Width',
              units: ['px', '%'],
              property: 'flex-basis',
              toRequire: 1,
            },
            'height',
            'max-width',
            'min-height',
            'margin',
            'padding'
          ],
        },{
          name: 'Typography',
          open: false,
          properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              {
                extend: 'text-align',
                options: [
                  { id : 'left',  label : 'Left',    className: 'fa fa-align-left'},
                  { id : 'center',  label : 'Center',  className: 'fa fa-align-center' },
                  { id : 'right',   label : 'Right',   className: 'fa fa-align-right'},
                  { id : 'justify', label : 'Justify',   className: 'fa fa-align-justify'}
                ],
              },
              {
                property: 'text-decoration',
                type: 'radio',
                default: 'none',
                options: [
                  { id: 'none', label: 'None', className: 'fa fa-times'},
                  { id: 'underline', label: 'underline', className: 'fa fa-underline' },
                  { id: 'line-through', label: 'Line-through', className: 'fa fa-strikethrough'}
                ],
              },
              'text-shadow'
          ],
        },{
          name: 'Decorations',
          open: false,
          properties: [
            'opacity',
            'border-radius',
            'border',
            'box-shadow',
            'background', // { id: 'background-bg', property: 'background', type: 'bg' }
            'background-color',
          ],
        },{
          name: 'Extra',
          open: false,
          buildProps: [
            'transition',
            'perspective',
            'transform'
          ],
        },{
          name: 'Flex',
          open: false,
          properties: [{
            name: 'Flex Container',
            property: 'display',
            type: 'select',
            defaults: 'block',
            list: [
              { value: 'block', name: 'Disable'},
              { value: 'flex', name: 'Enable'}
            ],
          },{
            name: 'Flex Parent',
            property: 'label-parent-flex',
            type: 'integer',
          },{
            name: 'Direction',
            property: 'flex-direction',
            type: 'radio',
            defaults: 'row',
            list: [{
              value: 'row',
              name: 'Row',
              className: 'icons-flex icon-dir-row',
              title: 'Row',
            },{
              value: 'row-reverse',
              name: 'Row reverse',
              className: 'icons-flex icon-dir-row-rev',
              title: 'Row reverse',
            },{
              value: 'column',
              name: 'Column',
              title: 'Column',
              className: 'icons-flex icon-dir-col',
            },{
              value: 'column-reverse',
              name: 'Column reverse',
              title: 'Column reverse',
              className: 'icons-flex icon-dir-col-rev',
            }],
          },{
            name: 'Justify',
            property: 'justify-content',
            type: 'radio',
            defaults: 'flex-start',
            list: [{
              value: 'flex-start',
              className: 'icons-flex icon-just-start',
              title: 'Start',
            },{
              value: 'flex-end',
              title: 'End',
              className: 'icons-flex icon-just-end',
            },{
              value: 'space-between',
              title: 'Space between',
              className: 'icons-flex icon-just-sp-bet',
            },{
              value: 'space-around',
              title: 'Space around',
              className: 'icons-flex icon-just-sp-ar',
            },{
              value: 'center',
              title: 'Center',
              className: 'icons-flex icon-just-sp-cent',
            }],
          },{
            name: 'Align',
            property: 'align-items',
            type: 'radio',
            defaults: 'center',
            list: [{
              value: 'flex-start',
              title: 'Start',
              className: 'icons-flex icon-al-start',
            },{
              value: 'flex-end',
              title: 'End',
              className: 'icons-flex icon-al-end',
            },{
              value: 'stretch',
              title: 'Stretch',
              className: 'icons-flex icon-al-str',
            },{
              value: 'center',
              title: 'Center',
              className: 'icons-flex icon-al-center',
            }],
          },{
            name: 'Flex Children',
            property: 'label-parent-flex',
            type: 'integer',
          },{
            name: 'Order',
            property: 'order',
            type: 'integer',
            defaults: 0,
            min: 0
          },{
            name: 'Flex',
            property: 'flex',
            type: 'composite',
            properties  : [{
              name: 'Grow',
              property: 'flex-grow',
              type: 'integer',
              defaults: 0,
              min: 0
            },{
              name: 'Shrink',
              property: 'flex-shrink',
              type: 'integer',
              defaults: 0,
              min: 0
            },{
              name: 'Basis',
              property: 'flex-basis',
              type: 'integer',
              units: ['px','%',''],
              unit: '',
              defaults: 'auto',
            }],
          },{
            name: 'Align',
            property: 'align-self',
            type: 'radio',
            defaults: 'auto',
            list: [{
              value: 'auto',
              name: 'Auto',
            },{
              value: 'flex-start',
              title: 'Start',
              className: 'icons-flex icon-al-start',
            },{
              value   : 'flex-end',
              title: 'End',
              className: 'icons-flex icon-al-end',
            },{
              value   : 'stretch',
              title: 'Stretch',
              className: 'icons-flex icon-al-str',
            },{
              value   : 'center',
              title: 'Center',
              className: 'icons-flex icon-al-center',
            }],
          }]
        }
      ],
  },
  blockManager: { /* These are blocks in the editor and the general format they are created in */
    blocks: [
      {/* Image */
        id: 'image',
        label: 'Image',
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                </svg>`,
        // Use `image` component
        content: { type: 'image' },
        // The component `image` is activatable (shows the Asset Manager).
        // We want to activate it once dropped in the canvas.
        activate: true,
        // select: true, // Default with `activate: true`
      },
      {/* Button */
        id: 'button',
        label: "Button",
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 2 15 C 2 17 22 17 22 15 L 22 8 C 22 6 2 6 2 8 
                    L 2 15 M 1 18 C 1 20 23 20 23 18 L 23 16 C 23 18 1 18 1 16"/>
                </svg>`,
        content: `<input class="button centered" type="button" value="Click Me" 
                   data-gjs-droppable="false" data-gjs-draggable="true" data-gjs-custom-name="Button"/>`
      },
      //{/* Row */
        /*id: 'div',
        label: "Row",
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 1 1 L 1 23 L 23 23 L 23 1 L 2 1 
                           L 2 2 L 22 2 L 22 22 L 2 22 L 2 1 Z"/>
                </svg>`,
        content: `<div class="row row-cell" data-gjs-droppable="true" 
                   data-gjs-draggable="true" data-gjs-custom-name="Row"">
                  </div>`
      },*/
      {
        id: 'datafield',
        label: "Data Display",
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 1 1 L 1 4 L 6 4 L 6 13 L 8 13 L 8 4 L 13 4 L 13 1 Z"/>
                  </svg>`,
        content: `<div class="output data-output centered" data-gjs-droppable="false" 
          data-gjs-draggable="true" data-gjs-custom-name="Data-Out">Placeholder</div>`
      },
      {
        id: 'text-input',
        label: "Text Input",
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 1 23 L 23 23 L 23 21 L 1 21 Z M 1 19 
                            L 9 19 L 9 17 L 6 17 L 6 4 L 9 4 L 9 2 
                            L 1 2 L 1 4 L 4 4 L 4 17 L 1 17 Z"/>
                </svg>`,
        content: `<input class="input text-input centered" data-gjs-droppable="false" 
                   data-gjs-draggable="true" data-gjs-custom-name="Text-Input">`
      },
      {
        id: 'two-row-block',
        label: '2 Columns',
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 1 1 L 1 23 L 12 23 L 12 1 L 2 1 
                    L 2 2 L 11 2 L 11 22 L 2 22 L 2 1 Z 
                    M 13 1 L 13 23 L 24 23 L 24 1 L 14 1 
                    L 14 2 L 23 2 L 23 22 L 14 22 L 14 1 Z/>"
                </svg>`,
        content: `
        <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row">
          <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
          <div class="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
        </div>`
      },
      {
        id: 'the-form-block',
        label: 'Form',
        media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 2 1 A 1 1 0 0 0 1 2 L 1 22 A 1 1 0 0 0 2 23 L 22 23 
                    A 1 1 0 0 0 23 22 L 23 2 A 1 1 0 0 0 22 1 L 3 1 L 3 2 L 21 2 
                    C 22 2 22 2 22 3 L 22 21 C 22 22 22 22 21 22 L 3 22 C 2 22 2 22 2 21 
                    L 2 3 C 2 2 2 2 3 2 L 3 1 Z M 3 4 L 20 4 L 20 6 L 3 6 Z M 3 8 L 20 8 
                    L 20 10 L 3 10 Z M 3 12 L 20 12 L 20 14 L 3 14 Z/>"
                </svg>
      `,
        content: `
        <form class="generic-background form" data-gjs-droppable=".button, .input" 
         data-gjs-draggable="true" data-gjs-custom-name="Form">
          <input class="button button-class centered" type="button" value="Click Me" 
           data-gjs-droppable="false" data-gjs-draggable="true" data-gjs-custom-name="Form-Button">
        </form>`
      },
      {
        id: 'iterative-output-block',
        label: "Iterative Output",
        media: `<svg style="width:24px; height:24px" viewBox=0 0 24 24>
                  <path d="M 2 1 A 1 1 0 0 0 1 2 L 1 22 A 1 1 0 0 0 2 23 L 22 23 
                    A 1 1 0 0 0 23 22 L 23 2 A 1 1 0 0 0 22 1 L 3 1 L 3 2 L 21 2 
                    C 22 2 22 2 22 3 L 22 21 C 22 22 22 22 21 22 L 3 22 C 2 22 2 22 2 21 
                    L 2 3 C 2 2 2 2 3 2 L 3 1 Z M 3 20 A 1 1 0 0 0 4 21 L 20 21 
                    A 1 1 0 0 0 21 20 L 21 16 A 1 1 0 0 0 20 15 L 4 15 A 1 1 0 0 0 3 16 Z 
                    M 3 13 A 1 1 0 0 0 4 14 L 20 14 A 1 1 0 0 0 21 13 L 21 10 A 1 1 0 0 0 20 9 
                    L 4 9 A 1 1 0 0 0 3 10 L 3 13 M 4 3 A 1 1 0 0 0 3 4 L 3 7 A 1 1 0 0 0 4 8 
                    L 20 8 A 1 1 0 0 0 21 7 L 21 4 A 1 1 0 0 0 20 3 Z"/>
                </svg>`,
        content: `
        <div class="row generic-background" data-gjs-draggable="true" data-gjs-custom-name="Iterable">
          <div class="generic-iterable-background iteration" data-gjs-droppable=".output" data-gjs-draggable="true" data-gjs-custom-name="Iteration"></div>
        </div>
        `

      }
    ], 
  },
});

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

/* This is how to set up a DOM Component. First argument is the type(type='row'), second argument is a JSON.
   uncertain what isComponent does. defaults set the component when it is dragged into frame.
   draggable determines which components it can be a child of. droppable determines which components can become a child
   of this component. Attributes gives other attributes like class. Traits are customizable attributes that the user can set.
   Only names of attributes are provided in traits. */
editor.DomComponents.addType('row', {
  isComponent: el => el.tagName === 'DIV',
  model:{
    defaults: {
      tagName: 'div',
      draggable: true,
      droppable: true,
      attributes:{
        class:"row row-cell",
      },
      traits: [
        "a",
        "b",
        "c"
      ],
    }
  }
});

/* This creates new blocks using a function */
editor.Blocks.add('row', {
  label: "Row",
  media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path d="M 1 1 L 1 23 L 23 23 L 23 1 L 2 1 
                           L 2 2 L 22 2 L 22 22 L 2 22 L 2 1 Z"/>
                </svg>`,
  content:{type: 'row'},
})

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
  console.log("Update");
  //console.log(editor.getHtml());
  /* The below statement prints the component */
  /* Statement below ensures no infinite component update loop occurs */
  if(prevent_endless_component_update_switch){
    const attributes = e.attributes.attributes; 
    if(e.attributes["custom-name"] == "Iterator") {

    } else if(e.attributes["custom-name"] == 'Button'){
      modify_button_traits(e);
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

loadData(function(err, res){
  if(res){
    editor.loadProjectData(res.data);    
  }
  loading = false;
});
