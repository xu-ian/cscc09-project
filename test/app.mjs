import { readFileSync } from "fs";
import chai from "chai";
import chaiHttp from "chai-http";

import { server, closeMongoDB } from "../app.mjs";
const expect = chai.expect;
chai.use(chaiHttp);

/* Global variable to keep track of new ids, so they can be deleted when finished. */
let imageId = null;
let commentId = null;

describe("Testing API", () => {
  after(function () {
    server.close();
    closeMongoDB();
  });

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
        expect(res.text).to.equal("Invalid Inputs");
        chai.request(server)
          .post("/api/website/testweb/form/")
          .send(JSON.stringify({"name":"testform"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Invalid Inputs");
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
      .send(JSON.stringify({action: "name", "form": "testform2"}))
      .end((err, res) => {
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

  it("it should fail to add or remove a field if the body of the request is invalid", function(done){
    chai.request(server)
      .patch("/api/website/testweb/form/testid")
      .set("content-type", "application/json")
      .send(JSON.stringify({field: "testfield", fieldId: "testfieldId"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Invalid Inputs");
        chai.request(server)
          .patch("/api/website/testweb/form/testid")
          .send(JSON.stringify({action:"remove", fieldId: "testfieldId"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Invalid Inputs");
            chai.request(server)
              .patch("/api/website/testweb/form/testid")
              .send(JSON.stringify({action:"add", field: "testfield"}))
              .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(422);
                expect(res.text).to.equal("Invalid Inputs");
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

  it("it should delete a form given a valid form id", function(done){
    chai.request(server)
      .delete("/api/website/testweb/form/testid")
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.deletedCount).to.equal(1);
        done();
      });
  });

  it("it should add an display successfully", function (done) {
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({"id":"displayid", "name": "testdisplay"}))
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
      .send(JSON.stringify({"id":"testid"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Invalid Inputs");
        chai.request(server)
          .post("/api/website/testweb/display/")
          .send(JSON.stringify({"name":"testform"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Invalid Inputs");
            done();
          });
      });
  });

  it("it should not add a display with a duplicate display id", function(done){
    chai.request(server)
      .post("/api/website/testweb/display/")
      .set("content-type", "application/json")
      .send(JSON.stringify({id:"displayid", name:"testdisplay"}))
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
        console.log(res.body);
        console.log(res.text);
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
        console.log(res.body);
        console.log(res.text);
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
      .send(JSON.stringify({action: "self", "name": "testdisplay2", elements:3, navigateable:false}))
      .end((err, res) => {
        console.log(res.body);
        console.log(res.text);
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

  it("it should return all displays for the website if no display id is provided when getting a display", function(done){
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
  });

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

  it("it should fail to add or remove a field if the body of the request is invalid", function(done){
    chai.request(server)
      .patch("/api/website/testweb/display/displayid")
      .set("content-type", "application/json")
      .send(JSON.stringify({field: "dataout", fieldId: "dataoutId"}))
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(422);
        expect(res.text).to.equal("Invalid Inputs");
        chai.request(server)
          .patch("/api/website/testweb/display/displayid")
          .send(JSON.stringify({action:"remove", fieldId: "dataoutId"}))
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.equal(422);
            expect(res.text).to.equal("Invalid Inputs");
            chai.request(server)
              .patch("/api/website/testweb/display/displayid")
              .send(JSON.stringify({action:"add", field: "dataout"}))
              .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(422);
                expect(res.text).to.equal("Invalid Inputs");
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
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.deletedCount).to.equal(1);
        done();
      });
  });

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
        console.log(res.body);
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
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
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
        console.log(res.body);
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
        expect(res.body.acknowledged).to.equal(true);
        expect(res.body.modifiedCount).to.equal(1);
        expect(res.body.matchedCount).to.equal(1);
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
    .delete("/api/website/testweb/datafield/datafieldId3")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(200);
      expect(res.body.acknowledged).to.equal(true);
      expect(res.body.deletedCount).to.equal(1);
      done();
    });
  });

  it("it should delete the field given a valid field id", function(done){
    chai.request(server)
    .delete("/api/website/testweb/field/fieldId3")
    .end((err, res) =>{
      expect(err).to.be.null;
      expect(res.status).to.equal(200);
      expect(res.body.acknowledged).to.equal(true);
      expect(res.body.deletedCount).to.equal(1);
      done();
    });
  });
});