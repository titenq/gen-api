import { z } from "zod";

const passwordSchema = z
  .string("validation.password.required")
  .min(8, "validation.password.min")
  .max(16, "validation.password.max")
  .refine((password) => /[A-Z]/.test(password), "validation.password.uppercase")
  .refine((password) => /[a-z]/.test(password), "validation.password.lowercase")
  .refine((password) => /\d/.test(password), "validation.password.number")
  .refine(
    (password) => /[@$!%*?&]/.test(password),
    "validation.password.special",
  );

export default passwordSchema;
