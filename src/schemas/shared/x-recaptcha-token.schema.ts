import { z } from "zod";

import env from "@/config/env";

const { NODE_ENV } = env;

const xRecaptchaTokenSchema = z
  .string("validation.xRecaptchaToken.required")
  .refine(
    (token) =>
      NODE_ENV === "development" ? true : /^[A-Za-z0-9_-]{40,}$/.test(token),
    {
      message: "validation.xRecaptchaToken.invalidFormat",
    },
  );

export default xRecaptchaTokenSchema;
