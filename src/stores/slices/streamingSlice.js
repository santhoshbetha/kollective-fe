// Slice to manage streaming/websocket connections.
// Provides connect/disconnect/subscribe/unsubscribe/send actions and
// minimal scoped state to track `socket` and `subscriptions`.
import messages from "../../messages.js";
import { getUnreadChatsCount, updateChatListItem, updateChatMessage } from "../../utils/chats.js";
import { updateReactions } from "../../api/announcements/useAnnouncements.js";
import { isLastMessage, ChatKeys } from "../../queries/chats.js";
import { queryClient } from "../../queries/client.js";
import { removePageItem } from "../../utils/queries.js";
import { selectEntity } from "../../entity-store/selectors/index.js";
import announcementSchema from "../../schemas/announcement.js";
import { play, soundCache } from "../../utils/sounds.js";
import { connectStream } from "../../stream.js";
import { getIn } from "../../utils/immutableSafe.js";

const removeChatMessage = (payload) => {
  const data = JSON.parse(payload);
  const chatId = data.chat_id;
  const chatMessageId = data.deleted_message_id;

  // If the user just deleted the "last_message", then let's invalidate
  // the Chat Search query so the Chat List will show the new "last_message".
  if (isLastMessage(chatMessageId)) {
    queryClient.invalidateQueries({
      queryKey: ChatKeys.chatSearch(),
    });
  }

  removePageItem(ChatKeys.chatMessages(chatId), chatMessageId, (o, n) => String(o.id) === String(n));
};

// Update the specific Chat query data.
const updateChatQuery = (chat) => {
  const cachedChat = queryClient.getQueryData(ChatKeys.chat(chat.id));
  if (!cachedChat) {
    return;
  }

  const newChat = {
    ...cachedChat,
    latest_read_message_by_account: chat.latest_read_message_by_account,
    latest_read_message_created_at: chat.latest_read_message_created_at,
  };
  queryClient.setQueryData(ChatKeys.chat(chat.id), newChat);
};

function followStateToRelationship(followState) {
   switch (followState) {
      case 'follow_pending':
         return { following: false, requested: true };
      case 'follow_accept':
         return { following: true, requested: false };
      case 'follow_reject':
         return { following: false, requested: false };
      default:
         return {};
   }
};

const updateAnnouncementReactions = ({ announcement_id: id, name, count }) => {
  queryClient.setQueryData(['announcements'], (prevResult) =>
    prevResult.map(value => {
      if (value.id !== id) return value;

      return announcementSchema.parse({
        ...value,
        reactions: updateReactions(value.reactions, name, -1, true),
      });
    }),
  );
};

const updateAnnouncement = (announcement) =>
  queryClient.setQueryData(['announcements'], (prevResult) => {
    let updated = false;

    const result = prevResult.map(value => value.id === announcement.id
      ? (updated = true, announcementSchema.parse(announcement))
      : value);

    if (!updated) return [announcementSchema.parse(announcement), ...result];
  });

const deleteAnnouncement = (id) => {
  queryClient.setQueryData(['announcements'], (prevResult) =>
    prevResult.filter(value => value.id !== id),
  );
}

const parsePayload = (data) => {
  try {
    return JSON.parse(data.payload);
  } catch (e) {
    return null;
  }
};

const handleChatMessageDelete = (payload) => {
  const data = JSON.parse(payload);
  const { chat_id: chatId, deleted_message_id: messageId } = data;

  if (isLastMessage(messageId)) {
    queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
  }
  removePageItem(ChatKeys.chatMessages(chatId), messageId, (o, n) => String(o.id) === String(n));
};

const updateAnnouncement = (announcement) => {
  queryClient.setQueryData(['announcements'], (prev = []) => {
    const parsed = announcementSchema.parse(announcement);
    const index = prev.findIndex(a => a.id === parsed.id);
    if (index > -1) {
      const next = [...prev];
      next[index] = parsed;
      return next;
    }
    return [parsed, ...prev];
  });
};

const followStateToRelationship = (state) => ({
  follow_pending: { following: false, requested: true },
  follow_accept: { following: true, requested: false },
  follow_reject: { following: false, requested: false },
}[state] || {});

export function createStreamingSlice(setScoped, getScoped, rootSet, rootGet) {
   const getActions = () => rootGet();
   
   return {

    updateFollowRelationships(update) {
      const actions = getActions();
      const me = actions.me;
      const relationship = selectEntity(actions, 'Relationships', update.following.id);

      if (update.follower.id === me && relationship) {
        const updated = {
          ...relationship,
          ...followStateToRelationship(update.state),
        };
        // Avoid API race conditions
        setTimeout(() => actions.entities?.importEntities?.([updated], 'Relationships'), 300);
      }
    },

    connectTimelineStream(timelineId, path, accept, options) {
      const actions = getActions();

      return connectStream(path, () => ({
        onConnect() {
          actions.connectTimeline?.(timelineId);
        },

        onDisconnect() {
          actions.disconnectTimeline?.(timelineId);
        },

        async onReceive(websocket, data) {
          const payload = parsePayload(data);
          const locale = actions.getLocale?.();

          switch (data.event) {
            case 'update':
              actions.processTimelineUpdate?.(timelineId, payload, accept);
              break;
            case 'status.update':
              actions.updateStatus?.(payload);
              break;
            case 'notification':
              try {
                const msgBundle = await messages[locale]();
                actions.updateNotificationsQueue?.(
                  payload,
                  msgBundle,
                  locale,
                  window.location.pathname
                );
              } catch (e) { console.error("Notification stream error", e); }
              break;
            case 'conversation':
              actions.updateConversations?.(payload);
              break;
            case 'filters_changed':
              actions.fetchFilters?.();
              break;
            case 'kollective:chat_update':
            case 'chat_message.created': {
              const messageOwned = payload.last_message?.account_id === actions.me;
              if (!messageOwned) {
                updateChatListItem(payload);
                if (actions.getSettings()?.chats?.sound) play(soundCache.chat);
                options?.statContext?.setUnreadChatsCount?.(getUnreadChatsCount());
              }
              break;
            }
            case 'chat_message.deleted':
              handleChatMessageDelete(data.payload);
              break;
            case 'chat_message.read':
              if (payload.account?.id !== actions.me) {
                const cached = queryClient.getQueryData(ChatKeys.chat(payload.id));
                if (cached) {
                  queryClient.setQueryData(ChatKeys.chat(payload.id), {
                    ...cached,
                    latest_read_message_by_account: payload.latest_read_message_by_account,
                    latest_read_message_created_at: payload.latest_read_message_created_at,
                  });
                }
              }
              break;
            case 'chat_message.reaction':
              updateChatMessage(payload);
              break;
            case 'kollective:follow_relationships_update':
              actions.updateFollowRelationships?.(payload);
              break;
            case 'announcement':
              updateAnnouncement(payload);
              break;
            case 'announcement.reaction':
              queryClient.setQueryData(['announcements'], (prev = []) => 
                prev.map(a => a.id === payload.announcement_id 
                  ? announcementSchema.parse({ ...a, reactions: updateReactions(a.reactions, payload.name, -1, true) }) 
                  : a
                )
              );
              break;
            case 'announcement.delete':
              queryClient.setQueryData(['announcements'], (prev = []) => prev.filter(a => a.id !== data.payload));
              break;
          }
        }
      }));
    },


  };
}

export default createStreamingSlice;
