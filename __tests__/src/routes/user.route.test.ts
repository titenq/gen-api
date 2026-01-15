import { beforeEach, describe, expect, test, vi } from "vitest";
import { FastifyInstance } from "fastify";

import userRoute from "@/routes/user.route";
import * as userController from "@/controllers/user";
import * as userSchema from "@/schemas/user";
import verifyToken from "@/handlers/verify-token.handler";
import verifyRoles from "@/handlers/verify-roles.handler";
import { Roles } from "@/enums/user.enum";

vi.mock("@/handlers/verify-roles.handler", () => ({
  default: vi.fn().mockReturnValue("verifyRolesMiddleware"),
}));

describe("userRoute", () => {
  let fastify: FastifyInstance;
  let getMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMock = vi.fn();

    fastify = {
      withTypeProvider: () => ({ get: getMock }),
    } as unknown as FastifyInstance;

    vi.clearAllMocks();
  });

  test("should register GET /users/:id with correct schema and preHandler", async () => {
    await userRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/users/:id")!;
    const [path, options, handler] = call;

    expect(path).toBe("/users/:id");
    expect(handler).toBe(userController.getUserById);
    expect(options.schema).toBe(userSchema.getUserByIdSchema);
    expect(options.preHandler).toContain(verifyToken);
    expect(options.config).toEqual({
      protobufType: "user.GetUserByIdResponse",
    });
  });

  test("should register GET /users with correct schema and preHandler", async () => {
    await userRoute(fastify);

    const call = getMock.mock.calls.find((c) => c[0] === "/users")!;
    const [path, options, handler] = call;

    expect(path).toBe("/users");
    expect(handler).toBe(userController.getUsers);
    expect(options.schema).toBe(userSchema.getUsersSchema);
    expect(verifyRoles).toHaveBeenCalledWith([Roles.ADMIN]);
    expect(options.preHandler).toContain("verifyRolesMiddleware");
  });
});
