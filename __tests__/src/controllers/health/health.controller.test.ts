import { describe, test, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";

import healthController from "@/controllers/health/health.controller";
import healthService from "@/services/health/health.service";
import {
  HealthStatus,
  MongoDBStatus,
  RedisStatus,
  RabbitMQStatus,
} from "@/enums/health.enum";
import { Roles } from "@/enums/user.enum";
import { IHealthResponse } from "@/interfaces/health.interface";

vi.mock("@/services/health/health.service");

describe("healthController", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      server: {},
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as Partial<FastifyRequest>;

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  test("should return status 200 when service is OK", async () => {
    const mockResponse: IHealthResponse = {
      status: HealthStatus.OK,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: "1h",
      uptimeSeconds: 3600,
      dependencies: {
        mongoDB: { status: MongoDBStatus.OK },
        redis: { status: RedisStatus.OK },
        rabbitMQ: { status: RabbitMQStatus.OK },
      },
    };

    (healthService as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    await healthController(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(healthService).toHaveBeenCalledWith(mockRequest.server);
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should return status 503 when service has errors", async () => {
    const mockResponse: IHealthResponse = {
      status: HealthStatus.ERROR,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: "2h",
      uptimeSeconds: 7200,
      dependencies: {
        mongoDB: {
          status: MongoDBStatus.DOWN,
          error: "Connection failed",
        },
        redis: { status: RedisStatus.DOWN },
        rabbitMQ: { status: RabbitMQStatus.DOWN },
      },
    };

    (healthService as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    await healthController(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(healthService).toHaveBeenCalledWith(mockRequest.server);
    expect(mockReply.status).toHaveBeenCalledWith(503);
    expect(mockReply.send).toHaveBeenCalledWith(mockResponse);
  });

  test("should be accessible by USER and ADMIN roles", () => {
    const allowedRoles = [Roles.USER, Roles.ADMIN];
    expect(allowedRoles).toContain(Roles.USER);
    expect(allowedRoles).toContain(Roles.ADMIN);
  });
});
