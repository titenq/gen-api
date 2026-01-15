import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";

const forgotPasswordRepository = async (
  userId: string,
  token: string,
): Promise<UserInterface.IUserModel | null> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { forgotPasswordToken: token },
    { new: true },
  ).lean<UserInterface.IUserModel | null>();

  return user;
};

export default forgotPasswordRepository;
