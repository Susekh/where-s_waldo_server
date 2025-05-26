import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
});

const sendMail = async (to, subject, html) => {
    try {
        
        const info = await transporter.sendMail({
            from: '"Subhranshu Sekhar Khilar" <subhranshukhilar@gmail.com>', 
            to: `Recipient <${to}>`, 
            subject: subject, 
            html : html
          });

        
    } catch (error) {
        console.error("Error sending mail: ", error);
    }

}


export default sendMail;