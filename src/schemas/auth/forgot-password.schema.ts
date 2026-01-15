import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const forgotPasswordSchema = {
  summary: translate("schema.summary.forgotPassword"),
  tags: [translate("schema.tags.authentication")],
  headers: z.object({
    "x-recaptcha-token": sharedSchema.xRecaptchaTokenSchema.describe(
      `<pre><code><b>*x-recaptcha-token:</b> string</code></pre>`,
    ),
  }),
  body: z
    .object({
      email: sharedSchema.emailSchema,
    })
    .describe(`<pre><code><b>*email:</b> string</code></pre>`),
  response: {
    200: z.object({
      message: sharedSchema.messageSchema,
    }).describe(`<pre><code><b>*message:</b> string
</code></pre>`),
    400: sharedSchema.errorSchema,
    404: sharedSchema.errorSchema,
    429: sharedSchema.errorSchema,
    500: sharedSchema.errorSchema,
  },
};

export default forgotPasswordSchema;
