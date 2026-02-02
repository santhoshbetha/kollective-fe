//Filter Toggle
const FilterModeToggle = () => {
  const { filterMode, setFilterMode } = useFilterPrefsStore();

  return (
    <div className="filter-controls p-4 border-b">
      <label className="text-sm font-bold block mb-2">Filter Behavior</label>
      <div className="flex gap-2">
        <button 
          className={`btn-sm ${filterMode === 'collapse' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterMode('collapse')}
        >
          Collapse
        </button>
        <button 
          className={`btn-sm ${filterMode === 'highlight' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterMode('highlight')}
        >
          Highlight
        </button>
      </div>
    </div>
  );
};
