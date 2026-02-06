import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useTimeline } from './useTimeline';
import api from '../api';

// Mock the API service
vi.mock('../api');

describe('useTimeline', () => {
  it('initializes with loading state and empty items', () => {
    const { result } = renderHook(() => useTimeline('/test-endpoint'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('fetches and updates items on success', async () => {
    const mockData = [{ id: '1', content: 'Hello World' }];
    api.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useTimeline('/test-endpoint'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual(mockData);
  });
});
