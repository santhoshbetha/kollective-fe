// src/features/filters/api/useFilters.js
/*
1. The Global Filter Logic
First, ensure you have a Zustand store or a Query that holds your muted keywords (e.g., "spoilers", "politics").
*/

export const useFilters = () => {
  return useQuery({
    queryKey: ['filters'],
    queryFn: () => api.get('/api/v1/filters').then(res => res.data),
    staleTime: Infinity, // Filters change rarely
  });
};

//==================================================================================
//Filter Management

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useFilters2 = () => {
  return useQuery({
    queryKey: ['filters', 'list'],
    queryFn: () => api.get('/api/v1/filters').then(res => res.data),
    // Filters don't change unless the user acts on them
    staleTime: 1000 * 60 * 60, 
  });
};

