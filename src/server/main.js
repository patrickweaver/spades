import express from "express";
import ViteExpress from "vite-express";
import router from "./routes.js";

const port = process.env.PORT;
const app = express();

global.games = [];
export var games = global.games;
global.players = [];
export var players = global.players;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", router);

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}`)
);
