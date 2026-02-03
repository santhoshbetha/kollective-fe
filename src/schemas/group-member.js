import z from "zod";

import { accountSchema } from "./account.js";

const GroupRoles = {
  OWNER: "owner",
  ADMIN: "admin",
  USER: "user",
}

const groupMemberSchema = z.object({
  id: z.string(),
  account: accountSchema,
  // Catch handles unknown roles by defaulting to USER
  role: z.nativeEnum(GroupRoles).catch(GroupRoles.USER),
});

export { groupMemberSchema, GroupRoles };

