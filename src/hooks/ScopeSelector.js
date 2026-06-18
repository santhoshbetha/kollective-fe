/*
  # "District Filter" dropdown at the top of the page, so users can toggle between seeing everything in their
  #60-mile radius vs. only businesses in their specific State Senate or Federal District

  2. React Frontend: Scope Selector Component
Add a dropdown or "pill" selector at the top of your Business page. This gives the user control over how "local" they want their discovery to be.

4. Why this is the "Pro" way to handle Discovery

    User Intent: Sometimes a user wants to find a plumber anywhere nearby (60 miles). Other times, they want to support an entrepreneur specifically in their State Senate District.
    Performance: Filtering by a specific string like origin_federal_district is extremely fast in PostgreSQL because it hits your B-Tree index instead of calculating geospatial distances.
    Political Engagement: For Idea Proposals, this allows users to see exactly what is being proposed for their specific voting district, making the "Discussion" more relevant.
*/

// React: ScopeSelector.js
const scopes = [
  { id: 'all', label: '60 Mile Radius' },
  { id: 'federal', label: 'My Federal District' },
  { id: 'state_senate', label: 'My State Senate' },
  { id: 'city', label: 'My City' }
];

const ScopeSelector = ({ currentScope, onScopeChange }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto py-2 mb-4 no-scrollbar">
      {scopes.map(scope => (
        <button
          key={scope.id}
          onClick={() => onScopeChange(scope.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap
            ${currentScope === scope.id 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
        >
          {scope.label}
        </button>
      ))}
    </div>
  );
};
