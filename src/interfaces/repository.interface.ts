export interface IGetAllRepositoryParams {
  query: Record<string, unknown>;
  page: number;
  limit: number;
  filterBy: string;
  orderBy: "asc" | "desc";
}

export interface IGetAllRepositoryResponse<T> {
  resources: T[];
  count: number;
}
