import { Router } from "express";
import { isCharacterFound, restartGame, provideCharArr } from "../controller/gameLogic.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/isFound", verifyJWT, isCharacterFound);
router.get("/restart", verifyJWT, restartGame);
router.get("/charArr", verifyJWT, provideCharArr);

export default router;