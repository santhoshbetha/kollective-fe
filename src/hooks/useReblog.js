import { useTransaction } from '../entity-store/hooks/useTransaction';
import { selectEntity } from '../entity-store/selectors';
import { useGetState } from './useGetState';
import normalizeStatus from '../normalizers/status';
import useBoundStore from '../stores/boundStore';

export function useReblog() {
  const getState = useGetState();
  const { transaction } = useTransaction();

  function reblogEffect(statusId) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          reblogged: true,
          reblogs_count: status.reblogs_count + 1,
        }),
      },
    });
  }

  function unreblogEffect(statusId) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          reblogged: false,
          reblogs_count: status.reblogs_count - 1,
        }),
      },
    });
  }

  const reblog = (statusId) => {
    let status = getState().statuses.get(statusId);

    if (status) {
      useBoundStore.getState().interactions.reblog(status, { reblogEffect, unreblogEffect });
      return;
    }

    status = selectEntity(getState(), 'statuses', statusId);
    if (status) {
      useBoundStore.getState().interactions.reblog(normalizeStatus(status), { reblogEffect, unreblogEffect });
      return;
    }
  };

  const unreblog = (statusId) => {
    let status = getState().statuses.get(statusId);

    if (status) {
      useBoundStore.getState().interactions.unreblog(status, { reblogEffect, unreblogEffect });
      return;
    }

    status = selectEntity(getState(), 'statuses', statusId);
    if (status) {
      useBoundStore.getState().interactions.unreblog(normalizeStatus(status), { reblogEffect, unreblogEffect });
      return;
    }
  };

  const toggleReblog = (statusId) => {
    let status = getState().statuses.get(statusId);

    if (status) {
      useBoundStore.getState().interactions.toggleReblog(status, { reblogEffect, unreblogEffect });
      return;
    }

    status = selectEntity(getState(), 'statuses', statusId);
    if (status) {
      useBoundStore.getState().interactions.toggleReblog(normalizeStatus(status), { reblogEffect, unreblogEffect });
      return;
    }
  };

  return { reblog, unreblog, toggleReblog };
}
