import { describe, test, expect, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";

import sendForgotPasswordEmail from "@/helpers/send-forgot-password-email";
import getAppName from "@/helpers/get-app-name";
import translate from "@/helpers/translate";

vi.mock("nodemailer");
vi.mock("@/config/env", () => ({
  default: {
    EMAIL_USER: "test@example.com",
    EMAIL_APP_PASSWORD: "password",
    EMAIL_SERVICE: "gmail",
  },
}));

describe("sendForgotPasswordEmail", () => {
  const mockSendMail = vi.fn();
  const mockCreateTransport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockSendMail.mockResolvedValue({ messageId: "123" });
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });

    vi.mocked(nodemailer.createTransport).mockImplementation(
      mockCreateTransport,
    );
  });

  test("should send a forgot password email", async () => {
    const userEmail = "user@example.com";
    const forgotPasswordLink = "http://example.com/reset";

    await sendForgotPasswordEmail(userEmail, forgotPasswordLink);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: "test@example.com",
        pass: "password",
      },
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "test@example.com",
        to: userEmail,
        subject: `${getAppName()} - ${translate("message.email.resetPassword")}`,
        html: expect.stringContaining(forgotPasswordLink),
      }),
    );
  });

  test("should handle errors when sending email", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSendMail.mockRejectedValue(
      new Error(translate("message.email.errorEmailSent")),
    );

    await sendForgotPasswordEmail(
      "user@example.com",
      "http://example.com/reset",
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      translate("message.email.errorEmailSent"),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
