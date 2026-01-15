import { z } from "zod";

import { Roles } from "@/enums/user.enum";

const RolesEnum = z.enum(Roles, {
  error: "validation.rolesEnum",
});

const rolesSchema = z.array(RolesEnum);

export default rolesSchema;
