import { z } from "zod";

import isValidISODate from "@/helpers/is-valid-iso-date";

const updatedAtSchema = z.union([
  z.date("validation.updatedAt"),
  z
    .string()
    .refine((val) => isValidISODate(val), {
      message: "validation.updatedAt",
    })
    .transform((val) => new Date(val)),
]);

export default updatedAtSchema;
