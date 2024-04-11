import { Router } from "express";
import { signUpPost, loginUser, logout } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/sign-up", signUpPost);
router.post("/log-in", loginUser);
router.get("/log-out", verifyJWT, logout);
router.get("/isAuthenticated", verifyJWT, (req, res) => {
    res.status(200).json({ message: "User is Authenticated." })
} )

export default router;