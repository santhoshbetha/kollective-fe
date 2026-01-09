import useBoundStore from "../stores/boundStore";

export function usePinGroup() {
  const interactions = useBoundStore((state) => state.interactions);;

  const pinToGroup = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status && status.group) {
      return interactions.pinToGroupAction(status, status.group);
    }
  };

  const unpinFromGroup = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status && status.group) {
      return interactions.unpinFromGroupAction(status, status.group);
    }
  };

  return { pinToGroup, unpinFromGroup };
}
