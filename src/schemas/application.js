import { z } from "zod";

const applicationSchema = z
  .object({
    name: z.string().catch(""),
    website: z.string().url().nullable().catch(null),
    scopes: z.array(z.string()).catch([]),
    // Using catch([]) inside the array if you want to be ultra-safe
    redirect_uris: z.array(z.string().url()).optional().catch(undefined),
    redirect_uri: z.string().url().optional().catch(undefined),
    client_id: z.string().optional().catch(undefined),
    client_secret: z.string().optional().catch(undefined),
    client_secret_expires_at: z.number().optional().catch(0),
  })
  .transform(({ redirect_uris, redirect_uri, ...rest }) => ({
    ...rest,
    // Logic: use the array if it exists, otherwise wrap the singular URI, otherwise empty array
    redirect_uris: redirect_uris ?? (redirect_uri ? [redirect_uri] : []),
  }));


export { applicationSchema };

