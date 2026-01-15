import UserModel from "@/models/User.model";
import { UserInterface } from "@/interfaces";

const getUserByForgotPasswordTokenRepository = async (
  token: string,
): Promise<UserInterface.IUserModel | null> => {
  return await UserModel.findOne({ forgotPasswordToken: token });
};

const updatePasswordRepository = async (
  user: UserInterface.IUserModel,
  password: string,
): Promise<UserInterface.IUserModel> => {
  user.password = password;
  user.forgotPasswordToken = null;

  return await user.save();
};

export { getUserByForgotPasswordTokenRepository, updatePasswordRepository };
