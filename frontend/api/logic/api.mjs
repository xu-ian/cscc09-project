import axios from 'axios'

//Replace with fetch or axios later
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

const host = `${process.env.NEXT_PUBLIC_BACKEND}`
// console.log('env', process.env)
//const host = "http://localhost:5000"

export function getPing(){
  send('GET', host + '/api/', null, function(err, res){
    if(err) console.log(err);
    else console.log(res);
  });
}


/**********************FRAMEWORK***********************/

/*********************DATA API*************************/

/*
  Data Structure:
  - User: User who owns the Website(Not Implemented)
  - Web: Id for the website
  - Data: GrapesJS data for the website
*/

/* Stores the DOM structure created by grapesjs into the database to be referenced. */
export function storeData(data, dom, web="Default"){
  send('POST', host + '/api/website/'+web+"/data/", {data: data, dom: dom}, function(err, res){
    if(err) console.log(err);
    else console.log(res);
  });
}

/* Get's the DOM for a website and loads it into grapesjs */
export function loadData(obj, callback, web="Default"){
  send('GET', host + '/api/website/'+web+'/data/', null, function(err, res){
    callback(err, res, obj);
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
  send('POST', host + '/api/website/'+web+'/form/', {'id': id, 'name': name,}, function(err, res){
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
  send("GET", host + '/api/website/'+web+'/form/' + id, null, function(err, res){
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
  send("PATCH", host + "/api/website/"+web+"/form/"+id, {action: "self", "name": name,}, function(err, res){
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
  send("GET", host + '/api/website/'+web+'/form/', null, function(err, res){
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
  send("DELETE", host + '/api/website/'+web+'/form/' + id, null, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};


/** Adds a form iteration to the database */
export function addFormIteration(formid, fields, web="Default"){
  send("POST", host + '/api/website/'+web+'/form/'+formid+"/forms", fields, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};

export function getFormIteration(formid, formIterId, web="Default"){
  send("GET", host + '/api/website/'+web+'/form/'+formid+'/forms/'+formIterId, null, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
}

export function getFormIterationPage(extr, formid, page, epp, callback, web="Default"){
  send("GET", host + '/api/website/'+web+'/form/'+formid+'/forms?start='+page+"&end="+epp, null, function(err, res){
    if(err){
      console.log(err);
    } else {
      callback(extr, res);
    }
  });
}

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
  send("POST", host + '/api/website/'+web+'/display/', {displayid: displayId, name: ""}, function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }

  });
};

export function updateDisplay(displayId, name, elements, navigateable, form, web="Default"){
  if(!elements){
    elements = 1;
  }
  if(!navigateable){
    navigateable = false;
  }
  send("PATCH", host + "/api/website/"+web+"/display/"+displayId,
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
  send("DELETE", host + "/api/website/"+web+"/display/"+displayId, null, 
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

export function addDatafield(displayId, df, dfId, web="Default"){
  send("PATCH", host + "/api/website/"+web+"/display/"+displayId,
  {action: "add", field: df, fieldId: dfId},
  function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }
  });
}

/* Creates a new datafield not attached to display */
export function createDatafield(dfId, web="Default"){
  send("POST", host + "/api/website/"+web+"/datafield/", 
  {datafieldid: dfId, name:""},
  function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }
  });
};

/* Gets a datafield attached to display */
export function getDatafield(dfId, web="Default"){
  /*axios.post('/api/website/'+web+'/datafield/'+dfId)
  .then((response) =>{
    console.log(response);
    return response;
  }, (error) =>{
    console.log(error);
    return null;
  });*/
};

/** Updates a datafield's name or data source */
export function updateDatafield(dfId, df, field, web="Default"){
  send("PATCH", host + "/api/website/"+web+"/datafield/"+dfId,
  {name: df, field: field},
  function(err, res){
    if(err){
      console.error(err);
    } else{
      console.log(res);
    }
  })
}

/** Removes an datafield attached to a display by id */
export function removeDatafield(displayId, dfId, web="Default"){
  send("PATCH", host + "/api/website/"+web+"/display/"+displayId,
  {action: "remove", fieldid: dfId},
  function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }
  });
};

/* Removes a datafield not attached to display by id */
export function deleteDatafield(dfId, web="Default"){
  send('DELETE', host + '/api/website/'+web+'/datafield/'+dfId, null,
  function(err, res){
    if(err){
      console.error(err);
    } else {
      console.log(res);
    }
  });
};

/*********************FIELDS API*************************/

/* Adds a field to the form/display/anything else 
   type = 'display' or 'form' or nothing else yet. */
export function addField(formId, field, fieldId, web="Default"){
  send("PATCH", host + '/api/website/'+web+'/form/'+formId, {
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

/** Creates a field not associated to anything */
export function createField(fieldId, name, web="Default"){

}

/** Updates the name of a field by id */
export function updateField(fieldId, field, web="Default"){
  send("PATCH", host + '/api/website/'+web+"/field/"+fieldId, 
       {name: field}, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
}

/* Removes a field from the form/display/anything else
   type = 'display' or 'form' or nothing else yet */
export function removeField(formId, fieldId, web="Default"){
  send("PATCH", host + '/api/website/'+web+'/form/'+formId, {
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

/** Removes a field not associated with a field by id */
export function deleteField(fieldId, web="Default"){

}

/*********************PAGES API*************************/

/*
  Page Structure:
  - Web: Id for the website
  - Page: Id for the page
*/

/* Adds a page to the website */
export function addPage(pageId, web="Default"){
  /*axios.post('api/website/'+web+'/page/', {
    'id': pageId,
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
};

/* Gets a page on the website */
export function getPage(pageId, web="Default"){
  /*axios.get('api/website/'+web+'/page/'+pageId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
};

/* Gets all pages for a website. Should not have more than 100 entries for most websites.
   Average website is 10-30 pages. */
export function getPages(web="Default"){
  /*axios.get('api/website/'+web+'/page/'
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
};

/* Deletes a page from the website */
export function removePage(pageId, web="Default"){
  /*axios.delete('api/website/'+web+'/page/'+pageId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
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
export function addButton(buttonId, name, web="Default"){
  /*axios.post('api/website/'+web+'/button/', {
    'id': buttonId,
    'function': functionality,
    'sourceId': sourceId,
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
};

/* Gets a button */
export function getButton(buttonId, web="Default"){
  /*axios.get('api/website/'+web+'/button/'+buttonId
  ).then((response)=>{
    console.log(response);
    return response;
  }, (error)=>{
    console.log(error);
    return null;
  });*/
};

/* Removes a button */
export function removeButton(buttonId, web="Default"){
  /*axios.delete('api/website/'+web+'/button/'+buttonId
  ).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });*/
};

/**********************INSTANCE***********************/
export function addFormInstance(inputs, formid, web="Default"){
  send("POST", host + "/api/webiste/"+web+"/form/"+formid,
  inputs, function(err, res){
    if(err){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};

export function getFormInstance(formid, perpage, pagenumber, web="Default"){
  send("GET", host + "/api/website/"+web+"/form"+formid+"?page="+pagenumber+"&perpage="+perpage,
    null, function(err, res){
      if(err){
        console.log(err);
      } else {
        console.log(res);
      }
    });
};