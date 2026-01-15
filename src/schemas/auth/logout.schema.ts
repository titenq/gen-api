import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const logoutSchema = {
  summary: translate("schema.summary.logout"),
  tags: [translate("schema.tags.authentication")],
  headers: z.object({
    authorization: z.string(),
  }),
  response: {
    200: z.object({
      message: sharedSchema.messageSchema,
    }).describe(`<pre><code><b>*message:</b> string
</code></pre>`),
    400: sharedSchema.errorSchema,
    401: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default logoutSchema;
