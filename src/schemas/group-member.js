import z from "zod";

import { accountSchema } from "./account.js";

const GroupRoles = {
  OWNER: "owner",
  ADMIN: "admin",
  USER: "user",
};

const groupMemberSchema = z.object({
  id: z.string(),
  account: accountSchema,
  role: z.nativeEnum(GroupRoles),
});

export { groupMemberSchema, GroupRoles };
