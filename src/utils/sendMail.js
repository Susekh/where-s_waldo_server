import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: "ap-south-1" });

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_LAMBDA_NAME) {
    throw new Error("EMAIL_LAMBDA_NAME environment variable is not set");
  }

  const payload = {
    to,
    subject,
    html,
  };

  const command = new InvokeCommand({
    FunctionName: process.env.EMAIL_LAMBDA_NAME,
    Payload: Buffer.from(JSON.stringify(payload)),
    InvocationType: "RequestResponse",
  });

  try {
    const response = await lambda.send(command);

    if (response.FunctionError) {
      const errorPayload = JSON.parse(Buffer.from(response.Payload).toString());
      throw new Error(errorPayload.errorMessage || "Email Lambda failed");
    }

    const result = JSON.parse(Buffer.from(response.Payload).toString());

    if (!result.success) {
      throw new Error(result.error || "Email sending failed in Lambda");
    }

    return result;
  } catch (err) {
    console.error("sendEmail Lambda invocation failed:", err);
    throw new Error(`sendEmail failed: ${err.message}`);
  }
};

export { sendEmail };
