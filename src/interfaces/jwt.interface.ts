import { Roles } from "@/enums/user.enum";

export interface IJwtVerify {
  _id: string;
}

export interface IJwtError {
  code: string;
  message?: string;
}

export interface IJwtPayload {
  _id: string;
  roles: Roles[];
  iat?: number;
  exp?: number;
}

export interface IJwtCookies {
  accessToken?: string;
  refreshToken?: string;
}

export interface IJwtRefreshTokensResponse {
  newAccessToken: string;
  newRefreshToken: string;
  userId: string;
}
