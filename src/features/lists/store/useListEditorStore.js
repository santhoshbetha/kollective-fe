//(Zustand for UI state)
const ListEditor = ({ query }) => {
  // TanStack handles the throttling and caching automatically
  const { data: suggestions, isLoading } = useListSuggestions(query);

  return (
    <div className="suggestions-list">
      {isLoading ? <Spinner /> : suggestions?.map(account => (
        <SuggestionRow key={account.id} account={account} />
      ))}
    </div>
  );
};