import useBoundStore from "../stores/boundStore";

/** Get compose for given key with fallback to 'default' */
export const useCompose = (composeId) => {
  return useBoundStore((state) => state.composes[composeId] ?? state.composes['default']);
};
