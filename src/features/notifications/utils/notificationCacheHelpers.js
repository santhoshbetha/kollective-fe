/**
 * Removes notifications associated with a specific status ID.
 * Works with TanStack Infinite Query 'pages' structure.
 */
export const deleteByStatusInPages = (oldData, statusId) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      // Mastodon notifications have the status inside a 'status' property
      items: page.items.filter((notification) => 
        notification.status?.id !== statusId
      ),
    })),
  };
};
