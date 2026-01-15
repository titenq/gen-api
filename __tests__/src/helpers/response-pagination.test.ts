import { describe, test, expect, vi } from "vitest";
import { Model } from "mongoose";

import {
  buildResponse,
  buildQuery,
  executeQuery,
} from "@/helpers/response-pagination";

describe("response-pagination", () => {
  describe("buildResponse", () => {
    test("should build a paginated response object", () => {
      const resources = [{ id: 1 }, { id: 2 }];
      const count = 10;
      const page = 1;
      const limit = 2;
      const key = "users";
      const response = buildResponse(key, resources, count, page, limit);

      expect(response).toEqual({
        users: resources,
        totalPages: 5,
        currentPage: 1,
        perPage: 2,
        totalCount: 10,
      });
    });
  });

  describe("buildQuery", () => {
    test("should return an empty object if key or value is missing", () => {
      expect(buildQuery()).toEqual({});
      expect(buildQuery("name")).toEqual({});
      expect(buildQuery(undefined, "value")).toEqual({});
    });

    test("should return a regex query object", () => {
      const key = "name";
      const value = "john";
      const query = buildQuery(key, value);

      expect(query).toEqual({
        name: { $regex: "john", $options: "i" },
      });
    });
  });

  describe("executeQuery", () => {
    test("should execute a paginated query", async () => {
      const resources = [{ id: 1 }, { id: 2 }];
      const count = 10;
      const mockExec = vi.fn().mockResolvedValue(resources);
      const mockCountExec = vi.fn().mockResolvedValue(count);
      const mockSort = vi.fn().mockReturnThis();
      const mockSkip = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockFind = vi.fn().mockReturnValue({
        limit: mockLimit,
        skip: mockSkip,
        sort: mockSort,
        exec: mockExec,
      });
      const mockCountDocuments = vi.fn().mockReturnValue({
        exec: mockCountExec,
      });

      const mockModel = {
        find: mockFind,
        countDocuments: mockCountDocuments,
      } as unknown as Model<any>;

      const query = { name: "test" };
      const page = 1;
      const limit = 10;
      const filterBy = "createdAt";
      const orderBy = "desc";

      const result = await executeQuery(
        mockModel,
        query,
        page,
        limit,
        filterBy,
        orderBy,
      );

      expect(mockModel.find).toHaveBeenCalledWith(query);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockModel.countDocuments).toHaveBeenCalledWith(query);
      expect(result).toEqual({ resources, count });
    });

    test("should execute a paginated query with ascending sort", async () => {
      const resources = [{ id: 1 }, { id: 2 }];
      const count = 10;
      const mockExec = vi.fn().mockResolvedValue(resources);
      const mockCountExec = vi.fn().mockResolvedValue(count);
      const mockSort = vi.fn().mockReturnThis();
      const mockSkip = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnThis();
      const mockFind = vi.fn().mockReturnValue({
        limit: mockLimit,
        skip: mockSkip,
        sort: mockSort,
        exec: mockExec,
      });
      const mockCountDocuments = vi.fn().mockReturnValue({
        exec: mockCountExec,
      });

      const mockModel = {
        find: mockFind,
        countDocuments: mockCountDocuments,
      } as unknown as Model<any>;

      const query = { name: "test" };
      const page = 2;
      const limit = 10;
      const filterBy = "name";
      const orderBy = "asc";

      await executeQuery(mockModel, query, page, limit, filterBy, orderBy);

      expect(mockSkip).toHaveBeenCalledWith(10);
      expect(mockSort).toHaveBeenCalledWith({ name: 1 });
    });
  });
});
