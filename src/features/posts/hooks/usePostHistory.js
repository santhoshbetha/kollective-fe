import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePostImporter } from './usePostImporter';

export const usePostHistory = (postId) => {
  const { importAccounts } = usePostImporter();

  return useQuery({
    // Unique key for the edit history of this specific post
    queryKey: [posts', 'history', postId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/posts/${postId}/history`);

      // SIDE-LOADING: Seed account cache for people who edited the post
      // Replaces: dispatch(importFetchedAccounts(data.map(x => x.account)))
      const accounts = data.map(item => item.account).filter(Boolean);
      importAccounts(accounts);

      return data; // Array of PostEdit objects
    },
    enabled: !!postId,
    // Edit history is immutable (once an edit is recorded, it doesn't change)
    staleTime: Infinity, 
  });
};

/*
const PostHistoryModal = ({ postId }) => {
  const { data: history, isLoading, isError } = usePostHistory(postId);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;

  return (
    <div className="history-modal">
      <h3>Edit History</h3>
      {history.map((edit, index) => (
        <div key={index} className="history-item">
          <div className="edit-meta">
            <AccountAvatar account={edit.account} size={24} />
            <span>Edited {edit.created_at}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: edit.content }} />
        </div>
      ))}
    </div>
  );
};

*/
