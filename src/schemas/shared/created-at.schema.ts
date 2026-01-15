import { z } from "zod";

import isValidISODate from "@/helpers/is-valid-iso-date";

const createdAtSchema = z.union([
  z.date("validation.createdAt"),
  z
    .string()
    .refine((val) => isValidISODate(val), {
      message: "validation.createdAt",
    })
    .transform((val) => new Date(val)),
]);

export default createdAtSchema;
