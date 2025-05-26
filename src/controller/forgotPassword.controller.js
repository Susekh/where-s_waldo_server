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

  // Generate OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with OTP info
  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #666; margin-bottom: 10px; font-size: 16px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 4px; margin: 15px 0;">
              ${otp}
            </div>
          </div>
          
          <div style="margin: 25px 0;">
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              Please use this OTP to reset your password. This code will expire in <strong>10 minutes</strong> for security reasons.
            </p>
            <p style="color: #999; font-size: 14px; line-height: 1.5;">
              If you did not request a password reset, please ignore this email. Your account remains secure.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Best regards,<br/>
              <strong>Subhranshu Khilar</strong>
            </p>
          </div>
        </div>
      </div>
    `;


    console.log(`Attempting to send OTP email to: ${user.email}`);
    
    const emailResult = await sendMail(
      user.email, 
      "Find waldo - Verification Code", 
      htmlContent
    );

    console.log('Email sent successfully:', emailResult);

    // Mask the email for security (show first 3 characters only)
    const [localPart, domain] = user.email.split("@");
    const maskedLocal = localPart.slice(0, 3) + "*".repeat(Math.max(localPart.length - 3, 0));
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({
      success: true,
      message: `OTP sent successfully to ${maskedEmail}`,
      emailPreview: maskedEmail,
      otpExpiry: expiry.toISOString(),
    });

  } catch (emailError) {
    console.error('Email sending failed:', {
      error: emailError.message,
      stack: emailError.stack,
      username: username,
      email: user.email
    });

    // Clean up OTP if email fails (optional - depends on your business logic)
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(500).json({ 
      success: false, 
      error: "Failed to send OTP email. Please try again.",
      // In development, you might want to include more details
      ...(process.env.NODE_ENV === 'development' && { 
        details: emailError.message 
      })
    });
  }
});

export const handleOtpValidation = asyncHandler(async (req, res) => {
  const { username, otp, newPassword, confirmPassword } = req.body;

  // Input validation
  if (!username || !otp) {
    return res.status(400).json({ 
      success: false, 
      error: "Username and OTP are required" 
    });
  }

  // Find user
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: "User not found" 
    });
  }

  // Check if OTP exists
  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({ 
      success: false, 
      error: "No active OTP found. Please request a new one." 
    });
  }

  // Validate OTP
  if (user.otp !== otp) {
    return res.status(401).json({ 
      success: false, 
      error: "Invalid OTP" 
    });
  }

  // Check OTP expiry
  if (new Date() > user.otpExpiry) {
    // Clean up expired OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    return res.status(410).json({ 
      success: false, 
      error: "OTP has expired. Please request a new one." 
    });
  }

  // If password fields are provided, validate and update password
  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: "Both newPassword and confirmPassword are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: "Passwords do not match" 
      });
    }

    // Password strength validation (optional)
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: "Password must be at least 6 characters long" 
      });
    }

    try {
      // Hash the new password
      console.log('Hashing new password for user:', username);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to process password. Please try again." 
      });
    }
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;

  try {
    await user.save();
    console.log('User updated successfully:', username);
    
    res.json({ 
      success: true, 
      message: newPassword ? 
        "OTP verified and password updated successfully" : 
        "OTP verified successfully"
    });
  } catch (saveError) {
    console.error('Failed to save user:', saveError);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update user. Please try again." 
    });
  }
});