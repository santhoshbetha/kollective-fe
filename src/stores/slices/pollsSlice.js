import normalizeStatus from "../../normalizers/status";

const normalizePoll = (poll) => {
  const status = { poll };
  return normalizeStatus(status).poll;
};

export function createPollsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    importPolls(polls) {
      setScoped((state) => {
        (polls || []).forEach((poll) => {
          if (poll && poll.id) {
            state[poll.id] = normalizePoll(poll);
          }
        });
      });
    },

    vote(pollId, choices) {
      const root = rootGet();
      try {
        const res = fetch(`/api/v1/polls/${pollId}/votes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${root.auth.token}`,
          },
          body: JSON.stringify({ choices }),
        });
        if (!res.ok) throw new Error(`Failed to vote on poll (${res.status})`);
        const data = res.json();

        root.importer?.importFetchedPoll?.([data]);
        return data;
      } catch (err) {
        console.error("pollsSlice.vote failed", err);
        return null;
      }
    },

    fetchPoll(pollId) {
      const root = rootGet();
      try {
        const res = fetch(`/api/v1/polls/${pollId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${root.auth.token}`,
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch poll (${res.status})`);
        const data = res.json();

        root.importer?.importFetchedPoll?.([data]);
        return data;
      } catch (err) {
        console.error("pollsSlice.fetchPoll failed", err);
        return null;
      }
    },
    
  };
}

export default createPollsSlice;
