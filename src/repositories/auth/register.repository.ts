import { UserInterface } from "@/interfaces";
import UserModel from "@/models/User.model";

const createUserRepository = async (
  userData: UserInterface.IUserBody,
): Promise<UserInterface.IUserResponseModified> => {
  const user = await UserModel.create(userData);

  return user.toObject<UserInterface.IUserResponseModified>();
};

const updateEmailVerificationTokenRepository = async (
  userId: string,
  emailVerificationToken: string,
): Promise<UserInterface.IUserResponseModified | null> => {
  const user = await UserModel.findByIdAndUpdate(
    { _id: userId },
    { emailVerificationToken },
    { new: true },
  ).lean<UserInterface.IUserResponseModified | null>();

  return user;
};

export { createUserRepository, updateEmailVerificationTokenRepository };
