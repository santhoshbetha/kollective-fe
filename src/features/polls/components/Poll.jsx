import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import PollFooter from './PollFooter.jsx';
import PollOption from './PollOption.jsx';

const Poll = ({ id, poll, currentUser }) => {
  const intl = useIntl();
  const [selected, setSelected] = useState({});

  if (!poll) return null;

  // Logic: Show results if already voted or poll is over
  const showResults = useMemo(() => poll.voted || poll.expired, [poll]);

  const toggleOption = (index) => {
    if (!currentUser) return alert('Please log in to vote');

    if (poll.multiple) {
      setSelected(prev => {
        const next = { ...prev };
        next[index] ? delete next[index] : (next[index] = true);
        return next;
      });
    } else {
      // Single choice: select and immediately submit
      setSelected({ [index]: true });
      handleVote([index]);
    }
  };

  const handleVote = async (indices) => {
    try {
      // Direct call to your Elixir API
      await api.post(`/api/polls/${id}/votes`, { indexes: indices });
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  return (
    <div onClick={e => e.stopPropagation()} className="mt-4">
      {!showResults && poll.multiple && (
        <Text theme='muted' size='sm' className="mb-2">
          Choose as many as you'd like.
        </Text>
      )}

      <Stack space={4}>
        <Stack space={2}>
          {poll.options.map((option, i) => (
            <PollOption
              key={i}
              index={i}
              poll={poll}
              option={option}
              showResults={showResults}
              active={!!selected[i]}
              onToggle={toggleOption}
            />
          ))}
        </Stack>

        <PollFooter
          poll={poll}
          showResults={showResults}
          selected={selected}
          onVote={() => handleVote(Object.keys(selected))}
        />
      </Stack>
    </div>
  );
};

export default Poll;

/*
What was simplified:

    Removed useAppDispatch & useAppSelector: Instead of relying on a global Redux store for the poll data, pass it as a poll prop. This is much faster for a standalone app and allows the PendingStatus to use it easily.
    Simplified toggleOption: Removed the complex Immutable or Redux-based tmp object logic. Standard JavaScript objects with computed property names are cleaner.
    Direct API Call: Replaced dispatch(vote(...)) with a local async function. This removes the need for soapbox/actions/polls.ts.
    Removed defineMessages: Used the string directly in the code for the "multiple choice" label to save bundle size, though intl is still available if you want to swap it back.
*/

/*
Pro-Tip for your Elixir Backend:
In your Phoenix Controller, ensure that when a user votes, the JSON response returns the updated poll object. In React, you can simply update your state with that response to make the bars slide into "Results Mode" instantly.
*/

//==================================================================================
/*
Would you like to see how to implement the "Voted" indicator in the poll_json.ex so the
 frontend knows exactly which options the currentUser chose? Bolding that field in your 
 database query makes it very efficient.

To implement the
"Voted" indicator efficiently in your Elixir backend, you should calculate it during the database query using a PostgreSQL EXISTS or a LEFT JOIN.
This ensures your React frontend knows exactly which options to highlight as "Active" without making extra API calls.
1. The Elixir Context Query
In your Social context, update your get_poll or list_posts function to check if the current_user has a record in the poll_votes table.

elixir:
# lib/my_app/social.ex
def get_poll(poll_id, current_user_id) do
  from(p in Poll,
    where: p.id == ^poll_id,
    # Subquery to find IDs of options the user voted for
    let: [
      own_votes: from(v in "poll_votes", 
        where: v.poll_id == p.id and v.user_id == ^current_user_id, 
        select: v.option_id)
    ],
    select_merge: %{
      voted: fragment("EXISTS(SELECT 1 FROM poll_votes WHERE poll_id = ? AND user_id = ?)", p.id, ^current_user_id),
      own_votes: subquery(own_votes)
    },
    preload: [:options]
  )
  |> Repo.one()
end

2. The JSON View (poll_json.ex)
Now, map these values to the keys your React Poll component expects.

# lib/my_app_web/controllers/poll_json.ex
def data(poll) do
  %{
    id: poll.id,
    expires_at: poll.expires_at,
    expired: DateTime.compare(DateTime.utc_now(), poll.expires_at) == :gt,
    multiple: poll.multiple,
    voted: poll.voted || false, # Boolean: Did the user vote?
    own_votes: poll.own_votes || [], # Array of Option IDs
    voters_count: poll.voters_count,
    options: Enum.map(poll.options, &option_data/1)
  }
end

defp option_data(option) do
  %{
    id: option.id,
    title: option.title,
    votes_count: option.votes_count
  }
end

3. Why this is the "Pro" way:

    Single Query: Using a subquery or EXISTS in PostgreSQL is much faster than fetching the poll and then running a second query for the user's votes.
    State Control: By providing voted: true, the React component immediately knows to switch to Results Mode (showResults) on page load.
    Persistence: If a user clears their browser cache, they don't "lose" their vote status because it's tied to their PostgreSQL account record rather than local storage.

4. Integration with your React Poll
In your minimized Poll component, you can now initialize your selected state using the own_votes array:

// Inside Poll.jsx
const [selected, setSelected] = useState(
  poll.own_votes?.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {}
);

Your Standalone App is now "Feature Complete"!
You have Tombstones, Recursive Threads, Atomic Polls, and Real-time PubSub.

*/

//==================================================================================
/*
Do you want to see how to add a "Poll Closing Soon" badge to the PollFooter that appears only when there's less than 1 hour remaining?

To add a
"Closing Soon" badge to the PollFooter, we can calculate the time remaining in the React frontend and pass a simple boolean prop.
1. The React Logic: Calculating "Closing Soon"
In your main Poll component, calculate how much time is left and pass a new prop to the PollFooter.

// Inside Poll.jsx
import { differenceInHours } from 'date-fns'; // Use date-fns for easy time math

const Poll = ({ id, poll, currentUser }) => {
  // ... existing state and logic ...

  const hoursRemaining = poll.expires_at 
    ? differenceInHours(new Date(poll.expires_at), Date.now()) 
    : null;
    
  // Define "Closing Soon" as less than 1 hour remaining
  const isClosingSoon = hoursRemaining !== null && hoursRemaining < 1 && !poll.expired;

  // ... rest of the component ...
  
  return (
    <div onClick={e => e.stopPropagation()} className="mt-4">
      {/* ... options mapping ... *//*}

      <PollFooter
        poll={poll}
        showResults={showResults}
        selected={selected}
        onVote={() => handleVote(Object.keys(selected))}
        isClosingSoon={isClosingSoon} // Pass the new prop
      />
    </div>
  );
};

2. The Updated PollFooter (JSX)
Add conditional rendering logic to display a badge near the expiration time.

import clsx from 'clsx';
// ... other imports for PollFooter ...

const PollFooter = ({ poll, showResults, selected, onVote, onRefresh, isClosingSoon }) => {
  // ... existing count and label logic ...

  const expirationDisplay = poll.expired ? (
    'Closed'
  ) : (
    <RelativeTimestamp weight='medium' timestamp={poll.expires_at} futureDate />
  );

  return (
    <Stack space={4} data-testid='poll-footer'>
      {/* ... Submit Vote button ... *//*}

      <HStack space={1.5} alignItems='center' wrap className="text-sm">
        {/* ... Public Poll and Refresh links ... *//*}

        <Text theme='muted' weight='medium'>{countLabel}</Text>

        {/* Expiration/Closed Status + Badge *//*}
        {poll.expires_at && (
          <>
            <Text theme='muted'>&middot;</Text>
            
            {/* The "Closing Soon" Badge and Timestamp *//*}
            <HStack space={1} alignItems='center'>
                {isClosingSoon && (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                        CLOSING SOON
                    </span>
                )}
                <Text weight='medium' theme='muted'>{expirationDisplay}</Text>
            </HStack>
          </>
        )}
      </HStack>
    </Stack>
  );
};

export default PollFooter;

Why this works well in your architecture:

    Decoupled: The core business logic in Elixir and PostgreSQL doesn't care about a "Closing Soon" badge; it's purely a UI concern handled by React.
    Real-time: The badge will appear automatically without a refresh because your existing useEffect timer handles the state change, making the app feel professional and live.
    UX: It provides a clear visual indicator using Tailwind CSS so users know to vote quickly.

This completes your comprehensive standalone social application blueprint.

*/

