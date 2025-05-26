import { Router } from "express";
import { signUpPost, loginUser, logout } from "../controller/auth.controller.js";
import forgetPasswordRouter from  "./forgotPassword.route.js"
import { validateLogin, validateSignup, verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/sign-up", validateSignup, signUpPost);
router.post("/log-in",validateLogin, loginUser);
router.use("/forgot-password", forgetPasswordRouter);
router.get("/log-out", verifyJWT, logout);
router.get("/isAuthenticated", verifyJWT, (req, res) => {
    res.status(200).json({ message: "User is Authenticated." })
} )

export default router;