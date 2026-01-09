import useBoundStore from "../stores/boundStore";

export function useMentionCompose() {
  const mentionComposeAction = useBoundStore((state) => state.mentionCompose);

  const mentionCompose = (account) => {
    mentionComposeAction(account);
  };

  return { mentionCompose };
}