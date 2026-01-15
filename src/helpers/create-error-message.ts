import { ErrorInterface } from "@/interfaces";

const createErrorMessage = (
  message: string,
  statusCode: number = 400,
): ErrorInterface.IGenericError => ({
  error: true,
  message,
  statusCode,
});

export default createErrorMessage;
