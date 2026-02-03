import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from '../../hooks/useApi.js';
import { queryClient } from '../../queries/client.js';
import { adminAnnouncementSchema } from '../../schemas/announcement.js';
import { useAnnouncements as useUserAnnouncements } from '../announcements/useAnnouncements.js';

const useAnnouncements = () => {
  const api = useApi();
  const userAnnouncements = useUserAnnouncements();

  const getAnnouncements = async () => {
    const response = await api.get('/api/v1/kollective/admin/announcements');
    const data = await response.json();

    const normalizedData = data.map((announcement) => adminAnnouncementSchema.parse(announcement));
    return normalizedData;
  };

  const result = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: createAnnouncement,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params) => api.post('/api/v1/kollective/admin/announcements', params),
    retry: false,
    onSuccess: async (response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'announcements'], (prevResult) =>
        [...(prevResult ?? []), adminAnnouncementSchema.parse(data)],
      );
    },
    onSettled: () => userAnnouncements?.refetch?.(),
  });

  const {
    mutate: updateAnnouncement,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }) => api.patch(`/api/v1/kollective/admin/announcements/${id}`, params),
    retry: false,
    onSuccess: async (response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'announcements'], (prevResult) =>
        (prevResult ?? []).map((announcement) => announcement.id === data.id ? adminAnnouncementSchema.parse(data) : announcement),
      );
    },
    onSettled: () => userAnnouncements?.refetch?.(),
  });

  const {
    mutate: deleteAnnouncement,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/kollective/admin/announcements/${id}`),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'announcements'], (prevResult) =>
        (prevResult ?? []).filter(({ id: announcementId }) => announcementId !== id),
      ),
    onSettled: () => userAnnouncements?.refetch?.(),
  });

  return {
    ...result,
    createAnnouncement,
    isCreating,
    updateAnnouncement,
    isUpdating,
    deleteAnnouncement,
    isDeleting,
  };
};

export { useAnnouncements };
