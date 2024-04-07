import { Router } from "express";
import { signUpPost, loginUser, logout } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/sign-up", signUpPost);
router.post("/log-in", loginUser);
router.post("/log-out", verifyJWT, logout);

export default router;