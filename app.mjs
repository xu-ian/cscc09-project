import { createServer } from "http";
import { readFileSync, writeFile, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import express from "express";
import multer from "multer";
import mongoose from "mongoose";

/* Upload path for files */
const upload = multer({ dest: 'uploads/' });

const PORT = 3000;

const app = express();

app.use(express.json());

app.use(express.static("static"));

app.use("*/grapesjs", express.static("node_modules/grapesjs"));

/* Mongoose connection setup copied from quickstart documentation. Uncomment below 
   when an actual mongodb uri string is given*/
/* Mongodb uri string format: mongodb://user:pass@ip:port/options */
//main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.post("/", function (req, res, next) {
  res.json(req.body);
  next();
});


export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
