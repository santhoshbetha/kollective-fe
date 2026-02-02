/**
 * Removes all items associated with a specific account ID.
 * Applicable to Statuses and Notifications.
 */
export const deleteByAccountInPages = (oldData, accountId) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      // Filters statuses where the author is the accountId
      // OR notifications where the actor is the accountId
      items: page.items.filter((item) => {
        const itemAccountId = item.account?.id || item.account; // Handle both objects/IDs
        return itemAccountId !== accountId;
      }),
    })),
  };
};
