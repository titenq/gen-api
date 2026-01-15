import { z } from "zod";

const emailSchema = z
  .email("validation.email.invalid")
  .max(254, { error: "validation.email.max" });

export default emailSchema;
