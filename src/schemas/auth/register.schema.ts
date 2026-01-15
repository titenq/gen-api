import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const userResponseSchema = z.object({
  _id: sharedSchema._idSchema,
  name: sharedSchema.nameSchema,
  email: sharedSchema.emailSchema,
  isEmailVerified: z.boolean("validation.isEmailVerified").nullish(),
  emailVerificationToken: z
    .string("validation.emailVerificationToken")
    .nullish(),
  forgotPasswordToken: z.string("validation.forgotPasswordToken").nullish(),
  createdAt: sharedSchema.createdAtSchema,
  updatedAt: sharedSchema.updatedAtSchema,
});

const registerSchema = {
  summary: translate("schema.summary.registerUser"),
  tags: [translate("schema.tags.authentication")],
  headers: z.object({
    "x-recaptcha-token": sharedSchema.xRecaptchaTokenSchema.describe(
      `<pre><code><b>*x-recaptcha-token:</b> string</code></pre>`,
    ),
  }),
  body: z.object({
    name: sharedSchema.nameSchema,
    email: sharedSchema.emailSchema,
    password: sharedSchema.passwordSchema,
  }).describe(`<pre><code><b>*name:</b> string
<b>*email:</b> string
<b>*password:</b> string
</code></pre>`),
  response: {
    201: userResponseSchema.describe(`<pre><code><b>*_id:</b> string
<b>*name:</b> string
<b>*email:</b> string
<b>isEmailVerified:</b> boolean
<b>emailVerificationToken:</b> string
<b>forgotPasswordToken:</b> string
<b>*createdAt:</b> Date
<b>*updatedAt:</b> Date
</code></pre>`),
    400: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    409: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default registerSchema;
