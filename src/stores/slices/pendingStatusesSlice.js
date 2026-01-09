// Slice to track statuses that are pending client-side (not yet acknowledged by server).
export const createPendingStatusesSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => {
  return {
    createStatusRequest(params, idempotencyKey, editing) {
      setScoped((state) => {
        if (editing) {
          return state;
        }
        state[idempotencyKey] = {
          params,
        };
      });
    },

    createStatusSuccess(idempotencyKey) {
      setScoped((state) => {
        delete state[idempotencyKey];
      });
    },
  };
};

export default createPendingStatusesSlice;
