import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";

const getUserByIdAndEmailTokenRepository = async (
  userId: string,
  token: string,
): Promise<UserInterface.IUserResponse | null> => {
  return await UserModel.findOne({
    _id: userId,
    emailVerificationToken: token,
  });
};

const verifyUserEmailRepository = async (
  userId: string,
): Promise<UserInterface.IUserResponse | null> => {
  return await UserModel.findOneAndUpdate(
    { _id: userId },
    { $set: { isEmailVerified: true, emailVerificationToken: null } },
    { new: true },
  ).exec();
};

export { getUserByIdAndEmailTokenRepository, verifyUserEmailRepository };
