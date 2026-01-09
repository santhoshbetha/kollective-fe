import useBoundStore from '../../stores/boundStore.js';
import { useDismissEntity, useTransaction } from '../../entity-store/hooks/index.js';
import { useApi } from '../../hooks/useApi.js';
import { useLoggedIn } from '../../hooks/useLoggedIn.js';
import { statusSchema } from '../../schemas/status.js';

/**
 * Bookmark and undo a bookmark, with optimistic update.
 *
 * https://docs.joinmastodon.org/methods/statuses/#bookmark
 * POST /api/v1/statuses/:id/bookmark
 *
 * https://docs.joinmastodon.org/methods/statuses/#unbookmark
 * POST /api/v1/statuses/:id/unbookmark
 */
function useBookmark() {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  const path = ["Statuses", 'bookmarks'];

  const { dismissEntity } = useDismissEntity(path, async (statusId) => {
    const response = await api.post(`/api/v1/statuses/${statusId}/unbookmark`);
    return response;
  });

  function bookmarkEffect(statusId) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          bookmarked: true,
        }),
      },
    });
  }

  function unbookmarkEffect(statusId) {
    transaction({
      Statuses: {
        [statusId]: (status) => ({
          ...status,
          bookmarked: false,
        }),
      },
    });
  }

  async function bookmark(statusId) {
    if (!isLoggedIn) return { success: false };
    bookmarkEffect(statusId);

    try {
      const response = await api.post(`/api/v1/statuses/${statusId}/bookmark`);
      const result = statusSchema.parse(await response.json());
      if (result) {
        useBoundStore.getState().entities.importEntities('Statuses', [result], 'bookmarks', 'start');
      }
      return { success: true };
    } catch (e) {
      unbookmarkEffect(statusId);
      return { success: false };
    }
  }

  async function unbookmark(statusId) {
    if (!isLoggedIn) return { success: false };
    unbookmarkEffect(statusId);

    try {
      await dismissEntity(statusId);
      return { success: true };
    } catch (e) {
      bookmarkEffect(statusId);
      return { success: false };
    }
  }

  return {
    bookmark,
    unbookmark,
    bookmarkEffect,
    unbookmarkEffect,
  };
}

export { useBookmark };