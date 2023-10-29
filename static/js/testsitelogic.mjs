import {addForm, getForms, getForm, removeForm, updateFormName, addDisplay, removeDisplay, 
  updateDisplay, addDatafield, createDatafield, removeDatafield, updateDatafield, getDatafield, 
  deleteDatafield, addField, createField, updateField, removeField, deleteField, addPage, 
  removePage, getPages, getPage, addButton, getButton, removeButton, storeData, loadData} from './api.mjs';
//import grapesjs from '../../node_modules/grapesjs/dist/grapes.mjs';

//const editor = grapesjs.init({});

loadData(function(err, res){
  console.log(res);
  //editor.loadProjectData(res.data);
  const body = document.querySelector("body");
  //console.log(body);
  body.innerHTML = res.dom + body.innerHTML;
});
