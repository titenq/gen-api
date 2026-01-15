import { Document, Types } from "mongoose";

import { Roles } from "@/enums/user.enum";

export interface IUserModel extends Document {
  _id: Types.ObjectId;
  name: string;
  normalizedName: string;
  email: string;
  password: string;
  roles: Roles[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  forgotPasswordToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  roles: Roles[];
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBody {
  name: string;
  email: string;
  password: string;
}

export interface IUserResponseModified {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  isEmailVerified?: boolean | null;
  emailVerificationToken?: string | null;
  forgotPasswordToken?: string | null;
  roles: Roles[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type IEmailVerifiedResponse = Omit<
  IUserResponseModified,
  "isEmailVerified" | "emailVerificationToken" | "forgotPasswordToken"
>;

export type IGetUserByIdResponse = Omit<
  IUserResponseModified,
  "emailVerificationToken" | "forgotPasswordToken"
>;

export interface IGetUserByIdParams {
  id: string;
}

export interface IGetUsersQuery {
  page?: number;
  limit?: number;
  filterBy?: string;
  orderBy?: "asc" | "desc";
  key?: string;
  value?: string;
}

export interface IGetUsersResponse {
  users: IUserResponseModified[];
  totalPages: number;
  currentPage: number;
  perPage: number;
  totalCount: number;
}
