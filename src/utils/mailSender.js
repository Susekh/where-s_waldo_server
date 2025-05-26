import nodemailer from "nodemailer";

let transporter;

const createTransporter = () => {
  if (!transporter) {
    if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
      throw new Error('Missing required env vars: NODEMAILER_USER, NODEMAILER_PASS');
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    console.log("Gmail transporter initialized");
  }

  return transporter;
};

export const sendMail = async (to, subject, html) => {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"Find-waldo" <${process.env.NODEMAILER_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info);
  return info;
};
