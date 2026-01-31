// Slice to track statuses that are pending client-side (not yet acknowledged by server).
export const createPendingStatusesSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => {
  return {
    /**
     * Store status parameters by idempotency key while waiting for server response.
     * Note: We ignore edits as they don't create new pending entries in the timeline.
     */
    createStatusRequest(params, idempotencyKey, editing) {
      if (editing) return;

      setScoped((state) => {
        state[idempotencyKey] = { params };
      });
    },

    /**
     * Remove the pending status once the server acknowledges creation.
     */
    createStatusSuccess(idempotencyKey) {
      setScoped((state) => {
        delete state[idempotencyKey];
      });
    },

    /**
     * Handle cleanup in case of a terminal failure.
     */
    createStatusFail(idempotencyKey) {
      setScoped((state) => {
        delete state[idempotencyKey];
      });
    },
  };
};

export default createPendingStatusesSlice;
