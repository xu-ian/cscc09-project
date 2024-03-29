import { createServer } from "http";
import { readFileSync, writeFile, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import express from "express";
import {Server as SocketIOServer} from 'socket.io';
import multer from "multer";
import mongoose, { model } from "mongoose";
import {Models} from "./schemas.mjs";
import {Validators} from "./validators.mjs";
import {validationResult} from 'express-validator';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from "firebase-admin/auth";
import session from 'express-session';
import helmet from "helmet";
import cors from 'cors';

/* Upload path for files */
const upload = multer({ dest: 'uploads/' });

const PORT = 4000;

/*const privateKey = readFileSync('server.key');
const certificate = readFileSync('server.crt');
const config = {
  key: privateKey,
  cert: certificate,
}*/

const app = express();

const firebase = initializeApp({
  apiKey: "AIzaSyAttQ4C1sxnVuGG9vuFZgg4dGOVAFdGgXo",
  authDomain: "cscc09-porject.firebaseapp.com",
  projectId: "cscc09-porject",
  storageBucket: "cscc09-porject.appspot.com",
  messagingSenderId: "975485542126",
  appId: "1:975485542126:web:ddb30c608e4039d403ddff",
  measurementId: "G-8D92M4DV33"
});

const firebaseAuth = getAuth(firebase);

let io = null;

let sockets = {};

let socketval = [];


/* Helper Functions */

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Generates a random string of length */
const generateString = function(length) {
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

app.use(express.json());

/* Change this later */
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.static("static"));

app.use(helmet());

app.use(
  session({
    secret: "please change this secret",
    resave: false,
    saveUninitialized: true,
    httpOnly: true,
    secure: true,
    sameSite: true,
  })
);

/* Mongoose connection */
await mongoose.connect('mongodb+srv://ianxu:Hm8o6o41fmfd92o6@cluster0.v2qo3wb.mongodb.net/?retryWrites=true&w=majority');
console.log("Connected to database successfully");
const models = new Models(mongoose);
console.log("Loaded models successfully");

/** Loads validation models */
const validators = new Validators();

app.use(function (req, res, next) {
  //console.log("HTTP request", req.session.uid, req.method, req.url, req.body);
  next();
});

app.post("/", function (req, res, next) {
  res.json(req.body);
  next();
});

/* Stylesheet call for the grapesjs styles */
app.get("/stylesheet/:name", function(req, res, next){
  const out = readFileSync('./static/style/main.css');
  res.set({'Cross-Origin-Resource-Policy':'cross-origin'});
  return res.status(200).set({'Content-Type':'text/css'}).end(out);
});

/**************USER CALLS**************/

/** Adds a session cookie for the logged in user */
app.post("/authenticate/", function(req, res, next){
  const token = req.body.token;
  if(token){
    if(token == "Guest_User"){
      req.session.uid = "Guest_User";
      models.user.findOne({uid:"Guest_User"}).exec().then(function(user){

        if(!user) models.user.create({uid: "Guest_User", sites: []}).then(function(user){});

      });
      return res.status(200).send({message:"Authenticated as guest user"});
    }
    firebaseAuth.verifyIdToken(token).then(function(decodedToken){
      req.session.uid = decodedToken.uid;
      //Create does not need to succeed, just needs to make sure 
      //the user exists, if firebase has authenticated
      models.user.findOne({uid:decodedToken.uid}).exec().then(function(user){
        console.log(user);
        if(!user) models.user.create({uid: decodedToken.uid, sites: []}).then(function(user){});

      });
      return res.status(200).send({message:"Authenticated Successfully", uid: decodedToken.uid, username: decodedToken.name});

    }).catch(function(err){return res.status(401).end("Invalid Token");});
  } else {
    return res.status(401).end("Not logged in");
  }
});

/** Clears the logged in user's session cookie */
app.post("/logout/", function(req, res, next){
  try{
    req.session.destroy();
    return res.status(200).end("Logged out successfully");
  } catch(err){
    return res.status(500).end(err);
  }
});

/**************DATA CALLS**************/

/* This should only update the website, but because there is only one user 
   that cannot create more websites, we add and update in this one call */

/** Sets the current working website of a user */
app.post("/setSite/:webid", function(req, res, next){
  const webId = req.params.webid;

  if(!req.session.uid) return res.status(401).end("Not logged in");
  models.user.findOne({uid: req.session.uid}).populate("sites").exec().then(function(user){
    const site = user.sites.find(function(site){
      return site.webId == webId;
    });
    if(site){
      req.session.webId = webId;
      return res.status(200).send({message:"Set " + webId + " as working website"});
    } else {
      return res.status(404).end("Website not found");
    }
  }).catch(function(err){return res.status(500).end(err)});
});

/** Adds/Updates a website with data  */
app.post("/api/website/:webid/data", validators.web, function(req, res, next){

  /* Checks the session to make sure user is logged in */
  if(!req.session.uid) return res.status(401).end("Not logged in");

  const webid = req.session.webId;
  //const webid = req.params.webid;
  const data = req.body.data;
  const dom = req.body.dom;
  if(validationResult(req).errors.length > 0) return res.status(422).end("Invalid Website");

  models.web.findOneAndUpdate({webId: webid}, {data: data, dom: dom}, {new: true})
                              .exec().then(function(website){
    if(website){
      return res.status(200).json(website);//Website exists and has been updated
    } else {//Create the website instead with the parameters
      models.web.create({webId: webid, data: data, dom: dom}).then(function(website){

        return res.status(200).json(website);

      }).catch(function(err){return res.status(500).end(err)});
    }
  }).catch(function(err){return res.status(500).end(err)});
});


/** Gets the data of the website */
app.get("/api/website/:webid/data", validators.web, function(req, res, next){
  
  /* Checks the session to make sure user is logged in */
  if(!req.session.uid) return res.status(401).end("Not logged in");

  const webid = req.session.webId;
  //const webid = req.params.webid;
  if(validationResult(req).errors.length > 0) return res.status(422).end("Invalid Website");
  //Username here later when login is implemented

  //Gets the website
  models.web.findOne({webId: webid}, {data: 1, dom: 1}).exec().then(function(website){

    if(website) return res.status(200).json(website); //Website has been found
    else return res.status(404).end("Website not found") //Website not found

  }).catch(function(err){return res.status(500).end(err)});
});

/************WEBSITE CALLS*************/

/** Adds a new website */
app.post("/api/website/", function(req, res, next){

  const userid = req.session.uid;
  
  /* Checks the session to make sure user is logged in */
  if(!userid) return res.status(401).end("Not logged in");
    
  /* Creates a website */
  models.user.findOne({uid: userid}).exec().then(function(user){
    if(!user) return res.status(404).end("User not found");
    
    
    const web = {webId:generateString(32), users: [user._id], data: {
      "assets": [],
      "styles": [],
      "pages": [
        {
          "frames": [
            {
              "component": {
                "type": "wrapper",
                "stylable": [
                  "background",
                  "background-color",
                  "background-image",
                  "background-repeat",
                  "background-attachment",
                  "background-position",
                  "background-size"
                ],
                "attributes": {
                  "id": "i6e7"
                }
              },
              "id": "h6HnKwnYULWHGWTV"
            }
          ],
          "name":"main",
          "type": "main",
          "id": "iMlIUsPuIdbjnYFH"
        }
      ]
    }, dom: {}};
    models.web.create(web).then(function(web){
        user.sites.push(web._id);
        models.user.updateOne({uid: userid}, {sites: user.sites}).exec().then(function(user){
          return res.status(200).send(web);

        }).catch(function(err){return res.status(500).end(err)});

      }).catch(
        function(err){
          if(err.code == 11000) return res.status(409).end("Duplicate Entry");
          else return res.status(500).send(err);
      });
  }).catch(function(err){return res.status(500).end(err)});

});

/** Gets all websites for a given user */
app.get("/api/website/:webid?", function(req, res, next){

  //Optional parameter to specify a website
  const webId = req.params.webid;
  /* Checks the session to make sure user is logged in */
  if(!req.session.uid) return res.status(401).end("Not logged in");

  /* Set this to the id of the currently logged in user */
  const userid = req.session.uid;

  models.user.findOne({uid: userid}).populate("sites").exec().then(function(websites){

    if(webId){
      return res.status(200).send(websites);
    }
    return res.status(200).send(websites);

  }).catch(function(err){return res.status(500).end(err)});
});

/** Updates the website by adding or removing a user */
app.patch("/api/website/:webid/user/", function(req, res, next){
    const webId = req.params.webid;
    const action = req.body.action;
    const otheruser = req.body.user;
    /* Make this check the firebase db later */
    const userid = req.session.uid;
    if(!userid) return res.status(401).end("Not Signed In");

    models.user.findOne({uid:userid}).populate('sites').exec().then(function(user){
      const site = user.sites.find(function(site){
        return site.webId == webId;
      });
      if(!site) return res.status(404).end("Website not found");
      models.user.findOne({uid:otheruser}).populate('sites').exec().then(function(user){

        if(!user) return res.status(404).end("User not found");
        if(action == "add"){//Adds a new user to the website

          //Check user already has access to the website
          const site2 = user.sites.find(function(site){
            return site.webId == webId;
          });
          if(site2) return res.status(409).end("Cannot be added twice");

          //Adds the website id to the array
          user.depopulate('sites');
          user.sites.push(site._id);
          models.web.findOne({webId: webId}).exec().then(function(web){
            web.users.push(user._id);
            models.web.updateOne({webId: webId},{users: web.users}).exec();
          });
          models.user.updateOne({uid:otheruser}, {sites: user.sites}).exec().then(function(user){

            return res.status(200).json(user);

          }).catch(function(err){return res.status(500).end(err)});
         
        } else if(action == "remove"){//Removes a user from the website

          //Removes the website if it exists
          const index = user.sites.findIndex(function(site){
            return site.webId == webId;
          });
          user.depopulate('sites')
          if(index != -1){user.sites.splice(index, 1);}
          models.web.findOne({webId: webId}).exec().then(function(web){
            const removeIndex = web.users.findIndex(function(thisuser){
              return JSON.stringify(thisuser) == JSON.stringify(user._id); 
            });
            if(removeIndex != -1){web.users.splice(removeIndex, 1)}
            models.web.updateOne({webId: webId},{users: web.users}).exec();
            //Remove the website if the number of users is 0.
            if(web.users.length == 0){
              models.web.findOneAndDelete({webId: webId}, {users: web.users}).exec();
            }
          }).catch(function(err){console.log(err)});

          models.user.updateOne({uid:otheruser}, {sites:user.sites}).exec().then(function(user){

            return res.status(200).json(user);

          }).catch(function(err){return res.status(500).end(err)});
        
        } else {//Errors on unknown action
          return res.status(422).end("Invalid action");
        }
      }).catch(function(err){return res.status(500).end(err)});
    }).catch(function(err){return res.status(500).end(err)});
});

/** Deletes a website */
app.delete("/api/website/:webid", function(req, res, next){
  const webId = req.params.webid;
  
  const userid = req.session.uid;
  if(!userid) return res.status(401).end("Not Signed In");
  models.web.findOne({webId: webId}).populate("users").exec().then(function(web){

    //Check if the user has permissions to delete this website
    if(web.users.length == 1 && web.users[0].uid == userid){
      models.user.findOne({uid:userid}).then(function(user){
        const position = user.sites.findIndex(function(site){
          return JSON.stringify(site) == JSON.stringify(web._id); 
        });
        user.sites.splice(position, 1);
      
        //Removes the website from the user
        models.user.updateOne({uid:userid}, {sites:user.sites}).exec();
      
        //Removes the website entry from the database
        models.web.findOneAndDelete({webId: webId}).exec().then(function(result){
          return res.status(200).send(result);
        }).catch(function(err){return res.status(500).end(err)});

      }).catch(function(err){return res.status(500).end(err)});
    } else {
      return res.status(401).end("There are other people in this project");
    }
  }).catch(function(err){return res.status(500).end(err)});
});

/**************FORM CALLS**************/

/** Adds a form to the database */
app.post("/api/website/:webid/form/", validators.form, function(req, res, next){
  //Setting up passed information
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.body.id;
  const formName = req.body.name;
  
  //Checking input validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'body') ||
            err.path == 'name';
  });
  if(errors) return res.status(422).end("Malformed Input");

  //Adding the form
  const form = {formId: formId, webId: webId, name:formName, fields: []};
  models.form.create(form).then(function(form){
    return res.status(200).send(form);
  }).catch(function(err){

    if(err.code == 11000) return res.status(409).end("Duplicate Entry");
    else return res.status(500).send(err);

  });
});

/** Gets one form if the id is specified or all
 *  forms if no id is specified for a website  */
app.get("/api/website/:webid/form/:formid?", validators.form, function(req, res, next){
  //Setting up passed information
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;

  //Checking validation
  const weberror = validationResult(req).errors.find(function(err){
    return err.path == 'webid';
  });

  const formerror = validationResult(req).errors.find(function(err){
    return err.path == 'webid';
  });

  if(weberror) return res.status(422).end("Malformed Inputs");

  if(formId != null) { //Gets one form

    //Checks validation
    if(formerror) return res.status(422).end("Malformed Inputs");
    
    //Retrieves the form
    models.form.findOne({formId: formId, webId: webId}, 'formId name fields')
                        .populate('fields').exec().then(function(form){
      
      //Parses results of retrieval
      if(form == null) res.status(404).end("Form not found");
      else return res.status(200).json(form);

    }).catch(function(err){return res.status(500).send(err)});

  } else { //Gets all forms
    models.form.find({webId: webId}, 'formId name fields').populate('fields')
                     .exec().then(function(forms){

      //Parses results of retrieval
      if(forms == null) res.status(404).end("Forms not found");
      else return res.status(200).json(forms);

    }).catch(function(err){return res.status(500).send(err)});
  }
});

/** Removes a form by id */
app.delete("/api/website/:webid/form/:formid", validators.form, function(req, res, next){

  //Set up variables
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;
  
  //Input validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'formid' && err.location == 'params');
  });
  if(errors) return res.status(422).end("Malformed Input");

  //Deleting form
  models.form.findOneAndDelete({formId: formId, webId: webId}).exec().then(function(form){
    
    if(!form)res.status(404).send("Form not found");//Form isn't found
    else return res.status(200).json(form);//Form deleted

  }).catch(function(err){return res.status(500).send(err)});
});

/** Adds or removes fields from a form */
app.patch("/api/website/:webid/form/:formid/", validators.form, function(req, res, next){
  
  //Sets up variables
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;
  const formName = req.body.name;
  const action = req.body.action;
  const fieldName = req.body.field;
  const fieldId = req.body.fieldId;

  //input validators
  const totalErrors = validationResult(req).errors;
  const baseErrors = totalErrors.find(function(err){
    return err.path == 'webid' ||(err.path == 'formid' && err.location == 'params') || 
            err.path == 'action';
  });
  const addErrors = totalErrors.find(function(err){
    return err.path == 'field' || err.path == 'fieldId';
  });
  const removeErrors = totalErrors.find(function(err){
    return err.path == 'fieldId';
  });
  const nameErrors = totalErrors.find(function(err){
    return err.path == 'name';
  });
  //console.log(baseErrors);
  if(baseErrors){
    return res.status(422).end("Malformed Inputs");
  }

  /* Finds out if the form exists */
  models.form.findOne({formId: formId, webId: webId}).populate("fields").exec().then(function(form){
    if(action == "add"){//Handles adding a field
      
      //Returns an error if the form doesn't exist to be added to
      if(form == null) return res.status(404).end("Form not found");
      
      //More Input Validation
      if(addErrors) return res.status(422).end("Malformed Inputs");
      
      //Creates the field, then adds it to the form
      models.field.create({fieldId: fieldId, webId: webId, name: fieldName}).then(function(field){
        form.fields.push(field._id);
        models.form.updateOne({formId: formId, webId: webId}, {fields: form.fields}).exec().then(function(returns){
          
          return res.status(200).json(returns);//Returns the modification status
        }).catch(function(err){return res.status(500).end(err)});
      }).catch(function(err){
        
        if(err.code == 11000) return res.status(409).end("Duplicate Entry");//Duplicate entry
        else return res.status(500).end(err);//Some unknown error

      });
    } else if(action == "self"){//Handles modifying status of form
      console.log(nameErrors);
      //More input validation
      if(nameErrors) return res.status(422).end("Malformed Inputs");
  
      //Updates the name of the form
      models.form.updateOne({formId: formId, webId: webId}, {name: formName}).exec().then(function(returns){

        return res.status(200).json(returns);

      }).catch(function(err){return res.status(500).end(err)});

    } else { //Handles removing a field
      //More Input Validation  
      if(removeErrors) return res.status(422).end("Malformed Inputs");
        
      models.field.findOneAndDelete({fieldId: fieldId, webId: webId}).exec().then(function(field){
        if(field == null) return res.status(404).end("Field not found");
        else {
          if(form != null){//Removes the field from the form if it exists
            const foundindex = form.fields.indexOf(form.fields.find(function(field){
              return field.fieldId == fieldId;
            }));
            form.depopulate('fields');
            form.fields.splice(foundindex, 1);
            models.form.updateOne({formId: formId, webId: webId}, {fields: form.fields}).then(function(result){
              
              return res.status(200).json(result);

            }).catch(function(err){return res.status(500).end(err)});  
          } else {
            return res.status(200).end("Field deleted, but form does not exist");
          }
        }
      }).catch(function(err){return res.status(500).end(err)});
    }
  }).catch(function(err){return res.status(500).end(err)});
});

/* Adds a form instance for a form */
app.post("/api/website/:webid/form/:formid/forms", function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;

  //Validate stuff
  //Authenticate stuff
  models.form.findOne({webId: webId, formId: formId}).then(function(form){
    
    if(!form) return res.status(404).end("Form not found");

    models.forms.create({webId: webId, formId: formId, fields: req.body}).then(function(result){

      //console.log(result);
      return res.status(200).json(result);

    }).catch(function(err){return res.status(500).end(err)});

  }).catch(function(err){return res.status(500).end(err)});
});

app.get("/api/website/:webid/form/:formid/forms/:formiterid?", function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;
  const formiterId = req.params.formiterid;
  const start = req.query.start;
  const end = req.query.end;

  //Input Sanitization
  //Authentication

  if(formiterId){//Form Iteration is passed

    models.forms.findOne({webId: webId, formId: formId, _id: formiterId}).exec().then(function(formIteration){
 
      if(!formIteration) return res.status(404).end("Form not found");
 
      return res.status(200).json(formIteration);
      
    }).catch(function(err){ return res.status(500).end(err)});
  } else {//Form Iteration is not passed
    models.forms.find({webId: webId, formId: formId}).sort({date: 1}).skip(start).limit(end).exec().then(function(formIterations){

      return res.status(200).json(formIterations);

    }).catch(function(err){ return res.status(500).end(err) });
  }
});

app.delete("/api/website/:webid/form/:formid/forms/:formiterid", function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const formId = req.params.formid;
  const formiterId = req.params.formiterid;

  //Input Sanitiziation
  //Authentication

  models.forms.findOneAndDelete({webId: webId, formId: formId, _id: formiterId}).exec().then(function(formiter){

    return res.status(200).json(formiter);

  }).catch(function(err){return res.status(500).end(err)});
});

/*************DISPLAY CALLS*************/

/** Adds a display to the database */
app.post("/api/website/:webid/display", validators.display, function(req, res, next){
  
  //Sets up inputs
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const displayId = req.body.displayid;
  const name = req.body.name;
  
  //Input Validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || err.path == 'name' || (err.path == 'displayid' && err.location == 'body');
  });
  if(errors) return res.status(422).end("Malformed Inputs");

  //Add display into database
  const display = {displayId: displayId, webId: webId, name: name, fields:[]};
  models.display.create(display).then(function(out){
    return res.status(200).json(display);
  }).catch(function(err){
    if(err.code == 11000) return res.status(409).end("Duplicate Entry");//Duplicate Entry
    else return res.status(500).end(err);//Unknown Error
  });
});

//Unused
/** Gets one display if the id is specified or all
 *  displays if no id is specified for a website  */
app.get("/api/website/:webid/display/:displayid?", validators.display, function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
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
app.patch("/api/website/:webid/display/:displayid/", validators.display, function(req, res, next){

  //Setting up Inputs
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const displayId = req.params.displayid;
  const displayName = req.body.name;
  const action = req.body.action;
  const ele = req.body.elements;
  const nav = req.body.navigateable;
  const form = req.body.form;
  const dataoutName = req.body.field;
  const dataoutId = req.body.fieldId;
  
  //Input Validation
  const totalErrors = validationResult(req).errors;
  const idErrors = totalErrors.find(function(err){
    return err.path == 'webid' || (err.path == 'displayid' && err.location == 'params');
  });
  if(idErrors){
    return res.status(422).end("Malformed Inputs");
  }
  const selfErrors = totalErrors.find(function(err){
    return err.path == 'webid' || err.path == 'elements' || err.path == 'navigateable' ||
      err.path == 'name' || err.path == 'form';
  });
  const addErrors = totalErrors.find(function(err){
    return err.path == 'webid' || err.path == 'fieldId' || err.path == 'field';
  });
  const removeErrors = totalErrors.find(function(err){
    return err.path == 'webid' || err.path == 'fieldId';
  });

  //Performing the display update
  models.display.findOne({webId: webId, displayId: displayId})
                         .populate('fields').exec().then(function(display){
    
    //Errors out if you are not removing a field and the display does not exist
    if(display == null && action != "remove") return res.status(404).end("Display not found");
    
    if(action == "self"){//Modifies properties of the display

      //More Input Validation
      if(selfErrors) return res.status(422).end("Malformed Inputs");

      //Updates the information of the display
      models.form.findOne({webId: webId, formId: form}).exec().then(function(form){
        
        if(form == null) form = {_id:null};

        models.display.findOneAndUpdate({displayId: displayId, webId: webId}, 
         {name: displayName, elements: ele, nav: nav, form: form._id}, {new: true})
         .populate('fields').exec().then(function(display){
          
          return res.status(200).json(display);

        }).catch(function(err){return res.status(500).end(err)});

      }).catch(function(err){return res.status(500).end(err)});

    } else if(action == "add"){//Adds a field to the display
      
      //More Input Validation
      if(addErrors) return res.status(422).end("Malformed Inputs");
      
      //Creates a new field to add to display
      models.dataout.create({dataoutId: dataoutId, webId: webId, name: dataoutName, 
                             display: display._id}).then(function(dataout){
      
        /* Updates the form with the new field */
        display.depopulate();
        display.fields.push(dataout._id);
        models.display.updateOne({displayId: displayId, webId: webId}, {fields: display.fields})
                                 .exec().then(function(returns){
          
          return res.status(200).json(returns);

        }).catch(function(err){return res.status(500).end(err)});
      }).catch(function(err){
        
        if(err.code == 11000) return res.status(409).end("Duplicate Entry");
        else return res.status(500).end(err);

      });  
    } else if(action == "remove"){//Removes a field from the display
      
      //More Input Validation
      if(removeErrors) return res.status(422).end("Malformed Inputs");

      models.dataout.findOneAndDelete({dataoutId: dataoutId, webId: webId})
                                      .exec().then(function(dataout){
        
        //Could not find the data field to delete
        if(!dataout) return res.status(404).end("Field not found");

        if(display != null){
          const foundindex = display.fields.indexOf(display.fields.find(function(field){
            return field.dataoutId == dataoutId;
          }));
          display.depopulate('fields');
          display.fields.splice(foundindex, 1);
          models.display.updateOne({displayId: displayId, webId: webId}, 
                                 {fields: display.fields}).then(function(result){
        
            return res.status(200).json(result);
        
          }).catch(function(err){return res.status(500).end(err)});  

        } else {
          return res.status(200).end("Field deleted, but form does not exist");
        }
      }).catch(function(err){return res.status(500).end(err)});
    } else {//Errors out due to unspecified action
      return res.status(422).end("Malformed Inputs");
    }

  }).catch(function(err){return res.status(500).end(err)});
});

/** Removes a display by id */
app.delete("/api/website/:webid/display/:displayid", validators.display, function(req, res, next){

  //Setting up inputs
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const displayId = req.params.displayid;

  //Checking input validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'displayid' && err.location == 'params');
  });
  if(errors) return res.status(422).end("Malformed Input");

  //Deleting the display
  models.display.findOneAndDelete({displayId: displayId, webId: webId}).
                                  exec().then(function(deleted){

    if(deleted) return res.status(200).json(deleted);//Deleted the display
    else return res.status(404).end("Display not found");//Could not find display

  }).catch(function(err){return res.status(500).send(err)});
});

/**************FIELD CALLS**************/

/** Adds a field to the database */
app.post("/api/website/:webid/field/", validators.field, function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.body.fieldid;
  const name = req.body.name;

  //Input Validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'body') || err.path == 'name';
  });
  if(errors) return res.status(422).end("Malformed Input");

  //Creating the new field
  const field = {fieldId: fieldId, webId: webId, name: name};
  models.field.create(field).then(function(ack){

    return res.status(200).json(ack);

  }).catch(function(err){

    if(err.code == 11000) return res.status(409).end("Field already exists");//Duplicate field
    else return res.status(500).end(err);//Unknown error

  });
});

/** Updates a field by field Id */
app.patch("/api/website/:webid/field/:fieldid/", validators.field, function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  const name = req.body.name;

  //Input Validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'params') || err.path == 'name';
  });
  if(errors) return res.status(422).end("Malformed Input");

  //Updating the field
  models.field.findOneAndUpdate({webId: webId, fieldId: fieldId}, 
   {name: name}, {new: true}).exec().then(function(field){

    if(field == null) return res.status(404).end("Field not found");//Could not find field
    else return res.status(200).json(field); //Updated Field

  }).catch(function(err){ return res.status(500).end(err)});
});

/** Removes a field by field Id */
app.delete("/api/website/:webid/field/:fieldid/", validators.field, function(req, res,next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  
  //Checking input validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'params');
  });
  if(errors) return res.status(422).end("Malformed Input");
  
  //Deleting Field
  models.field.findOneAndDelete({webId: webId, fieldId: fieldId}).exec().then(function(field){
    
    if(field) return res.status(200).json(field);//Field Deleted
    else return res.status(404).end("Field not found");//Field not found

  }).catch(function(err){return res.status(500).end(err)});
});

/************DATAFIELD CALLS************/

/** Adds a field to the database */
app.post("/api/website/:webid/datafield/", validators.dataout, function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.body.fieldid;
  const name = req.body.name;
  
  //Input Validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'body') || err.path == 'name';
  });
  if(errors) return res.status(422).end("Malformed Input");
  
  //Adds the field
  const field = {dataoutId: fieldId, webId: webId, name: name};
  models.dataout.create(field).then(function(ack){
 
    return res.status(200).json(ack);
 
  }).catch(function(err){
    if(err.code == 11000) return res.status(409).end("Data Field already exists");//Duplicate Field
    else return res.status(500).end(err);//Unknown Error
    
  });
});

/** Updates a field by field Id */
app.patch("/api/website/:webid/datafield/:fieldid/", validators.dataout, function(req, res, next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  const inputfield = req.body.field;
  const name = req.body.name;

  //Input Validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'params') || 
            err.path == 'name' || err.path == 'field';
  });
  if(errors) return res.status(422).end("Malformed Input");
  
  //Updates the Data Field
  models.field.findOne({webId: webId, fieldId: inputfield}).exec().then(function(inputfieldvalue){

    if(inputfieldvalue != null) inputfieldvalue = inputfieldvalue._id;

    models.dataout.findOneAndUpdate({webId: webId, dataoutId: fieldId}, 
     {name: name, field: inputfieldvalue}, {new: true}).exec().then(function(dataout){

      if(dataout) return res.status(200).json(dataout);//Successful Update
      else return res.status(404).end("Data field not found");//Data Field not found
      
    });

  }).catch(function(err){return res.status(500).end(err)})
});

/** Removes a field by field Id */
app.delete("/api/website/:webid/datafield/:fieldid/", validators.dataout, function(req, res,next){
  const webId = req.session.webId;
  //const webId = req.params.webid;
  const fieldId = req.params.fieldid;
  
  //Checking input validation
  const errors = validationResult(req).errors.find(function(err){
    return err.path == 'webid' || (err.path == 'fieldid' && err.location == 'params');
  });
  if(errors) return res.status(422).end("Malformed Input");
  
  //Deleting Data Field
  models.dataout.findOneAndDelete({webId: webId, dataoutId: fieldId}).exec().then(function(dfield){

    if(dfield) return res.status(200).json(dfield);//Deleted
    else return res.status(404).end("Data field not found");//Data Field not found
    
  }).catch(function(err){return res.status(500).end(err)});

});


//const createdserver = createServer(config, app)
const createdserver = createServer(app)

/* Websocket code */
io = new SocketIOServer(createdserver, {cors: {origin: '*'}});

/* Add socket functionality to socket when a new socket connects to the backend */
io.on("connection", (socket) => {
  //console.log(socket.upgradeReq.url);
  console.log("Socket connected: ", socket.id);
  sockets[socket.id] = {x: 0, y:0};

  /* Add the socket to a list of sockets */
  socketval.push(socket);

  /* Updates the position of the mouse from the socket */
  socket.on("mousePosition", (position) =>{
    sockets[socket.id].x = position.x;
    sockets[socket.id].y = position.y;
  });

  /* Sends a WebRTC Offer to a socket */
  socket.on("SendAudioLink", function(data){
    console.log("Sent and audio link to:", data.to);
    const dstsocket = socketval.find(function(sock){
        return sock.id == data.to;
    });

    if(dstsocket){
      data.to = socket.id;
      dstsocket.emit("ReceiveAudioLink", data);  
    }else {
      console.log(data.to, "does not exist");
    }
  });

  /* Sends a WebRTC answer to a socket */
  socket.on("SendAudioAnswer", function(data){
    const dstsocket = socketval.find(function(sock){
      return sock.id == data.to;
    });

    if(dstsocket){
      data.to = socket.id;
      dstsocket.emit("ReceiveAudioAnswer", data);
    }else {
      console.log(data.to, "does not exist");
    }
  });

  /* Sends ICE Candidates to a socket */
  socket.on("SendIceCandidate", function(data){
    //console.log("Sending Ice Candidate");
    const dstsocket = socketval.find(function(sock){
      return sock.id == data.to;
    });

    if(dstsocket){
      data.to = socket.id;
      dstsocket.emit("ReceiveIceCandidate", data);
    } else {
      console.log(data.to, "does not exist");
    }
  });

  socket.emit("WebsiteRequest", null);

  socket.on("WebsiteResponse", function(webid){
    //Set the website that the socket is attached to.
    sockets[socket.id].webid = webid;

    /* Tell all connected sockets about the new socket */
    socketval.forEach(function(sock){
      if(sock.webid == webid){
        sock.emit("newConnection", {sock: socket.id});
      }
    });

    socketval.find(function(sock){
      return socket.id == sock.id;
    }).webid = webid;
    
    /* Tells all connected sockets that a socket has disconnected */
    socket.on("disconnect", function(){
      console.log("Socket disconnected: ", socket.id);
      socketval.splice(socketval.indexOf(socket), 1);
      delete sockets[socket.id];
      socketval.forEach(function(sock){
        if(sock.webid == webid){
          sock.emit("connectionLoss", {sock: socket.id});
        }
      });
    });

    socket.on("MediaChange", function(data){
      socketval.forEach(function(socket){
        if(socket.id != data.to){
          socket.emit("ReceiveMediaChange", data);
        }
      });
    });

    const keys = Object.keys(sockets).filter(function(sock){
      return sock != socket.id;
    });

    let socketids = [];

    if(keys.length == 1){
      if(sockets[keys].webid == webid){
        socketids.push(keys);
      } 
    } else{
      keys.forEach(function(key){
        if(sockets[key].webid == webid){
          socketids.push(key);
        }
      });
    }

    /* Sends an ack to the socket with all the other existing sockets */
    socket.emit("Acknowledge", socketids);      
  });

  socket.on("chatMessage", (data)=>{
    console.log('chatMessage', data)
    io.emit('chatMessage', data)
  })



  /* Sends information to all sockets about mouse position every 100ms */
  setInterval(function(){
    socket.emit("mousePositions", sockets);
  }, 100);
});

// app.use(express.static("static"));
// app.use("*/grapesjs", express.static("node_modules/grapesjs"));

export const server = createdserver.listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on port %s", PORT);
});

export const application = app;

export function closeMongoDB(){
  mongoose.disconnect();
}