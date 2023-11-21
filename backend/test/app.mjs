import { readFileSync } from "fs";
import chai from "chai";
import chaiHttp from "chai-http";

import { server, closeMongoDB, application } from "../app.mjs";
const expect = chai.expect;
chai.use(chaiHttp);

/* Global variable to keep track of new ids, so they can be deleted when finished. */
let testformId = null;
let testwebId = null;
const agent = chai.request.agent(application);

describe("Testing API", () => {
  after(function () {
    server.close();
    closeMongoDB();
  });

  /* User login test cases */
  it("it should successfully authenticate a user", function(done){
    agent
      .post("/authenticate/")
      .set("content-type", "application/json")
      .send(JSON.stringify({token:"Guest_User"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.text).to.equal("Authenticated as guest user");
        done();
      });
  });

  it("it should not authenticate an invalid token", function(done){
    chai.request(server)
      .post("/authenticate/")
      .set("content-type", "application/json")
      .send(JSON.stringify({token:"Unknown"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(401);
        expect(res.text).to.equal("Invalid Token");
        done();
      });
  });

  /* Website test cases */
  it("it should add a website successfully", function(done){
    agent
      .post("/api/website/")
      .send("")
      .then((res2) =>{
        console.log("Finished adding website");
        expect(res2.status).to.equal(200);
        testwebId = res2.body.webId;
        done();
      });
  });

  it("it should add a user to a website successfully", function(done){
    agent
      .patch("/api/website/"+testwebId+"/user")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", user:"Guest_User_2"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.modifiedCount).to.equal(1);
        done();
      });
  });

  it("it should not add a duplicate user to a website", function(done){
    agent
      .patch("/api/website/"+testwebId+"/user")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", user:"Guest_User"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        done();
      });
  });

  it("it should remove a user from a website successfully", function(done){
    agent
      .patch("/api/website/"+testwebId+"/user")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", user:"Guest_User_2"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        console.log(res.body);
        expect(res.body.modifiedCount).to.equal(1);
        done();
      });
  });

  it("it should not remove a user from a website that does not exist", function(done){
    agent
      .patch("/api/website/nowebsite/user")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", user:"Guest_User_2"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        done();
      });
  });

  /* Form test cases */
  it("it should add an form successfully", function (done) {
    chai.request(server)
      .post("/api/website/testweb/form/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"id":"testid", "name": "testform"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.formId).to.equal("testid");
        expect(res.body.webId).to.equal("testweb");
        expect(res.body.name).to.equal("testform");
        expect(res.body.fields.length).to.equal(0);
        done();
      });
  });

  it("it should not add a form if information is missing", function (done) {
    chai.request(server)
      .post("/api/website/testweb/form/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"id":"testid"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Malformed Input");
        chai.request(server)
          .post("/api/website/testweb/form/")
          .send(JSON.stringify({"name":"testform"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Malformed Input");
            done();
          });
      });
  });

  it("it should not add a form with a duplicate form id", function(done){
    chai.request(server)
      .post("/api/website/testweb/form/")
      .set("content-type", "application/json")
      .send(JSON.stringify({id:"testid", name:"testform"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        expect(res.text).to.equal("Duplicate Entry");
        done();
      });
  });

  it("it should return an error not found if trying to delete and invalid form id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/form/invalidid")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Form not found");
        done();
      });
  });

  it("it should add a field to the fields of a form if given a valid web id, form id, and field id", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
        done();
      });      
  });

  it("it should not add a field to the fields of a form if the field id already exists", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        expect(res.text).to.equal("Duplicate Entry");
        done();
      });
  });

  it("it should return a single form if a form id is specified", function(done){
    chai.request(server)
      .get("/api/website/testweb/form/testid/")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.formId).to.equal('testid');
        expect(res.body.name).to.equal('testform');
        expect(res.body.webId).to.equal(undefined);
        expect(res.body.fields.length).to.equal(1);
        done();
      });
  });

  it("it should modify the name of a form given a valid name and form id", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid")
      .set("content-type", "application/json")
      .send(JSON.stringify({action: "self", name: "testform2"}))
      .end((err, res) => {
        expect(res.status).to.equal(200);
        chai.request(server)
          .get("/api/website/testweb/form/testid/")
          .end((err, res) =>{
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal("testform2");
            done();
          });
      });
  });

  it("it should return an error if an invalid form id is provided trying to get a form", function(done){
    chai.request(server)
      .get("/api/website/testweb/form/invalidId")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Form not found");
        done();
      });
  });

  it("it should return all forms for the website if no form id is provided when getting a form", function(done){
    chai.request(server)
      .post("/api/website/testweb/form/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"id":"testid2", "name": "testform2"}))
      .end((err, res) => {
        chai.request(server)
         .get("/api/website/testweb/form/")
          .end((err,res) =>{
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body.length> 1).to.equal(true);
            done();
          });
      });
  });

  it("it should remove the field from a form if the field exists", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
        done();
      });
  });

  it("it should fail to remove a field from a form if the field id does not exist", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", field: "testfield", fieldId: "invalidfieldId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Field not found");
        done();
      });
  });

  it("it should fail to add or remove a field from the form if the body of the request is invalid", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid")
      .set("content-type", "application/json")
      .send(JSON.stringify({field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Malformed Inputs");
        chai.request(server)
          .patch("/api/website/testweb/form/testid")
          .send(JSON.stringify({action:"remove", fieldId: "testfieldId"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Malformed Inputs");
            chai.request(server)
              .patch("/api/website/testweb/form/testid")
              .send(JSON.stringify({action:"add", field: "testfield"}))
              .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(422);
                expect(res.text).to.equal("Malformed Inputs");
                done();
              });
          });
      });
  });

  it("it should fail to add or remove a field to a form if the form id does not exist", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/invalidid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Form not found");
        chai.request(server)
          .patch("/api/website/testweb/form/invalidid/")
          .set("content-type", "application/json")
          .send(JSON.stringify({action:"remove", field: "testfield", fieldId: "testfieldId"}))
          .end((err, res) =>{
            expect(err).to.be.null;
            expect(res.status).to.equal(404);
            expect(res.text).to.equal("Field not found");
            done();
        });
      });
  });

  /* Form iteration test case */
  it("it should create a form itertion given a valid form id and webid", function(done){
    chai.request(server)
      .post("/api/website/testweb/form/testid/forms")
      .set("content-type", "application/json")
      .send(JSON.stringify({"field1":"value1", "field2": "value2"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        testformId = res.body._id;
        expect(res.body != null).to.equal(true);
        chai.request(server)
          .post("/api/website/testweb/form/testid/forms")
          .set("content-type", "application/json")
          .send(JSON.stringify({"field1":"value1", "field2": "value2"}))
          .end((err, res) => {        
            chai.request(server)
              .post("/api/website/testweb/form/testid/forms")
              .set("content-type", "application/json")
              .send(JSON.stringify({"field1":"value1", "field2": "value2"}))
              .end((err, res) => {        
                chai.request(server)
                  .post("/api/website/testweb/form/testid/forms")
                  .set("content-type", "application/json")
                  .send(JSON.stringify({"field1":"value1", "field2": "value2"}))
                  .end((err, res) => {        
                    done();
                  });
              });
          });
      });
  });

  it("it should get a form iteration given a valid form iteration id", function(done){
    chai.request(server)
      .get("/api/website/testweb/form/testid/forms/"+ testformId)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body._id).to.equal(testformId);
        done();
      });
  });

  it("it should get multiple form iterations given a valid form template id and a start and end", function(done){
    chai.request(server)
      .get("/api/website/testweb/form/testid/forms?start=1&end=2")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(2);
        done();
      });
  });

  it("it should delete a form iteration given a valid iteration id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/form/testid/forms/"+testformId)
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        done();
      });
  });

  /* Form test case final */
  it("it should delete a form given a valid form id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/form/testid")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.formId).to.equal("testid");
        expect(res.body.webId).to.equal("testweb");
        done();
      });
  });

  /* Display test cases */
  it("it should add an display successfully", function (done) {
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"displayid":"displayid", "name": "testdisplay"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.displayId).to.equal("displayid");
        expect(res.body.webId).to.equal("testweb");
        expect(res.body.name).to.equal("testdisplay");
        expect(res.body.fields.length).to.equal(0);
        done();
      });
  });

  it("it should not add a display if information is missing", function (done) {
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"displayid":"testid"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Malformed Inputs");
        chai.request(server)
          .post("/api/website/testweb/display/")
          .send(JSON.stringify({"name":"testform"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Malformed Inputs");
            done();
          });
      });
  });

  it("it should not add a display with a duplicate display id", function(done){
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({displayid:"displayid", name:"testdisplay"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        expect(res.text).to.equal("Duplicate Entry");
        done();
      });
  });

  it("it should add a field to the fields of a display if given a valid web id, display id, and field id", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
        done();
      });      
  });

  it("it should not add a field to the fields of a display if the field id already exists", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        expect(res.text).to.equal("Duplicate Entry");
        done();
      });
  });

  it("it should return a single display if a display id is specified", function(done){
    chai.request(server)
      .get("/api/website/testweb/display/displayid/")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.displayId).to.equal('displayid');
        expect(res.body.name).to.equal('testdisplay');
        expect(res.body.webId).to.equal(undefined);
        expect(res.body.fields.length).to.equal(1);
        done();
      });
  });

  it("it should modify the status of a display given a valid name and display id", function(done){
    chai.request(server)
    .patch("/api/website/testweb/display/displayid")
    .set("content-type", "application/json")
      .send(JSON.stringify({action: "self", "name": "testdisplay2", form:'', elements:3, navigateable:false}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.elements).to.equal(3);
        expect(res.body.nav).to.equal(false);
        expect(res.body.name).to.equal("testdisplay2");
        done();
      });
  });

  it("it should return an error if an invalid display id is provided trying to get a display", function(done){
    chai.request(server)
      .get("/api/website/testweb/display/invalidId")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Display not found");
        done();
      });
  });

/*  it("it should return all displays for the website if no display id is provided when getting a display", function(done){
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"id":"displayid2", "name": "testdisplay"}))
      .end((err, res) => {
        chai.request(server)
         .get("/api/website/testweb/display/")
          .end((err,res) =>{
            expect(err).to.be.null;
            expect(res.status).to.equal(200);
            expect(res.body.length > 1).to.equal(true);
            done();
          });
      });
  });*/

  it("it should remove the field from a display if the field exists", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
        done();
      });
  });

  it("it should fail to remove a field from a display if the field id does not exist", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"remove", field: "dataout", fieldId: "invalid"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Field not found");
        done();
      });
  });

  it("it should fail to add or remove a field from a display if the body of the request is invalid", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid")
      .set("content-type", "application/json")
      .send(JSON.stringify({field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Malformed Inputs");
        chai.request(server)
          .patch("/api/website/testweb/display/displayid")
          .send(JSON.stringify({action:"remove", fieldId: "dataoutId"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Malformed Inputs");
            chai.request(server)
              .patch("/api/website/testweb/display/displayid")
              .send(JSON.stringify({action:"add", field: "dataout"}))
              .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(422);
                expect(res.text).to.equal("Malformed Inputs");
                done();
              });
          });
      });
  });

  it("it should fail to add or remove a field to a display if the display id does not exist", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/invalidid/")
      .set("content-type", "application/json")
      .send(JSON.stringify({action:"add", field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Display not found");
        chai.request(server)
          .patch("/api/website/testweb/display/invalidid/")
          .set("content-type", "application/json")
          .send(JSON.stringify({action:"remove", field: "dataout", fieldId: "dataoutId"}))
          .end((err, res) =>{
            expect(err).to.be.null;
            expect(res.status).to.equal(404);
            expect(res.text).to.equal("Field not found");
            done();
        });
      });
  });

  it("it should return an error not found if trying to delete an invalid display id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/display/invalidid")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal("Display not found");
        done();
      });
  });

  it("it should delete a display given a valid display id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/display/displayid")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.displayId).to.equal("displayid");
        expect(res.body.webId).to.equal("testweb");
        done();
      });
  });

  /* Field test cases */

  it("it should add a field to the database", function(done){
    chai.request(server)
      .post("/api/website/testweb/field/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"fieldid":"fieldId3", "name": "testfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.webId).to.equal("testweb");
        expect(res.body.name).to.equal("testfield3");
        expect(res.body.fieldId).to.equal("fieldId3");
        done();
      });
  });

  it("it should not add a field to the database if information is missing", function(done){
    chai.request(server)
      .post("/api/website/testweb/field/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"name": "testfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        chai.request(server)
          .post("/api/website/testweb/field/")
          .set("content-type", "application/json")
          .send(JSON.stringify({"fieldid":"fieldId3"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            done();
          });
      });
  });

  it("it should not add a field if it already exists", function(done){
    chai.request(server)
      .post("/api/website/testweb/field/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"fieldid":"fieldId3", "name": "testfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        done();
      });
  });

  it("it should update the field name of a field id", function(done){
    chai.request(server)
      .patch("/api/website/testweb/field/fieldId3")
      .set("content-type", "application/json")
      .send(JSON.stringify({"name": "testfield4"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.fieldId).to.equal("fieldId3");
        expect(res.body.name).to.equal("testfield4");
        done();
      });
  });

  it("it should not update the field if input is malformed", function(done){
    chai.request(server)
      .patch("/api/website/testweb/field/fieldId3")
      .set("content-type", "application/json")
      .send(JSON.stringify({"none": "testfield3"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        done();
      });
  });

  /* Data field test cases */

  it("it should add a datafield to the database", function(done){
    chai.request(server)
      .post("/api/website/testweb/datafield/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"fieldid":"datafieldId3", "name": "datatestfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.webId).to.equal("testweb");
        expect(res.body.name).to.equal("datatestfield3");
        expect(res.body.dataoutId).to.equal("datafieldId3");
        done();
      });
  });

  it("it should not add a datafield to the database if information is missing", function(done){
    chai.request(server)
      .post("/api/website/testweb/datafield/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"name": "datatestfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        chai.request(server)
          .post("/api/website/testweb/datafield/")
          .set("content-type", "application/json")
          .send(JSON.stringify({"fieldid":"datafieldId3"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            done();
          });
      });
  });

  it("it should not add a datafield if it already exists", function(done){
    chai.request(server)
      .post("/api/website/testweb/datafield/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"fieldid":"datafieldId3", "name": "datatestfield3"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(409);
        done();
      });
  });

  it("it should update the datafield name and field of a datafield id", function(done){
    chai.request(server)
      .patch("/api/website/testweb/datafield/datafieldId3")
      .set("content-type", "application/json")
      .send(JSON.stringify({"name": "datatestfield4", "field": "fieldId3"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal("datatestfield4");
        expect(res.body.field).to.not.be.undefined;
        done();
      });
  });

  it("it should not update the field if input is malformed", function(done){
    chai.request(server)
      .patch("/api/website/testweb/datafield/datafieldId3")
      .set("content-type", "application/json")
      .send(JSON.stringify({"none": "datatestfield3"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        done();
      });
  });

  it("it should delete the field given a valid field id", function(done){
    chai.request(server)
    .delete("/api/website/testweb/field/fieldId3")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(200);
      expect(res.body.webId).to.equal('testweb');
      expect(res.body.name).to.equal('testfield4');
      expect(res.body.fieldId).to.equal('fieldId3')
      done();
    });
  });

  it("it should not delete a field if the field does not exist", function(done){
    chai.request(server)
      .delete("/api/website/testweb/field/invalidFieldName")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        done();
      });
  });

  it("it should not delete a field if the passed parameters are not alphanumeric", function(done){
    chai.request(server)
    .delete("/api/website/!@/field/invalidFieldName")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(422);
      chai.request(server)
        .delete("/api/website/testweb/field/!@")
        .end((err, res) =>{
          expect(err).to.be.null;
          expect(res.status).to.equal(422);
          done();
        });
    });
});

  it("it should delete the datafield given a valid data field id", function(done){
    chai.request(server)
    .delete("/api/website/testweb/datafield/datafieldId3")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(200);
      expect(res.body.webId).to.equal('testweb');
      expect(res.body.name).to.equal('datatestfield4');
      expect(res.body.dataoutId).to.equal('datafieldId3')
      done();
    });
  });

  it("it should not delete the datafield if the datafield does not exist", function(done){
    chai.request(server)
      .delete("/api/website/testweb/datafield/invalidId")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(404);
        done();
      });
  });

  it("it should not delete the datafield if the parameters are not alphanumeric", function(done){
    chai.request(server)
    .delete("/api/website/!@/datafield/invalidFieldName")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(422);
      chai.request(server)
        .delete("/api/website/testweb/datafield/!@")
        .end((err, res) =>{
          expect(err).to.be.null;
          expect(res.status).to.equal(422);
          done();
        });
    });
  });

  it("it should sucessfully log a user out", function(done){
    chai.request(server)
      .post("/logout/")
      .send(JSON.stringify({token:"Guest_User"}))
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.text).to.equal("Logged out successfully");
        done();
      });
  });
});
