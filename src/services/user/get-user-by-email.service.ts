import { UserInterface, ErrorInterface } from "@/interfaces";
import createErrorMessage from "@/helpers/create-error-message";
import getUserByEmailRepository from "@/repositories/user/get-user-by-email.repository";

const getUserByEmailService = async (
  email: string,
): Promise<UserInterface.IUserResponse | ErrorInterface.IGenericError> => {
  try {
    const user = await getUserByEmailRepository(email);

    if (!user) {
      return createErrorMessage("error.user.notFound", 404);
    }

    return user;
  } catch (_error) {
    return createErrorMessage("error.user.getUserByEmail", 400);
  }
};

export default getUserByEmailService;
