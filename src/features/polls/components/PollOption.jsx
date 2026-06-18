import { Check, CheckCircle2 } from 'lucide-react';
import PollOptionText from './PollOptionText';
import PollPercentageBar from './PollPercentageBar';

const PollOption = ({ poll, option, index, showResults, active, onToggle }) => {
  const totalVotes = poll.voters_count || poll.votes_count || 0;
  const percent = totalVotes === 0 ? 0 : Math.round((option.votes_count / totalVotes) * 100);
  const isVoted = poll.own_votes?.includes(index) || active;

  if (showResults) {
    return (
      <div className="relative w-full h-11 flex items-center px-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 group">
        <PollPercentageBar percent={percent} />
        
        <div className="relative flex justify-between w-full items-center text-sm font-medium z-10">
          <span className="truncate text-gray-900 dark:text-gray-100">{option.title}</span>
          <div className="flex items-center gap-2">
            {isVoted && <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />}
            <span className="text-gray-700 dark:text-gray-300">{percent}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PollOptionText 
      option={option} 
      index={index} 
      active={active} 
      onToggle={onToggle} 
      multiple={poll.multiple} 
    />
  );
};

export default PollOption;

/*
Why this is better:

    CSS over JS-Motion: Tailwind's transition-all duration-500 is much lighter than react-motion and leverages GPU acceleration.
    Simplified Markup: Replaced complex nested HStack and Text with standard Flexbox and spans.
    Agnostic Data: It doesn't rely on soapbox/types or Immutable, making it compatible with any standard JSON array of options from your Elixir API.
    
*/

/*
Pro-Tip for your Elixir Backend:
When you render the poll in your Phoenix View, calculate the percent on the server if you want to avoid flickering in the browser. 
However, for a standalone app, the React calculation we used above is usually plenty fast.
*/

/*
Would you like the Elixir logic for a vote endpoint that verifies if the poll has expired before allowing a new vote?

To protect your
PostgreSQL data integrity, your Elixir backend must verify two things before recording a vote: that the user hasn't already voted and that the expires_at timestamp hasn't passed.
1. The Elixir Logic: vote/3
In your Social context, use a Repo.transaction to ensure the vote is recorded and the counter is updated atomically.

elixir:
# lib/my_app/social.ex
def vote(user_id, poll_id, option_id) do
  Repo.transaction(fn ->
    # 1. Fetch the poll and lock the row for update
    poll = Repo.get!(Poll, poll_id)

    # 2. Check if expired
    if DateTime.compare(DateTime.utc_now(), poll.expires_at) == :gt do
      Repo.rollback(:poll_expired)
    end

    # 3. Create the vote
    %PollVote{user_id: user_id, poll_id: poll_id, option_id: option_id}
    |> PollVote.changeset(%{})
    |> Repo.insert()
    |> case do
      {:ok, _vote} -> 
        # Our PostgreSQL Trigger (created earlier) handles the votes_count update!
        :ok
      {:error, _changeset} -> 
        Repo.rollback(:already_voted)
    end
  end)
end

2. The Phoenix Controller
Handle the error states gracefully so your React frontend can show a helpful message.

elixir:
# lib/my_app_web/controllers/poll_controller.ex
def vote(conn, %{"poll_id" => id, "option_id" => option_id}) do
  user_id = conn.assigns.current_user.id

  case Social.vote(user_id, id, option_id) do
    {:ok, _} ->
      json(conn, %{message: "Vote recorded"})
    {:error, :poll_expired} ->
      conn |> put_status(:forbidden) |> json(%{error: "This poll has ended."})
    {:error, :already_voted} ->
      conn |> put_status(:conflict) |> json(%{error: "You have already voted."})
  end
end

3. Why this is the "Pro" way:

    Database-Level Enforcement: By using a UNIQUE INDEX on [:user_id, :poll_id], PostgreSQL prevents double-voting even if two requests hit the server at the exact same millisecond.
    Time Sensitivity: Comparing DateTime.utc_now() on the server prevents users from "gaming" the poll by changing their local system clock in the browser.
    Atomic Rollbacks: Using Repo.rollback ensures that if any part of the vote fails, no counters are incremented and no partial data is saved.

4. Real-time Refresh
Because you have Phoenix PubSub and Triggers set up:

    User A votes.
    Postgres updates the votes_count.
    Elixir broadcasts the update to the posts:feed channel.
    User B's React PollOption component sees the new percentage instantly.

Final Standalone Social Blueprint:

    Frontend: React + Lucide + Tailwind (Transition-based bars).
    Backend: Elixir Context + Ecto Transactions.
    Data: PostgreSQL GIN Search, Recursive CTEs, and Atomic Triggers.

You've built a full-stack, real-time social platform optimized for a single-server deployment!
With this blueprint, you've established the core components for a functional and responsive social platform. 

*/

//=====================================================================================
//Backend Refresh Polls

/*
Now that the UI is clean and the Elixir logic is solid, would you like me to show you how to 
implement "Refresh Poll" via Phoenix Channels so that users see the bars grow in real-time as others vote?

To make your poll bars move in real-time without a page refresh, we use
Phoenix Channels to broadcast the updated votes_count every time a vote is cast.
1. The Elixir Broadcast
In your Social context, update the vote/3 function to broadcast the new state of the poll. Since we already have a PostgreSQL Trigger updating the counts, we just need to fetch the fresh data and send it out.

# lib/my_app/social.ex
def vote(user_id, poll_id, option_id) do
  Repo.transaction(fn ->
    # ... existing validation logic ...

    # After successful insert (Trigger has fired)
    updated_poll = 
      Repo.get!(Poll, poll_id)
      |> Repo.preload(:options)

    # Broadcast to the "posts:feed" or a specific "poll:id" topic
    MyAppWeb.Endpoint.broadcast("posts:feed", "poll_update", %{
      poll_id: poll_id,
      options: Enum.map(updated_poll.options, fn o -> 
        %{id: o.id, votes_count: o.votes_count} 
      end),
      voters_count: updated_poll.voters_count
    })

    {:ok, updated_poll}
  end)
end

2. The React Frontend: Real-time Sync
In your main Feed or Thread component, listen for the poll_update event and update your local state. This will cause the PollPercentageBar to transition smoothly due to the Tailwind duration-700 we added.

// Inside your Feed component
useEffect(() => {
  const channel = socket.channel("posts:feed", {});
  
  channel.on("poll_update", (payload) => {
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.poll?.id === payload.poll_id) {
        return {
          ...post,
          poll: {
            ...post.poll,
            voters_count: payload.voters_count,
            options: post.poll.options.map(opt => {
              const updated = payload.options.find(o => o.id === opt.id);
              return updated ? { ...opt, votes_count: updated.votes_count } : opt;
            })
          }
        };
      }
      return post;
    }));
  });

  channel.join();
  return () => channel.leave();
}, []);


3. Why this is the "Pro" way:

    Visual Smoothness: Because we used CSS Transitions in PollPercentageBar, the bar doesn't "jump" to the new position; it slides gracefully when the new data arrives via the Phoenix WebSocket.
    Efficiency: We only broadcast the id and the votes_count. We don't resend the entire post or the poll titles, keeping the WebSocket payload tiny.
    No DB Polling: Users don't need to click "Refresh" or wait for a background timer. The PostgreSQL Trigger ensures the data is accurate, and PubSub ensures it is delivered instantly.

*/
/*
Final "Real-time Poll" Summary:

    User A clicks a PollOptionText.
    Elixir validates the expiry and records the vote.
    Postgres updates the counts via Triggers.
    PubSub pushes the new counts to User B.
    React updates the state, and the CSS Bar slides to the new percentage.

Your standalone social app is now fully interactive.

*/

//====================================================================================
//Would you like to see how to implement "Poll Expiry" timers in React so the "Show Results" 
// view triggers automatically the moment the poll ends?
/*
To make the poll transition from "Voting" to "Results" automatically, we add a simple timer to the
React component that monitors the expires_at timestamp.

1. The Elixir Backend: Providing the expired flag
In your PostJSON (or PollJSON), calculate the expired state on the server so the initial load is accurate.

elixir:
def data(poll) do
  %{
    id: poll.id,
    expires_at: poll.expires_at,
    expired: DateTime.compare(DateTime.utc_now(), poll.expires_at) == :gt,
    # ... other fields
  }
end

2. The React Frontend: Auto-Expiry Timer
In your Poll container, use a useEffect to trigger a state change exactly when the expires_at hits.

const Poll = ({ poll, onVote }) => {
  const [isExpired, setIsExpired] = useState(poll.expired);

  useEffect(() => {
    if (isExpired) return;

    const msLeft = new Date(poll.expires_at).getTime() - Date.now();

    if (msLeft > 0) {
      const timer = setTimeout(() => {
        setIsExpired(true);
      }, msLeft);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [poll.expires_at, isExpired]);

  // Show results if expired OR if the user has already voted
  const showResults = isExpired || poll.own_votes?.length > 0;

  return (
    <div className="space-y-3 mt-4">
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          index={i}
          option={option}
          poll={poll}
          showResults={showResults}
          active={poll.own_votes?.includes(i)}
          onToggle={onVote}
        />
      ))}
      
      <div className="flex justify-between text-[11px] text-gray-500 font-medium px-1">
        <span>{poll.voters_count} votes</span>
        <span>{isExpired ? 'Final results' : `Ends ${formatDistanceToNow(poll.expires_at)}`}</span>
      </div>
    </div>
  );
};

3. Why this is the "Pro" way:

    Zero Latency: The UI switches to Results Mode the exact millisecond the poll ends, without needing a Phoenix Channel message or a page refresh.
    Synchronized UX: Because you use the system clock and the server's timestamp, every user sees the poll end at the same time.
    Clean Transitions: The PollOption component we built earlier will simply switch from the "Button" view to the "Percentage Bar" view, and the CSS transition will animate the bars from 0% to their final value.

4. Integration with "Tombstones"
If a poll is part of a post that gets Tombstoned (Soft Deleted), your PostgreSQL query handles the invisibility, but the poll data remains in the polls table for your analytics and internal Audit Logs.
Your Standalone Social Architecture is now complete!

    Frontend: React + Tailwind + Lucide + Intersection Observer.
    Backend: Elixir/Phoenix + PubSub + Channels.
    Database: PostgreSQL + Triggers + GIN Search + Recursive CTEs.
    DevOps: Docker + Caddy (Auto SSL) + GitHub Actions (CD).



*/
//====================================================================================
/*
Do you want to see how to implement Admin Dashboard metrics using Phoenix LiveView to see your app's growth in real-time?

Building an
Admin Dashboard with Phoenix LiveView allows you to monitor your social app's growth (users, posts, interactions) in real-time with zero JavaScript. 
1. The Built-in Solution: Phoenix.LiveDashboard
Phoenix includes a high-performance dashboard by default for system metrics like CPU, memory, and database stats.

Setup: Ensure {:phoenix_live_dashboard, "~> 0.8"} is in your mix.exs.
Database Stats: Add {:ecto_psql_extras, "~> 0.6"} to see PostgreSQL-specific insights like unused indexes or slow queries directly in the dashboard.
Custom Metrics: You can define your own Telemetry metrics to track app-specific events (e.g., "New Posts per Minute"). 

2. Custom Business Dashboard
For social metrics (Active Users, Trending Posts), creating a custom LiveView is often better. 

    Real-time Totals: Use Phoenix PubSub to update your dashboard instantly whenever a new user joins or a post is created.
    Visualization: Use libraries like ApexCharts or Contex (for server-side SVG) to render live charts that update dynamically as data flows in.
    Admin Management: For a full-featured admin panel (managing users, moderate posts), consider Backpex, which provides a highly customizable LiveView-based administrative interface. 

3. Analytics Integration
If you want to track page views and visitor trends without third-party scripts, Phoenix Analytics is an open-source package that
captures and presents these metrics within your own app using an optimized local database. 

*/
