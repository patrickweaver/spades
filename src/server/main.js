import express from "express";
import ViteExpress from "vite-express";

import router from "./routes.js";

// init project
var app = express();

global.games = [];
export var games = global.games;
global.players = [];
export var players = global.players;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

ViteExpress.listen(app, process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}...`)
);
