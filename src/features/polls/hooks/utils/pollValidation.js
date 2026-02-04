import { z } from 'zod';

//Multi-Choice Validation
export const createVoteSchema = (poll) => {
  return z.array(z.string())
    .min(1, "Please select at least one option")
    .refine((choices) => {
      // Logic: If multiple choice is disabled, only 1 selection is allowed
      if (!poll.multiple && choices.length > 1) return false;
      return true;
    }, {
      message: "This poll only allows one selection."
    })
    .refine((choices) => {
      // Ensure the IDs actually belong to this poll
      const validIds = poll.options.map(o => o.id || o.title);
      return choices.every(id => validIds.includes(id));
    }, {
      message: "Invalid poll option selected."
    });
};
