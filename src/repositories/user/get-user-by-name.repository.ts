import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";

const getUserByNameRepository = async (
  name: string,
): Promise<UserInterface.IUserResponse | null> => {
  const user = await UserModel.findOne({ name })
    .select("+password +emailVerificationToken")
    .lean<UserInterface.IUserResponse | null>();

  return user;
};

export default getUserByNameRepository;
