import { FastifyInstance } from "fastify";

import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/constants/constants";
import createErrorMessage from "@/helpers/create-error-message";
import { ErrorInterface, JwtInterface } from "@/interfaces";

const refreshTokenService = async (
  fastify: FastifyInstance,
  refreshToken: string,
): Promise<
  JwtInterface.IJwtRefreshTokensResponse | ErrorInterface.IGenericError
> => {
  try {
    const decoded = fastify.jwt.verify<JwtInterface.IJwtPayload>(refreshToken);

    const newAccessToken = fastify.jwt.sign(
      { _id: decoded._id },
      { expiresIn: ACCESS_TOKEN_EXPIRES },
    );

    const newRefreshToken = fastify.jwt.sign(
      { _id: decoded._id },
      { expiresIn: REFRESH_TOKEN_EXPIRES },
    );

    return {
      newAccessToken,
      newRefreshToken,
      userId: decoded._id,
    };
  } catch (_error) {
    return createErrorMessage("error.auth.failedToRefreshTokens");
  }
};

export default refreshTokenService;
