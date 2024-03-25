import { Router } from "express";
import { signUpPost, login_controller, login_middleware, logout } from "../controller/auth.controller.js";

const router = Router();

router.post("/sign-up", signUpPost);
router.post("/log-in", login_middleware, login_controller);
router.post("/log-out", logout);

export default router;