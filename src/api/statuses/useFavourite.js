import { selectEntity } from '../../entity-store/selectors.js';
import { useGetState } from '../../hooks/useGetState.js';
import normalizeStatus from '../../normalizers/status.js';
import useBoundStore from '../../stores/boundStore.js';

export function useFavourite() {
  const getState = useGetState();

  const favourite = (statusId) => {
    const state = getState();
    const statuses = state.statuses || {};
    const status = typeof statuses.get === 'function' ? statuses.get(statusId) : statuses[statusId];

    if (status) {
      useBoundStore.getState().interactions.favourite(status);
      return;
    }

    const entity = selectEntity(state, 'Statuses', statusId);
    if (entity) {
      useBoundStore.getState().interactions.favourite(normalizeStatus(entity));
      return;
    }
  };

  const unfavourite = (statusId) => {
    const state = getState();
    const statuses = state.statuses || {};
    const status = typeof statuses.get === 'function' ? statuses.get(statusId) : statuses[statusId];

    if (status) {
      useBoundStore.getState().interactions.unfavourite(status);
      return;
    }

    const entity = selectEntity(state, 'Statuses', statusId);
    if (entity) {
      useBoundStore.getState().interactions.unfavourite(normalizeStatus(entity));
      return;
    }
  };

  const toggleFavourite = (statusId) => {
    const state = getState();
    const statuses = state.statuses || {};
    const status = typeof statuses.get === 'function' ? statuses.get(statusId) : statuses[statusId];

    if (status) {
      useBoundStore.getState().interactions.toggleFavourite(status);
      return;
    }

    const entity = selectEntity(state, 'Statuses', statusId);
    if (entity) {
      useBoundStore.getState().interactions.toggleFavourite(normalizeStatus(entity));
      return;
    }
  };

  return { favourite, unfavourite, toggleFavourite };
}
