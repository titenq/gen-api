import createErrorMessage from "@/helpers/create-error-message";
import { ErrorInterface, UserInterface } from "@/interfaces";
import getUserByIdRepository from "@/repositories/user/get-user-by-id.repository";

const getUserByIdService = async (
  id: string,
): Promise<
  UserInterface.IGetUserByIdResponse | ErrorInterface.IGenericError
> => {
  try {
    const user = await getUserByIdRepository(id);

    if (!user) {
      return createErrorMessage("error.user.notFound", 404);
    }

    return user;
  } catch (_error) {
    return createErrorMessage("error.user.getUserById", 500);
  }
};

export default getUserByIdService;
