import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const resetPasswordSchema = {
  summary: translate("schema.summary.resetPassword"),
  tags: [translate("schema.tags.authentication")],
  body: z.object({
    token: z.string("validation.tokenResetPassword"),
    password: sharedSchema.passwordSchema,
  }).describe(`<pre><code><b>*token:</b> string
<b>*password:</b> string
</code></pre>`),
  response: {
    200: z.object({
      message: sharedSchema.messageSchema,
    }).describe(`<pre><code><b>*message:</b> string
</code></pre>`),
    400: sharedSchema.errorSchema,
    401: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default resetPasswordSchema;
