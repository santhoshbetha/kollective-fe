import { useSuggestions, useDismissSuggestion } from "../api/useSuggestions";

const SuggestionsList = () => {
  const { data, isLoading } = useSuggestions();
  const { mutate: dismiss } = useDismissSuggestion();

  if (isLoading) return <Skeleton />;

  return (
    <div className="suggestions-list">
      {data?.pages.map(page => 
        page.items.map(item => {
          const account = page.isV2 ? item.account : item;
          return (
            <div key={account.id} className="suggestion-card">
              <AccountCard account={account} />
              <button onClick={() => dismiss(account.id)}>Dismiss</button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SuggestionsList;