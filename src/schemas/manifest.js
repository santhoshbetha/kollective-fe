import z from "zod";
import { filteredArray } from "./utils.js";

const screenshotItemSchema = z.object({
  form_factor: z.enum(["narrow", "wide"]).optional().catch(undefined),
  label: z.string().optional().catch(undefined),
  platform: z
    .enum([
      "android", "chromeos", "ipados", "ios", "kaios", "macos", 
      "windows", "xbox", "chrome_web_store", "itunes", 
      "microsoft-inbox", "microsoft-store", "play",
    ])
    .optional()
    .catch(undefined),
  sizes: z
    .string()
    .refine((value) =>
      // Supports up to 99,999px and handles multiple spaces
      value.trim().split(/\s+/).every((v) => /^[1-9]\d*[xX][1-9]\d*$/.test(v)),
    )
    .optional()
    .catch(undefined),
  src: z.string().url(), // Leave without catch so filteredArray knows it's "bad"
  type: z.string().optional().catch(undefined),
});

// Use your utility to keep valid screenshots while dropping malformed ones
const screenshotsSchema = filteredArray(screenshotItemSchema).catch([]);

export { screenshotsSchema };

