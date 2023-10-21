import axios from 'axios'

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

/* This function declares that the provided id is a form */
export function addForm(id, web="Default"){
  axios.post('/api/website/'+web+'/form/',
    {
      'id': id, 
    }
  ).then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
};

/* Gets a form from the database by id */
export function getForm(id, web="Default"){
  //axios get the id
  axios.get('/api/website/'+web+'/form/' + id)
  .then((response) =>{
    return response;
  }, (error)=>{
    console.log(error);
    return null;
  })
};

/* This is fine since it is by website, so there shouldn't be that many
   forms in a website */
/* Gets all forms for the webpage */
export function getForms(web="Default"){
  axios.get('/api/website/'+web+'/form/')
  .then((response) =>{
    return response;
  }, (error)=>{
    console.log(error);
    return null;
  })
};

/* Removes a form from the database */
export function removeForm(id, web="Default"){
  axios.delete('/api/website/'+web+'/form/' + id)
  .then((response) =>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  })
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
export function addDynamicDisplay(displayId, formId, web="Default"){
  axios.post('/api/website/'+web+'/display/',
    {
      'displayId': displayId,
      'formId': formId, 
    }
  ).then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
  });
};

/* Removes a dynamic display from the database */
export function removeDynamicDisplay(displayId, web="Default"){
  axios.delete('/api/website/'+web+'/display/'+displayId
  ).then((response) =>{
    console.log(response);
  }, (error) =>{
    console.log(error);
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
  axios.update('/api/website/'+web+'/'+type+'/'+containerId, {
    "action": "add",
    "field": field, /* Does not have to be unique */
    "fieldId": fieldId, /* Has to be unique */
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
  });
};

/* Removes a field from the form/display/anything else
   type = 'display' or 'form' or nothing else yet */
export function removeField(containerId, fieldId, type, web="Default"){
  axios.update('/api/website/'+web+'/'+type+'/'+containerId, {
    "action": "remove",
    "fieldId": fieldId,
  }).then((response)=>{
    console.log(response);
  }, (error)=>{
    console.log(error);
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