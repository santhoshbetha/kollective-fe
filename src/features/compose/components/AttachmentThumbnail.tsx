
//===upload progress bars===
//===multiple uploads===
//===retry logic function===
//===error handling===

// features/compose/components/AttachmentThumbnail.tsx
import React, { useMemo } from 'react';
import { Box, IconButton, Progress, Text, Stack } from 'soapbox-ui';

export const AttachmentThumbnail = ({ attachment, onRemove, onRetry }) => {
  // Create a local preview URL for the File object if the server URL isn't ready
  const previewUrl = useMemo(() => {
    if (attachment.url) return attachment.url;
    if (attachment.file) return URL.createObjectURL(attachment.file);
    return null;
  }, [attachment.url, attachment.file]);

  return (
    <Box position="relative" borderRadius="md" overflow="hidden" width="100px" height="100px" bg="gray.100">
      {previewUrl && (
        <img 
          src={previewUrl} 
          alt="Upload preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      )}

      {/* 1. Progress Overlay - Shows during active upload */}
      {attachment.isUploading && (
        <Stack 
          position="absolute" inset={0} bg="blackAlpha.700" 
          align="center" justify="center" p={2}
        >
          <Progress value={attachment.progress} size="xs" width="80%" colorScheme="blue" />
          <Text color="white" fontSize="xs">{attachment.progress}%</Text>
        </Stack>
      )}

      {/* 2. Error Overlay - Appears only if the service fails */}
      {attachment.error && (
        <Stack 
          position="absolute" inset={0} bg="red.600" 
          align="center" justify="center" spacing={1}
        >
          <IconButton 
            icon="fa-redo" size="xs" 
            onClick={() => onRetry(attachment.id)} 
            aria-label="Retry upload"
          />
          <Text color="white" fontSize="xs" fontWeight="bold">Failed</Text>
        </Stack>
      )}

      {/* 3. Remove Button - Hidden during upload to prevent state conflicts */}
      {!attachment.isUploading && (
        <IconButton
          position="absolute" top={1} right={1}
          icon="fa-times" size="xs" colorScheme="blackAlpha"
          onClick={() => onRemove(attachment.id)}
          aria-label="Remove media"
        />
      )}
    </Box>
  );
};

/*
Targeted Re-renders: Only the AttachmentThumbnail needs to update visually as
the percentage climbs, keeping the text input (the Soapbox composer) snappy and responsive.
*/
