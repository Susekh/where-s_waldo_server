import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "ap-south-1" }); 
export const sendEmail = async ({ to, subject, html }) => {
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Data: html },
      },
      Subject: { Data: subject },
    },
    Source: process.env.SES_SOURCE_EMAIL, 
  });

  const response = await ses.send(command);
  console.log("SES email sent:", response);
  return response;
};
