import { buildQuery, buildResponse } from "@/helpers/response-pagination";
import createErrorMessage from "@/helpers/create-error-message";
import getUsersRepository from "@/repositories/user/get-users.repository";
import { UserInterface } from "@/interfaces";

const getUsersService = async (queryString: UserInterface.IGetUsersQuery) => {
  const {
    page,
    limit,
    filterBy = "createdAt",
    orderBy = "desc",
    key,
    value,
  } = queryString;

  try {
    const query = buildQuery(key, value);

    const numPage = Number(page) || 1;
    const numLimit = Number(limit) || 50;

    const { resources: users, count } = await getUsersRepository({
      query,
      page: numPage,
      limit: numLimit,
      filterBy,
      orderBy,
    });

    return buildResponse("users", users, count, numPage, numLimit);
  } catch (_error) {
    return createErrorMessage("error.user.getUsers", 500);
  }
};

export default getUsersService;
