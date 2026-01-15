import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const resendLinkSchema = {
  summary: translate("schema.summary.resendLink"),
  tags: [translate("schema.tags.authentication")],
  body: z.object({
    email: sharedSchema.emailSchema,
  }).describe(`<pre><code><b>*email:</b> string
</code></pre>`),
  response: {
    200: z.object({
      message: sharedSchema.messageSchema,
    }).describe(`<pre><code><b>*message:</b> string
</code></pre>`),
    400: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    409: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default resendLinkSchema;
