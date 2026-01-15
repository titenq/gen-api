import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const loginSchema = {
  summary: translate("schema.summary.login"),
  tags: [translate("schema.tags.authentication")],
  headers: z.object({
    "x-recaptcha-token": sharedSchema.xRecaptchaTokenSchema.describe(
      `<pre><code><b>*x-recaptcha-token:</b> string</code></pre>`,
    ),
  }),
  body: z.object({
    email: sharedSchema.emailSchema,
    password: sharedSchema.passwordSchema,
  }).describe(`<pre><code><b>*email:</b> string
<b>*password:</b> string
</code></pre>`),
  response: {
    200: z.object({
      _id: sharedSchema._idSchema,
      name: sharedSchema.nameSchema,
      email: sharedSchema.emailSchema,
      roles: sharedSchema.rolesSchema,
      createdAt: sharedSchema.createdAtSchema,
      updatedAt: sharedSchema.updatedAtSchema,
    }).describe(`<pre><code><b>*_id:</b> string
<b>*name:</b> string
<b>*email:</b> string
<b>*roles:</b> string[]
<b>*createdAt:</b> Date
<b>*updatedAt:</b> Date
</code></pre>`),
    400: sharedSchema.errorSchema,
    401: sharedSchema.errorSchema,
    403: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default loginSchema;
