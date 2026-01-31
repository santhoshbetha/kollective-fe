import normalizeStatus from "../../normalizers/status";

const normalizePoll = (poll) => {
  if (!poll) return null;
  const status = { poll };
  return normalizeStatus(status).poll;
};

export function createPollsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    importPollsData(polls) {
      setScoped((state) => {
        (polls || []).forEach((poll) => {
          if (poll?.id) {
            state[poll.id] = normalizePoll(poll);
          }
        });
      });
    },

    async vote(pollId, choices) {
      const actions = getActions(); 
      try {
        const res = await fetch(`/api/v1/polls/${pollId}/votes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Assuming Authorization is handled centrally or via root.auth
          },
          body: JSON.stringify({ choices }),
        });

        if (!res.ok) throw new Error(`Failed to vote (${res.status})`);
        
        const data = await res.json();
        // Coordination with importer to update state across the app
        actions.importFetchedPoll?.([data]);
        
        return data;
      } catch (err) {
        console.error("pollsSlice.vote failed", err);
        return null;
      }
    },

    async fetchPoll(pollId) {
      const actions = getActions(); 
      try {
        const res = await fetch(`/api/v1/polls/${pollId}`);
        if (!res.ok) throw new Error(`Failed to fetch poll (${res.status})`);
        
        const data = await res.json();
        actions.importFetchedPoll?.([data]);
        
        return data;
      } catch (err) {
        console.error("pollsSlice.fetchPoll failed", err);
        return null;
      }
    },
    
  };
}

export default createPollsSlice;
