import useBoundStore from '../stores/boundStore';

export function usePin() {
  const interactions = useBoundStore((state) => state.interactions);

  const pin = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.pinAction(status);
    }
  };

  const unpin = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.unpinAction(status);
    }
  };

  const togglePin = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.togglePinAction(status);
    }
  };

  return { pin, unpin, togglePin };
}
