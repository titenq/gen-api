import { describe, expect, test } from "vitest";

import getUsersSchema from "@/schemas/user/get-users.schema";

describe("getUsersSchema", () => {
  test("should have correct structure", () => {
    expect(getUsersSchema).toHaveProperty("summary");
    expect(getUsersSchema).toHaveProperty("tags");
    expect(getUsersSchema).toHaveProperty("response");
  });

  test("should have correct response codes", () => {
    expect(getUsersSchema.response).toHaveProperty("200");
    expect(getUsersSchema.response).toHaveProperty("400");
    expect(getUsersSchema.response).toHaveProperty("404");
  });
});
