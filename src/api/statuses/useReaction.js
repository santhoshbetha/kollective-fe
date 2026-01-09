import { useFavourite } from './useFavourite.js';
import useBoundStore from '../../stores/boundStore.js';
import { useTransaction } from '../../entity-store/hooks/useTransaction.js';
import { useApi } from '../../hooks/useApi.js';
import { useGetState } from '../../hooks/useGetState.js';
import { statusSchema } from '../../schemas/status.js';
import { isLoggedIn } from '../../utils/auth.js';

export function useReaction() {
  const api = useApi();
  const getState = useGetState();
  const { transaction } = useTransaction();
  const { favourite, unfavourite } = useFavourite();

  function emojiReactEffect(statusId, emoji) {
    transaction({
      Statuses: {
        [statusId]: (status) => {
          // Get the emoji already present in the status reactions, if it exists.
          const currentEmoji = status.reactions.find((value) => value.name === emoji);
          // If the emoji doesn't exist, append it to the array and return.
          if (!currentEmoji) {
            return ({
              ...status,
              reactions: [...status.reactions, { me: true, name: emoji, count: 1 }],
            });
          }
          // if the emoji exists in the status reactions, then just update the array and return.
          return ({
            ...status,
            reactions: status.reactions.map((val) => {
              if (val.name === emoji) {
                return { ...val, me: true, count: (val.count ?? 0) + 1 };
              }
              return val;
            }),
          });
        },
      },
    });
  }

  function unemojiReactEffect(statusId, emoji) {
    transaction({
      Statuses: {
        [statusId]: (status) => {
          return ({
            ...status,
            reactions: status.reactions.map((val) => {
              if (val.name === emoji && val.me === true) {
                return { ...val, me: false, count: (val.count ?? 1) - 1 };
              }
              return val;
            }),
          });
        },
      },
    });
  }

  const emojiReact = async (status, emoji) => { // TODO: add custom emoji support
    if (!isLoggedIn(getState())) return;
    emojiReactEffect(status.id, emoji);

    try {
      const response = await api.put(`/api/v1/pleroma/statuses/${status.id}/reactions/${emoji}`);
      const result = statusSchema.parse(await response.json());
      if (result) {
        useBoundStore.getState().entities.importEntities('Statuses', [result]);
      }
    } catch (err) {
      void err;
      unemojiReactEffect(status.id, emoji);
    }
  };

  const unEmojiReact = async (status, emoji) => {
    if (!isLoggedIn(getState())) return;
    unemojiReactEffect(status.id, emoji);

    try {
      const response = await api.delete(`/api/v1/pleroma/statuses/${status.id}/reactions/${emoji}`);
      const result = statusSchema.parse(await response.json());
      if (result) {
        useBoundStore.getState().entities.importEntities('Statuses', [result]);
      }
    } catch (err) {
      void err;
      emojiReactEffect(status.id, emoji);
    }
  };

  const simpleEmojiReact = async (status, emoji) => {
    const emojiReacts = status.reactions;

    // Undo a standard favourite
    if (emoji === '👍' && status.favourited) return unfavourite(status.id);

    // Undo an emoji reaction
    const undo = emojiReacts.filter(e => e.me === true && e.name === emoji).length > 0;
    if (undo) return unEmojiReact(status, emoji);

    try {
      await Promise.all([
        ...emojiReacts
          .filter((emojiReact) => emojiReact.me === true)
          // Remove all existing emoji reactions by the user before adding a new one. If 'emoji' is an 'apple' and the status already has 'banana' as an emoji, then remove 'banana'
          .map(emojiReact => unEmojiReact(status, emojiReact.name)),
        // Remove existing standard like, if it exists
        status.favourited && unfavourite(status.id),
      ]);

      if (emoji === '👍') {
        favourite(status.id);
      } else {
        emojiReact(status, emoji);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { emojiReact, unEmojiReact, simpleEmojiReact };
}
