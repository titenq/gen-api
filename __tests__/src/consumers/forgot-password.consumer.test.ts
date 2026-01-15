import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";

import forgotPasswordConsumer from "@/consumers/forgot-password.consumer";
import sendForgotPasswordEmail from "@/helpers/send-forgot-password-email";

vi.mock("@/helpers/send-forgot-password-email", () => ({
  default: vi.fn(),
}));

describe("src/consumers/forgot-password.consumer.ts", () => {
  let consumeMessagesMock: Mock;

  beforeEach(() => {
    consumeMessagesMock = vi.fn();
    vi.clearAllMocks();
  });

  test('should consume messages from "send_forgot_password_queue"', async () => {
    await forgotPasswordConsumer(consumeMessagesMock);

    expect(consumeMessagesMock).toHaveBeenCalledTimes(1);
    expect(consumeMessagesMock).toHaveBeenCalledWith(
      "send_forgot_password_queue",
      expect.any(Function),
    );
  });

  test("should parse message and call sendForgotPasswordEmail", async () => {
    consumeMessagesMock.mockImplementation(async (queue, callback) => {
      const msgContent = JSON.stringify({
        userEmail: "test@example.com",
        forgotPasswordLink: "http://example.com/reset",
      });
      await callback(msgContent);
    });

    await forgotPasswordConsumer(consumeMessagesMock);

    expect(sendForgotPasswordEmail).toHaveBeenCalledTimes(1);
    expect(sendForgotPasswordEmail).toHaveBeenCalledWith(
      "test@example.com",
      "http://example.com/reset",
    );
  });
});
