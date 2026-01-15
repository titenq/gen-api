import { z } from "zod";
import { Types } from "mongoose";

const _idSchema = z.union([
  z.instanceof(Types.ObjectId, {
    message: "validation._id",
  }),
  z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "validation._id",
    })
    .transform((val) => new Types.ObjectId(val)),
]);

export default _idSchema;
