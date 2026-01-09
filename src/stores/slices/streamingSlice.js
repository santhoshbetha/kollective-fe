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


export function createStreamingSlice(setScoped, getScoped, rootSet, rootGet) {

   return {

      updateFollowRelationships(update) {
         const root = rootGet();
         const me = root.me;
         const relationship = selectEntity(root, 'Relationships', update.following.id);

         if (update.follower.id === me && relationship) {
            const updated = {
            ...relationship,
            ...followStateToRelationship(update.state),
            };

            // Add a small delay to deal with API race conditions.
            setTimeout(() => root.entities.importEntities([updated], 'Relationships'), 300);
         }
      },

     connectTimelineStream: (timelineId, path, accept, options) => {
         const root = rootGet();
         return connectStream(path, () => {
            const locale = root.settings.getLocale();
            return {
               onConnect() {
                  root.timelines.connectTimeline(timelineId);  //san this websoket  //san this stream
               },
               
               onDisconnect() {
                  root.timelines.disconnectTimeline(timelineId);
               },

               onReceive(websocket, data) {
                  switch (data.event) {
                     case 'update':
                        root.timelines.processTimelineUpdate(timelineId, JSON.parse(data.payload), accept);
                        break;
                     case 'status.update':
                        root.statuses.updateStatus(JSON.parse(data.payload));
                        break;
                     // FIXME: We think delete & redraft is causing jumpy timelines.
                     // Fix that in ScrollableList then re-enable this!
                     //
                     // case 'delete':
                     //   dispatch(deleteFromTimelines(data.payload));
                     //   break;
                     case 'notification':
                        messages[locale]().then(messages => {
                           root.notifications.updateNotificationsQueue(
                              JSON.parse(data.payload),
                              messages,
                              locale,
                              window.location.pathname,
                              );
                           }).catch(error => {
                           console.error(error);
                        });
                        break;
                     case 'conversation':
                        root.conversations.updateConversations(JSON.parse(data.payload));
                        break;
                     case 'filters_changed':
                        root.filters.fetchFilters();
                        break;
                     case 'pleroma:chat_update':
                     case 'chat_message.created': // TruthSocial
                        {  
                           const chat = JSON.parse(data.payload);
                           const me = root.me;
                           const messageOwned = chat.last_message?.account_id === me;
                           const settings = root.settings.getSettings();

                           // Don't update own messages from streaming
                           if (!messageOwned) {
                              updateChatListItem(chat);

                              if (getIn(settings, ['chats', 'sound'])) {
                                 play(soundCache.chat);
                              }

                              // Increment unread counter
                              options?.statContext?.setUnreadChatsCount(getUnreadChatsCount());
                           }
                        }
                        break;
                     case 'chat_message.deleted': // TruthSocial
                        removeChatMessage(data.payload);
                        break;
                     case 'chat_message.read': // TruthSocial
                        {  
                           const chat = JSON.parse(data.payload);
                           const me = root.me;
                           const isFromOtherUser = chat.account.id !== me;
                           if (isFromOtherUser) {
                              updateChatQuery(JSON.parse(data.payload));
                           }
           
                           break; 
                        }
                     case 'chat_message.reaction': // TruthSocial
                        updateChatMessage(JSON.parse(data.payload));
                        break;
                     case 'pleroma:follow_relationships_update':
                        root.streaming?.updateFollowRelationships?.(JSON.parse(data.payload));
                        break;
                     case 'announcement':
                        updateAnnouncement(JSON.parse(data.payload));
                        break;
                     case 'announcement.reaction':
                        updateAnnouncementReactions(JSON.parse(data.payload));
                        break;
                     case 'announcement.delete':
                        deleteAnnouncement(data.payload);
                        break;
                     case 'marker':
                        root.notifications.fetchMarkerSuccess({ marker: JSON.parse(data.payload) });
                        break;
                  }
               },
            }
         })
     },


  };
}

export default createStreamingSlice;
