// src/api/statuses.js
import { api } from '@/api/client';

export const fetchContext = async (statusId) => {
  const response = await api.get(`/api/v1/statuses/${statusId}/context`);
  const { ancestors, descendants } = response.data;

  const allStatuses = new Map();
  [...ancestors, ...descendants].forEach((status) => {
    allStatuses.set(status.id, status);
  });

  return { ancestors, descendants, allStatuses };
};

export const fetchStatus = (statusId) => 
  api.get(`/api/v1/statuses/${statusId}`).then(res => res.data);


export const fetchStatusContext = (id) => 
  api.get(`/api/v1/statuses/${id}/context`).then(res => res.data);


export const reactToStatus = (id, emoji) => 
  api.put(`/api/v1/statuses/${id}/react/${emoji}`);

export const unreactFromStatus = (id, emoji) => 
  api.put(`/api/v1/statuses/${id}/unreact/${emoji}`);
