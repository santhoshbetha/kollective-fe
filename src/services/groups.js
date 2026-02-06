// src/services/groups.js
export const fetchGroup = (id) => api.get(`/api/v1/groups/${id}`);
export const fetchGroups = (params) => api.get('/api/v1/groups', { params });
export const performGroupAction = (id, action) => api.post(`/api/v1/groups/${id}/${action}`);
