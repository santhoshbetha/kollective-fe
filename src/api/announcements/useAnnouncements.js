import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from '../../hooks/useApi';
import { queryClient } from '../../queries/client';
import { announcementReactionSchema } from '../../schemas/announcement-reaction';
import { announcementSchema } from '../../schemas/announcement';

const updateReaction = (reaction, count, me, overwrite) => announcementReactionSchema.parse({
  ...reaction,
  me: typeof me === 'boolean' ? me : reaction.me,
  count: overwrite ? count : (reaction.count + count),
});

export const updateReactions = (reactions, name, count, me, overwrite) => {
  const idx = reactions.findIndex(reaction => reaction.name === name);

  if (idx > -1) {
    reactions = reactions.map(reaction => reaction.name === name ? updateReaction(reaction, count, me, overwrite) : reaction);
  }

  return [...reactions, updateReaction(announcementReactionSchema.parse({ name }), count, me, overwrite)];
};

const useAnnouncements = () => {
  const api = useApi();

  const getAnnouncements = async () => {
    const response = await api.get('/api/v1/announcements');
    const data = await response.json();

    const normalizedData = data?.map((announcement) => announcementSchema.parse(announcement));
    return normalizedData;
  };

  const { data, ...result } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: addReaction,
  } = useMutation({
    mutationFn: async ({ announcementId, name }) => {
      const response = await api.put(`/api/v1/announcements/${announcementId}/reactions/${name}`);
      return response.json();
    },
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        })),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        })),
      );
    },
  });

  const {
    mutate: removeReaction,
  } = useMutation({
    mutationFn: async ({ announcementId, name }) => {
      const response = await api.delete(`/api/v1/announcements/${announcementId}/reactions/${name}`);
      return response.json();
    },
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        })),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        })),
      );
    },
  });

  return {
    data: data ? [...data].sort(compareAnnouncements) : undefined,
    ...result,
    addReaction,
    removeReaction,
  };
};

function compareAnnouncements(a, b) {
  return new Date(a.starts_at || a.published_at).getDate() - new Date(b.starts_at || b.published_at).getDate();
}

export { useAnnouncements };
