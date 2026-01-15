import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";

const getUserByIdRepository = async (
  id: string,
): Promise<UserInterface.IGetUserByIdResponse | null> => {
  const user = await UserModel.findById(id)
    .select("-__v")
    .lean<UserInterface.IGetUserByIdResponse | null>();

  return user;
};

export default getUserByIdRepository;
