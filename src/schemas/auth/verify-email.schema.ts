import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const verifyEmailSchema = {
  summary: translate("schema.summary.verifyEmail"),
  tags: [translate("schema.tags.authentication")],
  body: z.object({
    token: z.string("validation.tokenVerifyEmail"),
  }).describe(`<pre><code><b>*token:</b> string
</code></pre>`),
  response: {
    200: z.object({
      _id: sharedSchema._idSchema,
      name: sharedSchema.nameSchema,
      email: sharedSchema.emailSchema,
      createdAt: sharedSchema.createdAtSchema,
      updatedAt: sharedSchema.updatedAtSchema,
    }).describe(`<pre><code><b>*_id:</b> string
<b>*name:</b> string
<b>*email:</b> string
<b>*createdAt:</b> Date
<b>*updatedAt:</b> Date
</code></pre>`),
    400: sharedSchema.errorSchema,
    401: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default verifyEmailSchema;
