import { Router } from "express";
import { handleForgotPassword, handleOtpValidation } from "../controller/forgotPassword.controller.js";

const router = Router();

router.post("/", handleForgotPassword);
router.post("/otp", handleOtpValidation);

export default router;