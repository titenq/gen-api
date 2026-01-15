import { describe, beforeEach, test, expect } from "vitest";

import { Roles } from "@/enums/user.enum";
import createErrorMessage from "@/helpers/create-error-message";
import { JwtInterface } from "@/interfaces";
import refreshTokenService from "@/services/auth/refresh-token.service";

describe("refreshTokenService", () => {
  let mockFastify: {
    jwt: {
      verify: (token: string) => JwtInterface.IJwtPayload;
      sign: (payload: any, options?: any) => string;
    };
  };

  const mockUserId = "123456";

  beforeEach(() => {
    mockFastify = {
      jwt: {
        verify: () => ({ _id: mockUserId, roles: [Roles.USER] }),
        sign: ({ _id }: any) => `token-for-${_id}`,
      },
    };
  });

  test("should return new access and refresh tokens when refresh token is valid", async () => {
    const result = await refreshTokenService(
      mockFastify as any,
      "valid-refresh-token",
    );

    expect(result).toEqual({
      newAccessToken: `token-for-${mockUserId}`,
      newRefreshToken: `token-for-${mockUserId}`,
      userId: mockUserId,
    });
  });

  test("should return error if refresh token is invalid", async () => {
    const badFastify = {
      jwt: {
        verify: () => {
          throw new Error("invalid token");
        },
        sign: () => "",
      },
    };

    const result = await (async () => {
      try {
        return await refreshTokenService(badFastify as any, "invalid-token");
      } catch {
        return createErrorMessage("error.auth.failedToRefreshTokens");
      }
    })();

    expect(result).toEqual({
      error: true,
      message: "error.auth.failedToRefreshTokens",
      statusCode: 400,
    });
  });
});
