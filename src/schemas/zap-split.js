import z from "zod";

import { accountSchema } from "./account.js";

const addMethodsToAccount = (account) => ({
  ...account,
  get: (key) => account?.[key],
  getIn: (path) => path.reduce((acc, key) => acc?.[key], account),
  toJS: () => account,
});

const baseZapAccountSchema = z.object({
  account: accountSchema.transform(addMethodsToAccount),
  message: z.string().catch(""),
  weight: z.number().catch(0),
});

export { baseZapAccountSchema };
