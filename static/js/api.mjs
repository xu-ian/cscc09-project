//import {default as axios} from '../../node_modules/axios/lib/axios'

function send(method, url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200)
      callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  if (!data) xhr.send();
  else {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  }
}

/*********************DATA API*************************/

/*
  Data Structure:
  - User: User who owns the Website(Not Implemented)
  - Web: Id for the website
  - Data: GrapesJS data for the website
*/

/* Stores the DOM structure created by grapesjs into the database to be referenced. */
export function storeData(data, web="Default"){
  axios.post('/api/website/'+web+'/data/',{
    'data': data,
  }).then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
}

/* Get's the DOM for a website and loads it into grapesjs */
export function getData(web="Default"){
  axios.get('/api/website/'+web+'/data/')
  .then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
}


/*********************FORMS API*************************/

/*
  Forms Structure:
  - Web: Id for the website
  - Form: Id for the form
  - Fields: Array of field Ids 
*/

/** This function adds the provided id, name, and website id as a form */
export function addForm(id, name, web="Default"){
  console.log("Adding form");
  send('POST', '/api/website/'+web+'/form/', {'id': id, 'name': name,}, function(err, res){
    if(err) {
      console.log(err);
    } else {
      console.log(res);
    }
  });
};

/** Gets a form from the database by id */
export function getForm(id, callback, web="Default"){
  //axios get the id
  send("GET", '/api/website/'+web+'/form/' + id, null, function(err, res){
    if(err){
      console.log(err);
    } else{
      callback(err, res);
      console.log(res);
    }
  });
};

/* Updates the name of the form by id */
export function updateFormName(id, name, web="Default"){
  send("PATCH", "/api/website/"+web+"/form/"+id, {action: "name", "form": name,}, function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }
  });
}

/* This is fine since it is by website, so there shouldn't be that many
   forms in a website */
/** Gets all forms for the webpage */
export function getForms(callback, web="Default"){
  send("GET", '/api/website/'+web+'/form/', null, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
      callback(res);
    }
  });
};

/* Removes a form from the database */
export function removeForm(id, web="Default"){
  send("DELETE", '/api/website/'+web+'/form/' + id, null, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};


/*********************DISPLAY API*************************/

/*
  Display Structure:
  - Web: Id for the website
  - Display: Id for the display
  - Form: Id for the form the display takes data from
  - Fields: Array of Ids for fields it should display from the form
*/

/* Adds a dynamic display that takes values that are submitted from a formId
   and displays the fields in the submitted form dynamically. */
export function addDisplay(displayId, web="Default"){
  send("POST", '/api/website/'+web+'/display/', {id: displayId, name: ""}, function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }

  });
};

export function updateDisplay(displayId, name, elements, navigateable, form, web="Default"){
  send("PATCH", "/api/website/"+web+"/display/"+displayId,
  { name: name, elements: elements, navigateable: navigateable, form: form, action:"self"}, 
  function(err, res){
    if(err){
      console.error(err);
    }else{
      console.log(res);
    }
  });
}

/* Removes a dynamic display from the database */
export function removeDisplay(displayId, web="Default"){
  send("DELETE", "/api/website/"+web+"/display/"+displayId, null, 
  function(err, res){
    if(err){
      console.error(err);
    }else{
      console.log(res);
    }
  });
};

/*********************DATAFIELD API*************************/

/*
  Datafield Structure
  - Web: Id for the website
  - Datafield: Id for the datafield
  - Value: Value of the datafield that should be displayed
 */

/* Creates a new datafield */
export function addDatafield(dfId, web="Default"){
  axios.post('/api/website/'+web+'/datafield/',
    {
      'datafieldId': dfId,
    }
  ).then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
};

/* Gets a datafield */
export function getDatafield(dfId, web="Default"){
  axios.post('/api/website/'+web+'/datafield/'+dfId)
  .then((response) =>{
    console.log(response);
    return response;
  }, (error) =>{
    console.log(error);
    return null;
  });
};

/* Removes a datafield by id */
export function removeDatafield(dfId, web="Default"){
  axios.post('/api/website/'+web+'/datafield/'+dfId)
  .then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
};

/*********************FIELDS API*************************/

/* Adds a field to the form/display/anything else 
   type = 'display' or 'form' or nothing else yet. */
export function addField(containerId, field, fieldId, type, web="Default"){
  send("PATCH", '/api/website/'+web+'/'+type+'/'+containerId, {
    action: "add",
    field: field, /* Does not have to be unique */
    fieldId: fieldId, /* Has to be unique */
  },function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};

export function updateField(fieldId, field, web="Default"){
  send("PATCH", '/api/website/'+web+"/field/"+fieldId, {field: field}, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
}

/* Removes a field from the form/display/anything else
   type = 'display' or 'form' or nothing else yet */
export function removeField(containerId, fieldId, type, web="Default"){
  send("PATCH", '/api/website/'+web+'/'+type+'/'+containerId, {
    "action": "remove",
    "fieldId": fieldId,
  },function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};


/*********************PAGES API*************************/

/*
  Page Structure:
  - Web: Id for the website
  - Page: Id for the page
*/

/* Adds a page to the website */
export function addPage(pageId, web="Default"){
  axios.post('api/website/'+web+'/page/', {
    'id': pageId,
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/* Gets a page on the website */
export function getPage(pageId, web="Default"){
  axios.get('api/website/'+web+'/page/'+pageId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/* Gets all pages for a website. Should not have more than 100 entries for most websites.
   Average website is 10-30 pages. */
export function getPages(web="Default"){
  axios.get('api/website/'+web+'/page/'
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/* Deletes a page from the website */
export function removePage(pageId, web="Default"){
  axios.delete('api/website/'+web+'/page/'+pageId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/*********************BUTTONS API*************************/

/*
  Button Structure:
  - Web: Id for the website
  - Button: Id for the button
  - Function: Function of the button(form submit, page redirect, data aggregation)
  - Link: Id of object the function links to
*/

/* Adds a button. Optional parameter source determines what the button reads from if any.
   Functionalities:
   - form_submit: sourceId should be the formId
   - page_change: sourceId should be the pageId 
   - data_aggregate: sourceId should be [[source IDs], Destination ID]*/
export function addButton(buttonId, functionality, sourceId=null, web="Default"){
  axios.post('api/website/'+web+'/button/', {
    'id': buttonId,
    'function': functionality,
    'sourceId': sourceId,
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/* Gets a button */
export function getButton(buttonId, web="Default"){
  axios.get('api/website/'+web+'/button/'+buttonId
  ).then((response)=>{
    console.log(response);
    return response;
  }, (error)=>{
    console.log(error);
    return null;
  });
};

/* Removes a button */
export function removeButton(buttonId, web="Default"){
  axios.delete('api/website/'+web+'/button/'+buttonId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};