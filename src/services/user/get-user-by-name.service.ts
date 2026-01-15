import { UserInterface, ErrorInterface } from "@/interfaces";
import createErrorMessage from "@/helpers/create-error-message";
import getUserByNameRepository from "@/repositories/user/get-user-by-name.repository";

const getUserByNameService = async (
  name: string,
): Promise<UserInterface.IUserResponse | ErrorInterface.IGenericError> => {
  try {
    const user = await getUserByNameRepository(name);

    if (!user) {
      return createErrorMessage("error.user.notFound", 404);
    }

    return user;
  } catch (_error) {
    return createErrorMessage("error.user.getUserByName", 400);
  }
};

export default getUserByNameService;
