import { useState } from 'react';

function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  function setPromise(promise) {
    setIsLoading(true);

    promise
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));

    return promise;
  }

  return [isLoading, setPromise];
}

export { useLoading };