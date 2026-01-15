import { z } from "zod";

const errorSchema = z.union([
  z.object({
    error: z.boolean("validation.error.error"),
    message: z.string("validation.error.message"),
    statusCode: z.number("validation.error.statusCode"),
  }),
  z.instanceof(Buffer),
]).describe(`<pre><code><b>*error:</b> boolean
<b>*message:</b> string
<b>*statusCode:</b> number
</code></pre>`);

export default errorSchema;
