import useBoundStore from "../stores/boundStore";
/**
 * Provides a `getState()` function to hooks.
 * You should prefer `useAppSelector` when possible.
 */
function useGetState() {
  return useBoundStore.getState;
}

export { useGetState };