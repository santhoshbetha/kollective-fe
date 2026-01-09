
import useBoundStore from '../stores/boundStore';

export function useDislike() {
  const interactions = useBoundStore((state) => state.interactions);

  const dislike = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.dislike(status);
    }
  };

  const undislike = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.undislike(status);
    }
  };

  const toggleDislike = (statusId) => {
    const status = useBoundStore.getState().statuses[statusId];
    if (status) {
      interactions.toggleDislike(status);
    }
  };

  return { dislike, undislike, toggleDislike };
}
