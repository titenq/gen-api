import UserModel from "@/models/User.model";
import { UserInterface } from "@/interfaces";

const getUserByEmailRepository = async (
  email: string,
): Promise<UserInterface.IUserResponse | null> => {
  const user = await UserModel.findOne({ email })
    .select("+password +emailVerificationToken")
    .lean<UserInterface.IUserResponse | null>();

  return user;
};

export default getUserByEmailRepository;
