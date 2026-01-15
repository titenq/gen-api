export interface IGenericError {
  error: boolean;
  message: string;
  statusCode: number;
}

export interface IMongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, any>;
  keyPattern?: Record<string, any>;
}
