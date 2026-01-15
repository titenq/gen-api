import { z } from "zod";

import translate from "@/helpers/translate";
import * as sharedSchema from "@/schemas/shared";

const protoSchema = {
  summary: translate("schema.summary.downloadProto"),
  tags: [translate("schema.tags.proto")],
  produces: ["application/zip", "application/json"],
  response: {
    200: z.instanceof(Buffer).describe("Proto files"),
    429: sharedSchema.errorSchema.describe("Too many requests"),
    500: sharedSchema.errorSchema.describe("Internal server error"),
  },
};

export { protoSchema };
