import sendMail from "../utils/mailSender.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

export const handleForgotPassword = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, error: "Username is required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  try {
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>Regards,<br/>Your App Team</p>
      </div>
    `;

    await sendMail(user.email, "OTP for Password Reset", htmlContent);

    // Mask the email (show first 3 characters only)
    const [localPart, domain] = user.email.split("@");
    const maskedLocal = localPart.slice(0, 3) + "*".repeat(Math.max(localPart.length - 3, 0));
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({
      success: true,
      message: `OTP sent to ${maskedEmail}`,
      emailPreview: maskedEmail, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }
})


export const handleOtpValidation = asyncHandler(async (req, res) => {
  const { username, otp, newPassword, confirmPassword } = req.body;

  if (!username || !otp) {
    return res.status(400).json({ success: false, error: "Username and OTP are required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  if (user.otp !== otp) {
    return res.status(401).json({ success: false, error: "Invalid OTP" });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(410).json({ success: false, error: "OTP expired" });
  }

  // If password fields are provided, validate them and update password
  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, error: "Both newPassword and confirmPassword are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  res.json({ success: true, message: "OTP verified and password updated successfully" });
});