import { Model, Document } from "mongoose";

const buildResponse = <T, K extends string>(
  key: K,
  resources: T[],
  count: number,
  page: number,
  limit: number,
): { [P in K]: T[] } & {
  totalPages: number;
  currentPage: number;
  perPage: number;
  totalCount: number;
} => {
  const base = {
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    perPage: limit,
    totalCount: count,
  };

  return {
    [key]: resources,
    ...base,
  } as { [P in K]: T[] } & typeof base;
};

const buildQuery = (key?: string, value?: string): Record<string, any> | {} => {
  if (!key || !value) {
    return {};
  }

  return { [key]: { $regex: value, $options: "i" } };
};

const executeQuery = async <T extends Document>(
  resource: Model<T>,
  query: Record<string, any>,
  page: number,
  limit: number,
  filterBy: string,
  orderBy: "asc" | "desc",
): Promise<{ resources: T[]; count: number }> => {
  const resources = await resource
    .find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ [filterBy]: orderBy === "desc" ? -1 : 1 })
    .exec();

  const count = await resource.countDocuments(query).exec();

  return { resources, count };
};

export { buildResponse, buildQuery, executeQuery };
