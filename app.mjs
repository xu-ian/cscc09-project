import { createServer } from "http";
import { readFileSync, writeFile, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import express from "express";
import multer from "multer";
import mongoose, { model } from "mongoose";
import {Models} from "./schemas.mjs";

/* Upload path for files */
const upload = multer({ dest: 'uploads/' });

const PORT = 3000;

const app = express();

let models = null;

app.use(express.json());

app.use(express.static("static"));

app.use("*/grapesjs", express.static("node_modules/grapesjs"));

/* Mongoose connection */
await mongoose.connect('mongodb+srv://ianxu:Hm8o6o41fmfd92o6@cluster0.v2qo3wb.mongodb.net/?retryWrites=true&w=majority');
console.log("Connected to database successfully");
models = new Models(mongoose);
console.log("Loaded models successfully");

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.post("/", function (req, res, next) {
  res.json(req.body);
  next();
});

/** Adds a form to the database */
app.post("/api/website/:webid/form/", function(req, res, next){
  const webId = req.params.webid;
  const formId = req.body.id;
  const formName = req.body.name;
  //Checks to see if inputs are valid
  if(typeof formId != "string" || typeof formName != "string"){
    return res.status(422).end("Invalid Inputs");
  }
  models.form.findOne({formId: formId}).exec().then(function(out){
    if(out != null) { //Checks to see if form already exists
      res.status(409).end("Duplicate Entry");
    } else { //Add form into database
      const form = {formId: formId, webId: webId, name:formName, fields: []};
      models.form.create(form).then(
      function(out){
        //Add a statement that checks the parameters of out are valid
        return res.status(200).send(form);
      }).catch(function(err){
        console.log(err);
        return res.status(500).send(err);
      });
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).send(err);    
  });
});

/** Gets one form if the id is specified or all
 *  forms if no id is specified for a website  */
app.get("/api/website/:webid/form/:formid?", function(req, res, next){
  const webId = req.params.webid;
  const formId = req.params.formid;

  if(formId != null) { //Gets one form
    models.form.findOne({formId: formId, webId: webId}, 'formId name fields').populate('fields').exec().then(function(form){
      if(form == null){
        res.status(404).send("Form not found");
      } else {
        return res.status(200).json(form);
      }
    }).catch(function(err){
      console.log(err);
      return res.status(500).send(err);
    });
  } else { //Gets all forms
    models.form.find({webId: webId}, 'formId name fields').populate('fields').exec().then(function(forms){
      if(forms == null){
        res.status(404).send("Forms not found");
      } else {
        return res.status(200).json(forms);
      }
    }).catch(function(err){
      console.log(err);
      return res.status(500).send(err);
    });
  }
});

/** Removes a form by id */
app.delete("/api/website/:webid/form/:formid", function(req, res, next){
  const webId = req.params.webid;
  const formId = req.params.formid;

  models.form.findOne({formId: formId, webId: webId}).exec().then(function(out){
    if(out == null){ // Checks if form exists
      res.status(404).send("Form not found");
    } else {  // Deletes form
      models.form.deleteOne({formId: formId}).then(
      function(deleted){
        return res.status(200).json(deleted);
      }).catch(function(err){
        console.log(err);
        return res.status(500).send(err);
      });
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).send(err);
  });
});

/** Adds or removes fields from a form */
app.patch("/api/website/:webid/form/:formid/", function(req, res, next){
  const webId = req.params.webid;
  const formId = req.params.formid;
  const formName = req.body.form;
  const action = req.body.action;
  const fieldName = req.body.field;
  const fieldId = req.body.fieldId;
  /* Pre checks if the inputs are valid */
  if((action != "add" && action != "remove" && action != "name") ||
     (typeof fieldName != "string" && action == "add") || 
     (typeof formName != "string" && action == "name") ||
     (typeof fieldId != "string" && (action == "add" || action == "remove"))){
    return res.status(422).end("Invalid Inputs");
  }
  /* Finds out if the form exists */
  models.form.findOne({formId: formId, webId: webId}).populate("fields").exec().then(function(form){
    if(form == null && action == "add"){//Returns an error if the form does not exist
      return res.status(404).end("Form not found");
    } else {
      if(action == "add"){//Handles adding a field
        models.field.findOne({fieldId: fieldId, webId: webId, name: fieldName}).exec().then(function(field){
          /* Fails if the field already exists */
          if(field != null){
            return res.status(409).end("Duplicate Entry")
          } else {
            /* Creates the field */
            models.field.create({fieldId: fieldId, webId: webId, name: fieldName}).then(function(field){
              /* Updates the form with the new field */
              form.fields.push(field._id);
              models.form.updateOne({formId: formId, webId: webId}, {fields: form.fields}).exec().then(function(returns){
                return res.status(200).json(returns);
              }).catch(function(err){
                console.log(err);
                return res.status(500).end(err);
              });
            }).catch(function(err){
              console.log(err);
              return res.status(500).end(err);
            });
    
          }
        }).catch(function(err){
          return res.status(500).end(err);
        });
      } else if(action == "name"){//Handles modifying status of form
        models.form.updateOne({formId: formId, webId: webId}, {name: formName}).exec().then(function(returns){
          return res.status(200).json(returns);
        }).catch(function(err){
          console.log(err);
          return res.status(500).end(err);
        });
      } else { //Handles removing a field
        models.field.findOne({fieldId: fieldId, webId: webId}).exec().then(function(field){
          if(field == null){
            return res.status(404).end("Field not found");
          } else {
            models.field.deleteOne({fieldId: fieldId, webId: webId}).then(function(result){
              if(form != null){
                const foundindex = form.fields.indexOf(form.fields.find(function(field){
                  return field.fieldId == fieldId;
                }));
                form.depopulate('fields');
                form.fields.splice(foundindex, 1);
                models.form.updateOne({formId: formId, webId: webId}, {fields: form.fields}).then(function(result){
                  return res.status(200).json(result);
                }).catch(function(err){
                  return res.status(500).end(err);
                });  
              } else {
                return res.status(200).end("Field deleted, but form does not exist");
              }
            }).catch(function(err){
              return res.status(500).end(err);
            });
          }
        }).catch(function(err){
          console.log(err);
          return res.status(500).end(err);
        });
      }
    }
  });
});

/** Adds a display to the database */
app.post("/api/website/:webid/display", function(req, res, next){
  const webId = req.params.webid;
  const displayId = req.body.id;
  const name = req.body.name;
  if(typeof displayId != "string" || typeof name != "string"){
    return res.status(422).end("Invalid Inputs");
  }
  models.display.findOne({displayId: displayId}).exec().then(function(out){
    if(out != null){
      res.status(409).end("Duplicate Entry");
    } else {
      //Add display into database
      const display = {displayId: displayId, webId: webId, name: name, fields:[]};
      models.display.create(display).then(
      function(out){
        return res.status(200).json(display);
      }).catch(function(err){
        console.log(err);
        return res.status(500).send(err);
      });
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).send(err);    
  });
});

/** Gets one display if the id is specified or all
 *  displays if no id is specified for a website  */
app.get("/api/website/:webid/display/:displayid?", function(req, res, next){
  const webId = req.params.webid;
  const displayId = req.params.displayid;
  if(displayId != null){
    models.display.findOne({displayId: displayId, webId: webId}, 'displayId name fields').
     populate('fields').exec().then(function(display){
      if(display == null){
        res.status(404).send("Display not found");
      } else {
        return res.status(200).json(display);
      }
    }).catch(function(err){
      console.log(err);
      return res.status(500).send(err);
    });
  } else {
    models.display.find({webId: webId}, 'displayId name form fields').populate('fields', 'form').exec().then(function(displays){
      if(displays == null){
        res.status(404).end("Displays not found");
      } else {
        return res.status(200).json(displays);
      }
    }).catch(function(err){
      console.log(err);
      return res.status(500).end(err);
    });
  }
});

/** Updates the display with a name, number of items per page, ability to change pages, or field */
app.patch("/api/website/:webid/display/:displayid/", function(req, res, next){
  const webId = req.params.webid;
  const displayId = req.params.displayid;
  const displayName = req.body.name;
  const action = req.body.action;
  const ele = req.body.elements;
  const nav = req.body.navigateable;
  const form = req.body.form;
  const fieldName = req.body.field;
  const fieldId = req.body.fieldId;
  let formId = null;

  models.display.findOne({webId: webId, displayId: displayId}).populate('fields').exec().then(function(display){
    if(display == null && action != "remove"){//Errors out if you are not removing a field and the display does not exist
      return res.status(404).end("Display not found");
    }
    if(action == "self"){//Modifies properties of the display
      console.log(ele && typeof ele != "number");
      console.log(nav && typeof nav != "boolean");
      console.log(displayName && typeof displayName != "string");
      console.log(form && typeof form != "string");
      if((ele && typeof ele != "number") || (nav && typeof nav != "boolean") || 
          (displayName && typeof displayName != "string") || (form && typeof form != "string")){
        return res.status(422).end("Invalid Inputs");
      }
      models.form.findOne({webId: webId, formId: form}).exec().then(function(form){
        if(form == null){
          return res.status(404).end("Form not found");
        }
        models.display.updateOne({displayId: displayId, webId: webId}, 
          {name: displayName, elements: ele, nav: nav, form: form._id}).exec().then(function(returns){
           //Check if returns did the correct actions
           models.display.findOne({webId: webId, displayId: displayId}).populate('fields').exec().then(function(display){
             return res.status(200).json(display);
           }).catch(function(err){
             console.log(err);
             return res.status(500).end(err);
           });
         }).catch(function(err){
           console.log(err);
           return res.status(500).end(err);
         });
      }).catch(function(err){
        console.log(err);
        return res.status(500).end(err);
      });
    } else if(action == "add"){//Adds a field to the display
      models.field.findOne({fieldId: fieldId, webId: webId}).exec().then(function(field){
        /* Fails if the field already exists */
        if(field != null){
          return res.status(409).end("Duplicate Entry")
        } else {
          /* Creates the field */
          models.dataout.create({dataoutId: fieldId, webId: webId, name: fieldName}).then(function(field){
            /* Updates the form with the new field */
            display.depopulate();
            display.fields.push(field._id);
            models.display.updateOne({displayId: displayId, webId: webId}, {fields: display.fields}).exec().then(function(returns){
              return res.status(200).json(returns);
            }).catch(function(err){
              console.log(err);
              return res.status(500).end(err);
            });
          }).catch(function(err){
            console.log(err);
            return res.status(500).end(err);
          });
  
        }
      }).catch(function(err){
        return res.status(500).end(err);
      });
    } else if(action == "remove"){//Removes a field from the display
      models.field.findOne({fieldId: fieldId, webId: webId}).exec().then(function(field){
        if(field == null){
          return res.status(404).end("Field not found");
        } else {
          models.field.deleteOne({fieldId: fieldId, webId: webId}).then(function(result){
            if(display != null){
              const foundindex = display.fields.indexOf(display.fields.find(function(field){
                return field.fieldId == fieldId;
              }));
              display.depopulate('fields');
              display.fields.splice(foundindex, 1);
              models.display.updateOne({displayId: displayId, webId: webId}, {fields: display.fields}).then(function(result){
                return res.status(200).json(result);
              }).catch(function(err){
                return res.status(500).end(err);
              });  
            } else {
              console.log("Display does not exist");
              return res.status(200).end("Field deleted, but form does not exist");
            }
          }).catch(function(err){
            return res.status(500).end(err);
          });
        }
      }).catch(function(err){
        console.log(err);
        return res.status(500).end(err);
      });
    } else{//Errors out due to unspecified action
      return res.status(422).end("Invalid Inputs");
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).end(err);
  });
});

/** Removes a display by id */
app.delete("/api/website/:webid/display/:displayid", function(req, res, next){
  const webId = req.params.webid;
  const displayId = req.params.displayid;

  models.display.findOne({displayId: displayId, webId: webId}).exec().then(function(out){
    if(out == null){
      res.status(404).send("Display not found");
    } else {
      models.display.deleteOne({displayId: displayId}).then(
      function(deleted){
        return res.status(200).json(deleted);
      }).catch(function(err){
        console.log(err);
        return res.status(500).send(err);
      });
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).send(err);
  });
});

/** Adds a field to the database */
app.post("/api/website/:webid/field/", function(req, res, next){
  const webId = req.params.webid;
  const fieldId = req.body.fieldid;
  const name = req.body.name;
  models.field.findOne({webId: webId, fieldId: fieldId}).exec().then(function(field){
    if(field != null){
      return res.status(409).end("Field already exists");
    } else {
      const field = {fieldId: fieldId, webId: webId, name: name};
      models.field.create(field).then(function(ack){
        return res.status(200).json(ack);
      }).catch(function(err){
        console.log(err);
        return res.status(500).end(err);
      })
    }
  });
});

/** Updates a field by field Id */
app.patch("/api/website/:webid/field/:fieldid/", function(req, res, next){
  const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  const name = req.body.name;

  models.field.findOne({webId: webId, fieldId: fieldId}).exec().then(function(field){
    if(field == null){
      return res.status(404).end("Field not found");
    } else {
      models.field.updateOne({webId: webId, fieldId: fieldId}, {name: name}).exec().then(function(ack){
        return res.status(200).json(ack);
      }).catch(function(err){
        console.log(err);
        return res.status(500).end(err);
      });
    }
  }).catch(function(err){
    console.log(err);
    return res.status(500).end(err);
  });
});

/** Removes a field by field Id */
app.delete("/api/website/:webid/field/:fieldid", function(req, res,next){
  const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  models.field.findOne({webId: webId, fieldId: fieldId}).exec().then(function(field){
    if(field == null){
      return res.status(404).end("Field not found");
    }else {
      models.field.deleteOne({webId: webId, fieldId: fieldId}).exec().then(function(ack){
        return res.status(200).json(ack);
      }).catch(function(err){
        console.log(err);
        return res.status(500).end(err);
      });
    }
  });
});

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});

export function closeMongoDB(){
  mongoose.disconnect();
}