import sendForgotPasswordEmail from "@/helpers/send-forgot-password-email";

const forgotPasswordConsumer = async (
  consumeMessages: (
    queue: string,
    callback: (msgContent: string) => void,
  ) => Promise<void>,
): Promise<void> => {
  await consumeMessages("send_forgot_password_queue", async (msgContent) => {
    const { userEmail, forgotPasswordLink } = JSON.parse(msgContent);

    await sendForgotPasswordEmail(userEmail, forgotPasswordLink);
  });
};

export default forgotPasswordConsumer;
