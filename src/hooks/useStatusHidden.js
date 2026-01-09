import useBoundStore from '../stores/boundStore';
import { useGetState } from './useGetState';

export function useStatusHidden() {
  const getState = useGetState();

  const revealStatus = (statusId) => {
    useBoundStore.getState().statuses.revealStatus(statusId);
  };

  const hideStatus = (statusId) => {
    useBoundStore.getState().statuses.hideStatus(statusId);
  };

  const toggleStatusHidden = (statusId) => {
    const status = getState().statuses.get(statusId);
    if (status) {
      useBoundStore.getState().statuses.toggleStatusHidden(status);
    }
  };

  return { revealStatus, hideStatus, toggleStatusHidden };
}
