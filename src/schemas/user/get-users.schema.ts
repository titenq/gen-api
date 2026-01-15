import { z } from "zod";

import * as sharedSchema from "@/schemas/shared";
import translate from "@/helpers/translate";

const userResponseSchema = z.object({
  _id: sharedSchema._idSchema,
  name: sharedSchema.nameSchema,
  email: sharedSchema.emailSchema,
  isEmailVerified: z.boolean("validation.isEmailVerified").optional(),
  emailVerificationToken: z
    .string("validation.emailVerificationToken")
    .optional(),
  forgotPasswordToken: z.string("validation.forgotPasswordToken").optional(),
  roles: sharedSchema.rolesSchema,
  createdAt: sharedSchema.createdAtSchema,
  updatedAt: sharedSchema.updatedAtSchema,
});

const getUsersSchema = {
  summary: translate("schema.summary.getUsers"),
  tags: [translate("schema.tags.users")],
  response: {
    200: z.object({
      users: z.array(userResponseSchema),
      totalPages: z
        .number("validation.totalPages")
        .nonnegative("validation.nonnegative"),
      currentPage: z
        .number("validation.currentPage")
        .nonnegative("validation.nonnegative"),
      perPage: z
        .number("validation.perPage")
        .nonnegative("validation.nonnegative"),
      totalCount: z
        .number("validation.totalCount")
        .nonnegative("validation.nonnegative"),
    }),
    400: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default getUsersSchema;
