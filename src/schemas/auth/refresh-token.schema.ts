import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const refreshTokenSchema = {
  summary: translate("schema.summary.refreshToken"),
  tags: [translate("schema.tags.authentication")],
  security: [{ refreshTokenCookie: [] }],
  response: {
    200: z
      .object({
        message: sharedSchema.messageSchema,
      })
      .describe(`<pre><code><b>*message:</b> string</code></pre>`),
    400: sharedSchema.errorSchema,
    401: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
  swagger: {
    parameters: [
      {
        in: "schema.security.in",
        name: "schema.security.name",
        required: true,
        schema: { type: "string" },
        description: "schema.security.description",
      },
    ],
  },
};

export default refreshTokenSchema;
