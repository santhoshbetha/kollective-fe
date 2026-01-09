import { useState, useEffect, useRef, useCallback } from "react";
import useSearchStore from "../stores/searchStore";

// Hook: wires an input value to the search store's debouncedSubmitSearch.
// Returns: { value, setValue, results, isLoading, performSearch, cancel }
export default function useDebouncedSearch({
  initialValue = "",
  filter = "statuses",
  delay = 350,
} = {}) {
  const [value, setValue] = useState(initialValue);
  const [results, setResults] = useState({ accounts: [], statuses: [] });
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  const debouncedSubmitSearch = useSearchStore((s) => s.debouncedSubmitSearch);
  const submitSearch = useSearchStore((s) => s.submitSearch);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // performSearch returns a promise that resolves with search results
  const performSearch = useCallback(
    (val = value, optFilter = filter, optDelay = delay) => {
      if (!val || val.length === 0) {
        setResults({ accounts: [], statuses: [] });
        return Promise.resolve({ accounts: [], statuses: [] });
      }

      setIsLoading(true);

      // use debounced submit if available, otherwise fallback to immediate submit
      const fn = debouncedSubmitSearch || ((f, v) => submitSearch(f, v));

      return fn(optFilter, val, optDelay)
        .then((data) => {
          if (mounted.current) {
            setResults({
              accounts: data.accounts || [],
              statuses: data.statuses || [],
            });
            setIsLoading(false);
          }
          return data;
        })
        .catch((err) => {
          if (mounted.current) setIsLoading(false);
          throw err;
        });
    },
    [value, filter, delay, debouncedSubmitSearch, submitSearch],
  );

  // auto when value changes
  useEffect(() => {
    // don't auto-run on empty initial value
    if (!value || value.length === 0) return;
    Promise.resolve().then(() =>
      performSearch(value, filter, delay).catch(() => {}),
    );
  }, [value, filter, delay, performSearch]);

  const cancel = useCallback(() => {
    // Not exposing cancel logic for the internal timers in the store; clear local loading
    setIsLoading(false);
  }, []);

  return {
    value,
    setValue,
    results,
    isLoading,
    performSearch,
    cancel,
  };
}
