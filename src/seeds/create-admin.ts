import UserModel from "@/models/User.model";
import env from "@/config/env";
import translate from "@/helpers/translate";
import { Roles } from "@/enums/user.enum";

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env;

  const userCount = await UserModel.countDocuments();

  if (userCount === 0) {
    await UserModel.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      roles: [Roles.ADMIN, Roles.USER],
      isEmailVerified: true,
    });

    console.log(translate("message.seeds.adminCreated"));
  } else {
    console.log(translate("message.seeds.adminAlreadyExists"));
  }
};

export default createAdmin;
