import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

// 1. Fetch Backups
export const useBackups = () => {
  return useQuery({
    queryKey: ['backups', 'list'],
    queryFn: () => api.get('/api/v1/pleroma/backups').then(res => res.data),
    // If a backup is being processed, poll every 10s to check status
    refetchInterval: (query) => 
      query.state.data?.some(b => b.status === 'processing') ? 10000 : false,
  });
};

// 2. Create Backup Mutation
export const useCreateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/api/v1/pleroma/backups').then(res => res.data),
    onSuccess: () => {
      // Refresh the list immediately
      queryClient.invalidateQueries({ queryKey: ['backups', 'list'] });
      toast.success("Backup request submitted!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Failed to create backup");
    }
  });
};


/*
const BackupManager = () => {
  const { data: backups, isLoading } = useBackups();
  const { mutate: create, isPending } = useCreateBackup();

  return (
    <div className="backup-section">
      <h3>Account Backups</h3>
      <button 
        onClick={() => create()} 
        disabled={isPending || backups?.some(b => b.status === 'processing')}
      >
        {isPending ? 'Requesting...' : 'Request New Backup'}
      </button>

      {isLoading ? <p>Loading backups...</p> : (
        <ul className="backup-list">
          {backups?.map(backup => (
            <li key={backup.id}>
              <span>{new Date(backup.inserted_at).toLocaleDateString()}</span>
              <strong>{backup.status}</strong>
              {backup.status === 'complete' && (
                <a href={backup.url} download>Download</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

*/