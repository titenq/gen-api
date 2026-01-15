import UserModel from "@/models/User.model";
import { executeQuery } from "@/helpers/response-pagination";
import { RepositoryInterface, UserInterface } from "@/interfaces";

const getUsers = async (
  params: RepositoryInterface.IGetAllRepositoryParams,
): Promise<
  RepositoryInterface.IGetAllRepositoryResponse<UserInterface.IUserResponseModified>
> => {
  const { query, page, limit, filterBy, orderBy } = params;
  const users = await executeQuery(
    UserModel,
    query,
    page,
    limit,
    filterBy,
    orderBy,
  );

  return users;
};

export default getUsers;
