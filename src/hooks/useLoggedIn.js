import useBoundStore from "../stores/boundStore";

function useLoggedIn() {
  const me = useBoundStore(state => state.me);
  return {
    isLoggedIn: typeof me === 'string',
    isLoginLoading: me === null,
    isLoginFailed: me === false,
    me,
  };
}

export { useLoggedIn };