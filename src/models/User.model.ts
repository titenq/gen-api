import argon2 from "argon2";

import mongoose from "@/db";
import { Roles } from "@/enums/user.enum";
import { UserInterface } from "@/interfaces";
import normalizeString from "@/helpers/normalize-string";

const UserSchema = new mongoose.Schema<UserInterface.IUserModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    normalizedName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    roles: {
      type: [String],
      enum: Object.values(Roles),
      default: [Roles.USER],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
      select: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.normalizedName = normalizeString(this.name);
  }

  if (this.isModified("password")) {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 1024,
      timeCost: 5,
      parallelism: 1,
    });
  }
});

const UserModel = mongoose.model<UserInterface.IUserModel>("User", UserSchema);

export default UserModel;
