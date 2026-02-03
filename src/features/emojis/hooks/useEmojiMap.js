// src/features/emojis/hooks/useEmojiMap.js
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useEmojiMap = () => {
  const queryClient = useQueryClient();
  
  // 1. Pull the raw data from the cache (seeded by useEmojis)
  const emojis = queryClient.getQueryData(['emojis', 'custom']);

  // 2. Memoize the map so it's only created once per data change
  return useMemo(() => {
    if (!emojis) return {};

    // Handles the Kollective/Mastodon array structure
    return emojis.reduce((acc, emoji) => {
      acc[`:${emoji.shortcode}:`] = emoji.url;
      return acc;
    }, {});
  }, [emojis]);
};

/*
const StatusContent = ({ content }) => {
  const emojiMap = useEmojiMap();

  // Simple regex to find :shortcode: and replace with <img>
  const parsedContent = content.replace(/:(\w+):/g, (match) => {
    return emojiMap[match] ? `<img src="${emojiMap[match]}" class="emoji" />` : match;
  });

  return <div dangerouslySetInnerHTML={{ __html: parsedContent }} />;
};
*?