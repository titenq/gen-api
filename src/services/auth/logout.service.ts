import createErrorMessage from "@/helpers/create-error-message";
import { ErrorInterface } from "@/interfaces";
import getUserRepository from "@/repositories/user/get-user-by-id.repository";

const logoutService = async (
  userId: string,
): Promise<boolean | ErrorInterface.IGenericError> => {
  try {
    const user = await getUserRepository(userId);

    if (!user) {
      return createErrorMessage("error.auth.userNotFound", 404);
    }

    return true;
  } catch (_error) {
    return createErrorMessage("error.auth.internalErrorAuthentication", 500);
  }
};

export default logoutService;
