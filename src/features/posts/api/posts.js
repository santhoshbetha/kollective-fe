// src/api/posts.js
import { api } from '@/api/client';

export const fetchContext = async (postId) => {
  const response = await api.get(`/api/v1/posts/${postId}/context`);
  const { ancestors, descendants } = response.data;

  const allPosts = new Map();
  [...ancestors, ...descendants].forEach((post) => {
    allPosts.set(post.id, post);
  });

  return { ancestors, descendants, allPosts };
};

export const fetchPost = (postId) => 
  api.get(`/api/v1/posts/${postId}`).then(res => res.data);


export const fetchPostContext = (id) => 
  api.get(`/api/v1/posts/${id}/context`).then(res => res.data);


export const reactToPost = (id, emoji) => 
  api.put(`/api/v1/posts/${id}/react/${emoji}`);

export const unreactFromPost = (id, emoji) => 
  api.put(`/api/v1/posts/${id}/unreact/${emoji}`);
