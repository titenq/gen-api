import env from "@/config/env";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/constants/constants";
import { Environment } from "@/enums/environment.enum";
import { AuthInterface } from "@/interfaces";

const { NODE_ENV } = env;

const baseOptions: Omit<AuthInterface.ICookieOptions, "maxAge"> = {
  httpOnly: true,
  secure: NODE_ENV === Environment.PRODUCTION,
  sameSite: NODE_ENV === Environment.PRODUCTION ? "none" : "lax",
  path: "/",
  partitioned: NODE_ENV === Environment.PRODUCTION,
};

const cookiesOptions: AuthInterface.ICookiesOptions = {
  accessToken: {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_EXPIRES,
  },
  refreshToken: {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_EXPIRES,
  },
};

export default cookiesOptions;
