import nodemailer from "nodemailer";

// Create transporter instance outside the function for reuse
let transporter;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    });
  }
  return transporter;
};

const sendMail = async (to, subject, html) => {
  let transporter;
  
  try {
    // Validate required environment variables
    if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
      throw new Error('Missing required environment variables: NODEMAILER_USER or NODEMAILER_PASS');
    }

    // Validate input parameters
    if (!to || !subject || !html) {
      throw new Error('Missing required parameters: to, subject, or html');
    }

    transporter = createTransporter();

    // Verify transporter configuration before sending
    await transporter.verify();
    console.log('SMTP connection verified');

    // CRITICAL: Properly await the email sending to prevent Lambda termination
    const info = await new Promise((resolve, reject) => {
      transporter.sendMail({
        from: `"Subhranshu Sekhar Khilar" <${process.env.NODEMAILER_USER}>`,
        to: `Recipient <${to}>`,
        subject: subject,
        html: html,
      }, (error, info) => {
        if (error) {
          console.error('Nodemailer error:', error);
          return reject(error);
        }
        resolve(info);
      });
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error("Error sending mail:", {
      message: error.message,
      code: error.code,
      command: error.command,
      to: to,
      subject: subject
    });

    // Re-throw error for proper Lambda error handling
    throw new Error(`Failed to send email: ${error.message}`);
  } finally {
    // CRITICAL: Ensure connection is closed to prevent Lambda from hanging
    if (transporter) {
      transporter.close();
      transporter = null; // Reset for next invocation
    }
  }
};

export default sendMail;