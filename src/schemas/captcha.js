import z from "zod";

const captchaSchema = z.object({
  bg: z.string().catch(""),
  // Validates ISO format before catching
  created_at: z.string().datetime().catch(""),
  expires_at: z.string().datetime().catch(""),
  id: z.string().catch(""),
  puzzle: z.string().catch(""),
  type: z.string().catch(""),
});

export { captchaSchema };

