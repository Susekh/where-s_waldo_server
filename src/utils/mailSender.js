import nodemailer from "nodemailer";

const sendMail = async (to, subject, html) => {
  try {
    console.log("Email to be Sent at ::", to);
    console.log(
      "Dets ::",
      process.env.NODEMAILER_USER,
      process.env.NODEMAILER_PASS
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Subhranshu Sekhar Khilar" <subhranshukhilar@gmail.com>',
      to: `Recipient <${to}>`,
      subject: subject,
      html: html,
    });

    console.log("Message sent: %s", info);
  } catch (error) {
    console.error("Error sending mail: ", error);
  }
};

export default sendMail;
