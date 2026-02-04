import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useVote = (pollId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: vote thunk logic
    mutationFn: (choices) => 
      api.post(`/api/v1/polls/${pollId}/votes`, { choices }).then(res => res.data),

    // OPTIMISTIC UPDATE: Flip the 'voted' state instantly
    onMutate: async (choices) => {
      await queryClient.cancelQueries({ queryKey: ['polls', pollId] });
      const previousPoll = queryClient.getQueryData(['polls', pollId]);

      queryClient.setQueryData(['polls', pollId], (old) => ({
        ...old,
        voted: true,
        own_votes: choices, // Match the API structure
      }));

      return { previousPoll };
    },

    // REPLACES: voteFail rollback
    onError: (err, variables, context) => {
      queryClient.setQueryData(['polls', pollId], context.previousPoll);
    },

    // REPLACES: voteSuccess / importFetchedPoll
    onSuccess: (data) => {
      queryClient.setQueryData(['polls', pollId], data);
      // Invalidate the status that contains this poll to sync the UI
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
  });
};

//================================================================================
// /Multi-Choice Validation
// src/features/polls/api/usePollActions.js
import { createVoteSchema } from '../utils/pollValidation';

export const useVote = (poll) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (choices) => {
      // 1. VALIDATION: Run Zod check before API call
      const schema = createVoteSchema(poll);
      schema.parse(choices); // Throws error if invalid

      return api.post(`/api/v1/polls/${poll.id}/votes`, { choices })
        .then(res => res.data);
    },

    onMutate: async (choices) => {
      // ... same optimistic logic as before ...
    },
    
    onError: (err) => {
      // If it's a Zod error, show the validation message
      const message = err.errors?.[0]?.message || "Voting failed";
      toast.error(message);
    }
  });
};
/*
const PollComponent = ({ poll }) => {
  const [selected, setSelected] = useState([]);
  const { mutate: vote, isPending } = useVote(poll);

  const handleVote = () => {
    // This will trigger the Zod check in the mutationFn
    vote(selected);
  };

  return (
    <div className="poll">
      {poll.options.map((opt) => (
        <label key={opt.title}>
          <input 
            type={poll.multiple ? "checkbox" : "radio"} 
            checked={selected.includes(opt.id)}
            onChange={() => /* logic to update 'selected' array *//*}
          />
          {opt.title}
        </label>
      ))}
      <button onClick={handleVote} disabled={isPending || selected.length === 0}>
        {isPending ? 'Submitting...' : 'Vote'}
      </button>
    </div>
  );
};

*/

