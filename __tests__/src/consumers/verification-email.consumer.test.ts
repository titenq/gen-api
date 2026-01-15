import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";

import verificationEmailConsumer from "@/consumers/verification-email.consumer";
import sendVerificationEmail from "@/helpers/send-verification-email";

vi.mock("@/helpers/send-verification-email", () => ({
  default: vi.fn(),
}));

describe("src/consumers/verification-email.consumer.ts", () => {
  let consumeMessagesMock: Mock;

  beforeEach(() => {
    consumeMessagesMock = vi.fn();
    vi.clearAllMocks();
  });

  test('should consume messages from "send_verification_email_queue"', async () => {
    await verificationEmailConsumer(consumeMessagesMock);

    expect(consumeMessagesMock).toHaveBeenCalledTimes(1);
    expect(consumeMessagesMock).toHaveBeenCalledWith(
      "send_verification_email_queue",
      expect.any(Function),
    );
  });

  test("should parse message and call sendVerificationEmail", async () => {
    consumeMessagesMock.mockImplementation(async (queue, callback) => {
      const msgContent = JSON.stringify({
        userEmail: "test@example.com",
        verificationLink: "http://example.com/verify",
      });

      await callback(msgContent);
    });

    await verificationEmailConsumer(consumeMessagesMock);

    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
      "http://example.com/verify",
    );
  });
});
