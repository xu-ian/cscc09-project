import React from "react";
import { useEffect } from "react";
import grapesjs, { Editor } from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';
import 'grapesjs/dist/css/grapes.min.css'
import './styles/main.css'
import {getChoice, getSelectForm, getOperations, getDestination} from './logic/helper.mjs';
import {addForm, getForms, getForm, removeForm, updateFormName, addDisplay, removeDisplay, 
        updateDisplay, addDatafield, createDatafield, removeDatafield, updateDatafield, getDatafield, 
        deleteDatafield, addField, createField, updateField, removeField, deleteField, addPage, 
        removePage, getPages, getPage, addButton, getButton, removeButton, storeData, loadData} from './logic/api.mjs'

function Builder() {
  

  const onEditor = (editor) => {
    console.log('Editor loaded', { editor });

  };

  return (
    <div>    
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={{
          height:'490pt',
          container : '#gjs',
          fromElement: true,
          showOffsets: true,
          canvas: {
            styles: ['http://localhost:5000/stylesheet/main'],    
          },
          //StorageManager: false,
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
                content: `<input className="button centered" type="button" value="Click Me" 
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
                content: `<div className="output data-output centered" data-gjs-droppable="false" 
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
                content: `<input className="input text-input centered" data-gjs-droppable="false" 
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
                <div className="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row">
                  <div className="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
                  <div className="row row-cell" data-gjs-droppable="true" data-gjs-draggable="true" data-gjs-custom-name="Row"></div>
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
                <form className="generic-background form" data-gjs-droppable=".button, .input" 
                 data-gjs-draggable="true" data-gjs-custom-name="Form">
                  <input className="button button-class centered" type="button" value="Click Me" 
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
                <div className="row generic-background" data-gjs-draggable="true" data-gjs-custom-name="Iterable">
                  <div className="generic-iterable-background iteration" data-gjs-droppable=".output" data-gjs-draggable="true" data-gjs-custom-name="Iteration"></div>
                </div>
                `
        
              }
            ], 
          },
        }}
        onEditor={onEditor}
      >

      </GjsEditor>
      <a class="centered" href="credits">credits</a>
    </div>
  )
}

export default Builder;