import { useMutationState } from '@tanstack/react-query';

//"Outgoing Queue"
//Thinking
//To implement an Outgoing Queue in TanStack Query, you leverage the Mutation Cache. 
//This allows you to "watch" every mutation currently in flight or paused by the network.

export const useOutgoingQueue = () => {
  // Grab all mutations that haven't finished yet
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => ({
      id: mutation.meta?.id || mutation.mutationId,
      type: mutation.meta?.type || 'action',
      variables: mutation.state.variables,
      isPaused: mutation.state.isPaused,
    }),
  });

  return pendingMutations;
};
