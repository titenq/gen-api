import { UserInterface } from "@/interfaces";

export interface IRegisterBody extends UserInterface.IUserBody {}

export interface IXRecaptchaToken {
  "x-recaptcha-token": string;
}

export interface IRegisterHeaders extends IXRecaptchaToken {}

export interface ILoginBody {
  email: string;
  password: string;
}

export interface ILoginHeaders extends IXRecaptchaToken {}

export interface ILogoutHeaders {
  authorization: string;
}

export interface IVerifyEmailBody {
  token: string;
}

export interface IDecodedToken {
  _id: string;
  iat: number;
  exp: number;
}

export interface IForgotPasswordBody {
  email: string;
}

export interface IForgotPasswordHeaders extends IXRecaptchaToken {}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResendLinkBody {
  email: string;
  recaptchaToken?: string | null;
}

export interface IResendLinkResponse {
  message: string;
}

export interface IResetPasswordBody {
  token: string;
  password: string;
}

export interface ICookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | "strict" | "none" | "lax" | undefined;
  path: string;
  maxAge: number;
  partitioned: boolean;
}

export interface ICookiesOptions {
  accessToken: ICookieOptions;
  refreshToken: ICookieOptions;
}

export interface IMessageResponse {
  message: string;
}

export interface IResetPasswordBody {
  token: string;
  password: string;
}

export interface IResetPasswordResponse {
  message: string;
}
