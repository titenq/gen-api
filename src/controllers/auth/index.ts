import forgotPassword from "@/controllers/auth/forgot-password.controller";
import login from "@/controllers/auth/login.controller";
import logout from "@/controllers/auth/logout.controller";
import refreshToken from "@/controllers/auth/refresh-token.controller";
import register from "@/controllers/auth/register.controller";
import resendLink from "@/controllers/auth/resend-link.controller";
import resetPassword from "@/controllers/auth/reset-password.controller";
import verifyEmail from "@/controllers/auth/verify-email.controller";

export {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resendLink,
  resetPassword,
  verifyEmail,
};
