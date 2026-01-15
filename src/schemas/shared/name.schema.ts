import { z } from "zod";

const nameSchema = z
  .string("validation.name.required")
  .min(3, { error: "validation.name.min" })
  .max(32, { error: "validation.name.max" });

export default nameSchema;
