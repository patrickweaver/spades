import express from "express";
import * as gameController from "./controllers/game.js";
import * as botController from "./controllers/bot.js";

const router = express.Router();

router.get("/api/game", gameController.query);
router.get("/api/game/:gameId", gameController.find);
router.post("/api/game", gameController.update);

router.post("/api/bot", botController.index);
router.get("/api/bot/test", botController.test);
router.post("/api/bot/final-score", botController.finish);
router.post("/api/bot/bid", botController.bid);
router.post("/api/bot/play", botController.play);
router.post("/api/bot/hand-score", botController.scoreHand);
router.post("/api/bot/trick-taker", botController.trickUpdate);

export default router;
