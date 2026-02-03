import { useState } from "react";
import { useAccountSearch } from "../api/useAccountSearch";
import { useDebounce } from "@uidotdev/usehooks";

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // 300ms delay

  const { data: results, isLoading, isFetching } = useAccountSearch(debouncedQuery);

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Search accounts..." 
      />
      
      {(isLoading || isFetching) && <Spinner />}
      
      <ul>
        {results?.map(account => (
          <AccountRow key={account.id} account={account} />
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;