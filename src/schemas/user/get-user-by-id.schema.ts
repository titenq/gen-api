import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const getUserByIdSchema = {
  summary: translate("schema.summary.getUserById"),
  tags: [translate("schema.tags.users")],
  params: z.object({
    id: sharedSchema.idSchema.describe(
      "<pre><code><b>*id:</b> string</code></pre>",
    ),
  }),
  response: {
    200: z.union([
      z.object({
        _id: sharedSchema._idSchema,
        name: sharedSchema.nameSchema,
        email: sharedSchema.emailSchema,
        roles: sharedSchema.rolesSchema,
        isEmailVerified: z.boolean("validation.isEmailVerified").optional(),
        createdAt: sharedSchema.createdAtSchema,
        updatedAt: sharedSchema.updatedAtSchema,
      }),
      z.instanceof(Buffer),
    ]).describe(`<pre><code><b>*_id:</b> string
<b>*name:</b> string
<b>*email:</b> string
<b>*roles:</b> string[]
<b>isEmailVerified:</b> boolean
<b>*createdAt:</b> Date
<b>*updatedAt:</b> Date
</code></pre>`),
    400: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default getUserByIdSchema;
