const QuickSelectBar = () => {
  const { selectByPattern } = useAutoSelectDomains();
  const { clearSelection, selectedDomains } = useDomainSelectionStore();

  return (
    <div className="flex gap-2 mb-4">
      <button onClick={() => selectByPattern('.xyz')}>Select .xyz</button>
      <button onClick={() => selectByPattern('bot')}>Select "bot"</button>
      <button onClick={clearSelection}>Clear ({selectedDomains.length})</button>
    </div>
  );
};
