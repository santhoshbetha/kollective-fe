import { useIntl } from 'react-intl';
import RelativeTimestamp from 'soapbox/components/relative-timestamp.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';

const PollFooter = ({ poll, showResults, selected, onVote, onRefresh }) => {
  const intl = useIntl();
  
  // Logic for vote count string
  const count = poll.voters_count ?? poll.votes_count ?? 0;
  const countLabel = count === 1 ? '1 vote' : `${count} votes`;

  // Handle expiration display
  const expirationDisplay = poll.expired ? (
    'Closed'
  ) : (
    <RelativeTimestamp weight='medium' timestamp={poll.expires_at} futureDate />
  );

  return (
    <Stack space={4} data-testid='poll-footer'>
      {/* Show Vote button only if results are hidden (user hasn't voted) */}
      {!showResults && (
        <Button 
          onClick={onVote} 
          theme='primary' 
          block 
          disabled={Object.keys(selected).length === 0}
        >
          Submit Vote
        </Button>
      )}

      <HStack space={1.5} alignItems='center' wrap className="text-sm">
        {/* Public Poll Warning */}
        {!poll.anonymous && (
          <>
            <Tooltip text="Other users may see what you voted for">
              <Text theme='muted' weight='medium'>Public poll</Text>
            </Tooltip>
            <Text theme='muted'>&middot;</Text>
          </>
        )}

        {/* Refresh button (mostly for non-live fallback) */}
        {showResults && onRefresh && (
          <>
            <button className='text-gray-500 hover:underline' onClick={onRefresh}>
              <Text theme='muted' weight='medium'>Refresh</Text>
            </button>
            <Text theme='muted'>&middot;</Text>
          </>
        )}

        {/* Total Votes */}
        <Text theme='muted' weight='medium'>
          {countLabel}
        </Text>

        {/* Expiration/Closed Status */}
        {poll.expires_at && (
          <>
            <Text theme='muted'>&middot;</Text>
            <Text weight='medium' theme='muted'>{expirationDisplay}</Text>
          </>
        )}
      </HStack>
    </Stack>
  );
};

export default PollFooter;

/*
Key Changes & Simplifications:

    Decoupled Actions: Removed useAppDispatch and vote/fetchPoll imports. Instead, it takes onVote and onRefresh as props. This makes it easier to use in your PendingStatus (where dispatching a real vote wouldn't work).
    Cleaned up Pluralization: Swapped the heavy FormattedMessage for a simple JavaScript ternary (count === 1 ? ...).
    Removed Pleroma-specifics: Replaced poll.pleroma?.non_anonymous with a simpler !poll.anonymous check.
    Dot Separators: Kept the &middot; logic but moved it to a cleaner inline implementation.
    Button State: Added a disabled check so users can't "Submit Vote" if they haven't selected an option yet.
*/

/*
jsx

<PollFooter 
  poll={poll} 
  showResults={showResults} 
  selected={selected} 
  onVote={() => handleVote(selected)} 
/>
*/
