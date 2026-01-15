import { describe, test, expect, vi, beforeEach } from "vitest";

import createErrorMessage from "@/helpers/create-error-message";
import * as updateEmailVerificationTokenModule from "@/repositories/auth/register.repository";
import * as getUserByEmailModule from "@/repositories/user/get-user-by-email.repository";
import resendLinkService from "@/services/auth/resend-link.service";

describe("resendLinkService", () => {
  const mockFastify: any = {
    jwt: {
      sign: vi.fn(),
    },
    rabbitMQ: {
      publishMessage: vi.fn(),
    },
    i18n: vi.fn(() => "mocked-translation"),
  };

  const email = "test@example.com";

  const fakeUser: any = {
    _id: "123",
    email,
    isEmailVerified: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should return error if user is not found", async () => {
    vi.spyOn(getUserByEmailModule, "default").mockResolvedValue(null);

    const result = await resendLinkService(mockFastify, { email });

    expect(result).toEqual(createErrorMessage("error.auth.userNotFound", 404));
  });

  test("should return error if user is already verified", async () => {
    vi.spyOn(getUserByEmailModule, "default").mockResolvedValue({
      ...fakeUser,
      isEmailVerified: true,
    });

    const result = await resendLinkService(mockFastify, { email });

    expect(result).toEqual(
      createErrorMessage("error.auth.emailAlreadyVerified", 409),
    );
  });

  test("should return error if updateEmailVerificationTokenRepository does not update", async () => {
    vi.spyOn(getUserByEmailModule, "default").mockResolvedValue(fakeUser);

    mockFastify.jwt.sign.mockReturnValue("token123");

    vi.spyOn(
      updateEmailVerificationTokenModule,
      "updateEmailVerificationTokenRepository",
    ).mockResolvedValue(null);

    const result = await resendLinkService(mockFastify, { email });

    expect(result).toEqual(createErrorMessage("error.auth.userNotFound", 404));
  });

  test("should publish message and return success if everything is valid", async () => {
    vi.spyOn(getUserByEmailModule, "default").mockResolvedValue(fakeUser);

    mockFastify.jwt.sign.mockReturnValue("token123");

    vi.spyOn(
      updateEmailVerificationTokenModule,
      "updateEmailVerificationTokenRepository",
    ).mockResolvedValue({ ...fakeUser, emailVerificationToken: "token123" });

    const result = await resendLinkService(mockFastify, { email });

    expect(mockFastify.rabbitMQ.publishMessage).toHaveBeenCalledWith(
      "send_verification_email_queue",
      expect.stringContaining("verificationLink"),
    );

    expect(result).toEqual({ message: "mocked-translation" });
  });

  test("should return error if an exception occurs", async () => {
    vi.spyOn(getUserByEmailModule, "default").mockRejectedValue(
      new Error("db error"),
    );

    const result = await resendLinkService(mockFastify, { email });

    expect(result).toEqual(createErrorMessage("error.auth.resendLinkError"));
  });
});
