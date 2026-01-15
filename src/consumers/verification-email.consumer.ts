import sendVerificationEmail from "@/helpers/send-verification-email";

const verificationEmailConsumer = async (
  consumeMessages: (
    queue: string,
    callback: (msgContent: string) => void,
  ) => Promise<void>,
) => {
  await consumeMessages("send_verification_email_queue", async (msgContent) => {
    const { userEmail, verificationLink } = JSON.parse(msgContent);

    await sendVerificationEmail(userEmail, verificationLink);
  });
};

export default verificationEmailConsumer;
