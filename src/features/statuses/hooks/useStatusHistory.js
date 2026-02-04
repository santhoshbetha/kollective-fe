import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useStatusHistory = (statusId) => {
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // Unique key for the edit history of this specific status
    queryKey: ['statuses', 'history', statusId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/statuses/${statusId}/history`);

      // SIDE-LOADING: Seed account cache for people who edited the post
      // Replaces: dispatch(importFetchedAccounts(data.map(x => x.account)))
      const accounts = data.map(item => item.account).filter(Boolean);
      importAccounts(accounts);

      return data; // Array of StatusEdit objects
    },
    enabled: !!statusId,
    // Edit history is immutable (once an edit is recorded, it doesn't change)
    staleTime: Infinity, 
  });
};

/*
const StatusHistoryModal = ({ statusId }) => {
  const { data: history, isLoading, isError } = useStatusHistory(statusId);

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
