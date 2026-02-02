const BulkDomainToolbar = () => {
  const selected = useDomainSelectionStore(s => s.selectedDomains);
  const { mutate: bulkUnmute, isPending } = useBulkUnmute();

  if (selected.length === 0) return null;

  return (
    <div className="bulk-toolbar sticky top-0 bg-red-50 p-4 border-b border-red-200">
      <span>{selected.length} domains selected</span>
      <button 
        className="btn-danger ml-4"
        onClick={() => bulkUnmute(selected)}
        disabled={isPending}
      >
        {isPending ? 'Processing...' : 'Unmute All'}
      </button>
    </div>
  );
};
