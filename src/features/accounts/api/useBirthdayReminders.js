import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useBirthdayReminders = (month, day) => {
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // Cache key includes month and day so switching dates is instant
    queryKey: ['accounts', 'birthdays', { month, day }],
    queryFn: async () => {
      const response = await api.get('/api/v1/kollective/birthdays', {
        params: { month, day }
      });
      
      const accounts = response.data;

      // SIDE-LOADING: Seed the global account cache
      // This replaces dispatch(importFetchedAccounts(data))
      importAccounts(accounts);

      return accounts;
    },
    // Only run if the user is logged in (handled by your axios interceptor/enabled check)
    staleTime: 1000 * 60 * 60, // Birthdays don't change; cache for 1 hour
  });
};

/*
const BirthdayWidget = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const { data: birthdayBoys, isLoading } = useBirthdayReminders(month, day);

  if (isLoading) return <Spinner />;
  if (!birthdayBoys?.length) return null;

  return (
    <div className="birthday-reminders">
      <h3>🎂 Today's Birthdays</h3>
      {birthdayBoys.map(account => (
        <AccountAvatar key={account.id} account={account} tooltip={account.username} />
      ))}
    </div>
  );
};

*/
