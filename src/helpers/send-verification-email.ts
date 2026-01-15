import nodemailer from "nodemailer";

import env from "@/config/env";
import getAppName from "@/helpers/get-app-name";
import translate from "@/helpers/translate";
import { LOGO_URL } from "@/constants/constants";

const sendVerificationEmail = async (
  userEmail: string,
  verificationLink: string,
) => {
  const { EMAIL_USER, EMAIL_APP_PASSWORD, EMAIL_SERVICE } = env;

  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: userEmail,
    subject: `${getAppName()} - ${translate("message.email.confirmEmail")}`,
    html: `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #212121; padding: 30px;">
  <tr>
    <td align="center">
      <img src=${LOGO_URL} alt="myfavs" width="200" height="200" style="display: block; margin-bottom: 15px;">
      <p style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; color: #ccc; margin-bottom: 15px;">${translate("message.email.clickLinkVerify")}</p>
      <a href=${verificationLink} style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: #ccc; text-decoration: none;">${translate("message.email.buttonVerify")}</a>
    </td>
  </tr>
</table>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log({ info });
    console.log(translate("message.email.emailSent"), userEmail);
  } catch (error) {
    console.error(translate("message.email.errorEmailSent"), error);
  }
};

export default sendVerificationEmail;
