
import { useGetState } from "./useGetState";

export function useQuoteCompose() {
  const getState = useGetState();

  const quoteCompose = (statusId) => {
    const status = getState().statuses[statusId];
    if (status) {
      getState().compose.quoteComposeAction(status);
    }
  };

  return { quoteCompose };
}