import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "subhranshukhilar@gmail.com",
      pass: "otyp vern ywre itdg",
    },
});

const sendMail = async (to, subject, html) => {
    try {
        console.log("Email to be Sent at ::", to);
        
        const info = await transporter.sendMail({
            from: '"Subhranshu Sekhar Khilar" <subhranshukhilar@gmail.com>', 
            to: `Recipient <${to}>`, 
            subject: subject, 
            html : html
          });

        console.log("Message sent: %s", info);

        
    } catch (error) {
        console.error("Error sending mail: ", error);
    }

}


export default sendMail;