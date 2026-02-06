import React from 'react';
import { Stack, Box, Avatar, Button, Text, Link } from 'soapbox-ui';

/*
JS implementation for the generic EntityCard that handles both "Group" and "User" displays
*/

/**
 * A generic card for both Users and Groups.
 * @param {Object} entity - The Group or Account object from the API.
 * @param {string} type - 'account' or 'group'.
 * @param {React.Node} action - Optional button (Join, Follow, etc).
 */
export const EntityCard = ({ entity, type = 'account', action }) => {
  // Normalize fields between Mastodon Accounts and Groups
  const displayName = entity.display_name || entity.name || entity.username;
  const handle = entity.acct ? `@${entity.acct}` : `${entity.member_count || 0} members`;
  const avatarUrl = entity.avatar || entity.avatar_static;
  const profileUrl = type === 'group' ? `/groups/${entity.id}` : `/@${entity.acct}`;

  const subtitle = type === 'event' 
  ? `${new Date(entity.start_time).toLocaleDateString()} • ${entity.location_name}`
  : handle;

  return (
    <Box p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" bg="white">
      <Stack direction="row" spacing={3} align="center" justify="space-between">

        
        {/* Left Side: Identity */}
        <Stack direction="row" spacing={3} align="center">
          <Avatar 
            src={avatarUrl} 
            name={displayName} 
            size="md" 
            borderRadius={type === 'group' ? 'md' : 'full'} // Groups are usually squares
          />
          <Box>
            <Link href={profileUrl}>
              <Text weight="bold" size="md" color="gray.900" display="block">
                {displayName}
              </Text>
            </Link>
            <Text size="sm" color="gray.500">
              {handle}
            </Text>
          </Box>
        </Stack>

        {/* Right Side: Action Button */}
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Stack>

      {/* Optional: Snippet of bio/description */}
      {entity.note && (
        <Box mt={2}>
          
        </Box>
      )}
    </Box>
  );
};
