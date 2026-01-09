import { z } from "zod";

import { customEmojiSchema } from "./custom-emoji.js";
import { filteredArray } from "./utils.js";

const pollOptionSchema = z.object({
  title: z.string().catch(""),
  votes_count: z.number().catch(0),
});

const pollSchema = z
  .object({
    emojis: filteredArray(customEmojiSchema),
    expired: z.boolean().catch(false),
    expires_at: z.string().datetime().nullable().catch(null),
    id: z.string(),
    multiple: z.boolean().catch(false),
    options: z.array(pollOptionSchema).min(2),
    voters_count: z.number().catch(0),
    votes_count: z.number().catch(0),
    own_votes: z.array(z.number()).nonempty().nullable().catch(null),
    voted: z.boolean().catch(false),
    pleroma: z
      .object({
        non_anonymous: z.boolean().catch(false),
      })
      .optional()
      .catch(undefined),
  })
  .transform((poll) => {
    if (poll.own_votes?.length) {
      poll.voted = true;
    }

    return poll;
  });

export { pollSchema };
