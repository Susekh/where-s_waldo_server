import { Router } from "express";
import { isCharacterFound } from "../controller/gameLogic.controller.js";

const router = Router();

router.post("/isFound", isCharacterFound);


export default router;