import { Router } from "express";
import leaderboardController from "../controller/leaderBoard.controller.js";

const router = Router();


router.get("/leaderBoard", leaderboardController);

export default router