
import { selectEntity } from '../entity-store/selectors';
import { useGetState } from './useGetState';
import useBoundStore from '../stores/boundStore';
import normalizeStatus from '../normalizers/status';

export function useReplyCompose() {
  const getState = useGetState();
  const replyCompose = (statusId) => {
    const state = getState();
    const statuses = state.statuses || {};

    const status =
      typeof statuses.get === 'function' ? statuses.get(statusId) : statuses[statusId];

    if (status) {
      useBoundStore.getState().compose.replyCompose(status);
      return;
    }

    const entity = selectEntity(state, 'Statuses', statusId);
    if (entity) {
      useBoundStore.getState().compose.replyCompose(normalizeStatus(entity));
      return;
    }
  };

  return { replyCompose };
}