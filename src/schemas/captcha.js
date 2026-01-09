import z from "zod";

const captchaSchema = z.object({
  bg: z.string().catch(""),
  created_at: z.string().catch(""),
  expires_at: z.string().catch(""),
  id: z.string().catch(""),
  puzzle: z.string().catch(""),
  type: z.string().catch(""),
});

export { captchaSchema };
