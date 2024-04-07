import { Router } from "express";
import { isCharacterFound } from "../controller/gameLogic.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/isFound", verifyJWT, isCharacterFound);


export default router;