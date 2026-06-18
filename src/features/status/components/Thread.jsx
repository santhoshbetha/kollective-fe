import clsx from "clsx";
import { useMemo } from "react";
import Stack from "@/components/ui/stack";
import ScrollableList from "../../../components/ScrollableList";
import PendingStatus from "../../../components/PendingStatus";
import ThreadStatus from "./ThreadStatus";

const Thread = ({     
  ancestors = [], 
  descendants = [], 
  focusedStatus, 
  useWindowScroll, 
  handleLoadMore,
  isLoading,
  hasMore 
}) => {
    const renderThreadItem = (item, isFirst, isLast, focusedStatusId) => {
        const { id } = item;

        // 1. Handle Deleted Posts (Tombstones)
        // We still show the line through tombstones to maintain the chain
        if (item.deleted_at || (typeof id === 'string' && id.endsWith('-tombstone'))) {
            return (
            <div key={id} className="ml-6 py-2">
                <Tombstone 
                    id={id} 
                    isFirst={isFirst} 
                    isLast={isLast} 
                />
            </div>
            );
        }

        // 2. Handle Pending Posts (Optimistic UI)
        if (item.isPending || (typeof id === 'string' && id.startsWith('pending-'))) {
            return (
                <PendingStatus 
                    key={id} 
                    status={item} 
                    thread 
                    isFirst={isFirst} 
                    isLast={isLast} 
                />
            );
        }

        // 3. Standard Thread Status
        return (
            <ThreadStatus
                key={id}
                status={item}
                focusedStatusId={focusedStatusId}
                isFirst={isFirst} // Starts the line under the avatar
                isLast={isLast}   // Stops the line halfway
            />
        );
    };

    // Flatten the thread into a single array for the ScrollableList
    // This helps the virtualizer calculate the total size accurately
    const threadItems = useMemo(() => {
        return [
            // Map Ancestors
            // 1. Ancestors: Usually no 'isFirst' because they come from "above" the screen
            ...ancestors.map((item) => 
                renderThreadItem(item, false, false, focusedStatus.id)
            ),

            // 2. The Focused Status (The "Hero" post)
            // We render this directly. It usually has a line connecting to its first child.
            <ThreadStatus 
                key={focusedStatus.id} 
                status={focusedStatus} 
                focusedStatusId={focusedStatus.id} 
                isLast={descendants.length === 0} // It's 'last' if there are no replies
            />,

            // 3. Descendants: This is where lines start and stop
            ...descendants.map((item, index) => 
                renderThreadItem(
                    item, 
                    index === 0, // isFirst: true for the very first reply to the hero
                    index === descendants.length - 1, // isLast: true for the very bottom
                    focusedStatus.id
                )
            )
        ];
    }, [ancestors, descendants, focusedStatus]);

    /*
    TODO1: in Backend Elixir:
    Integration with PostgreSQL When your Recursive CTE returns the thread:

    Ancestors: Filter where inserted_at < focusedStatus.inserted_at.
    Descendants: Filter where inserted_at > focusedStatus.inserted_at.
    Result: The ScrollableList handles the virtualization of all three segments as one continuous, 
            smooth-scrolling surface.

    ----------------------------------------------------------------------
    TODO2: in Backend Elixir:
    Elixir PostJSON update to ensure the inserted_at timestamps are formatted
    correctly for the RelativeTimestamp component used in the thread

    To ensure your React RelativeTimestamp component can parse the dates correctly, 
    your Elixir PostJSON should output them as ISO 8601 strings.
    In Phoenix 1.7+, this is handled in the Data function of your JSON module.

    The Elixir Update (post_json.ex)
    We use DateTime.to_iso8601/1 to ensure the timestamp is a standard string format that 
    JavaScript's new Date() understands natively.

    elixir: 
    # lib/my_app_web/controllers/post_json.ex
    defmodule MyAppWeb.PostJSON do
        def index(%{posts: posts}) do
            %{data: Enum.map(posts, &data/1)}
        end

        def data(post) do
            %{
            id: post.id,
            content: post.content,
            # Convert Ecto's ~U[...] or ~N[...] to "2023-10-27T10:00:00Z"
            inserted_at: DateTime.to_iso8601(post.inserted_at),
            
            # Status flags for your simplified renderThreadItem logic
            is_tombstone: not is_nil(post.deleted_at),
            is_pending: false, # Real posts from the DB are never pending
            
            # Include the virtual 'level' from our Recursive CTE
            level: Map.get(post, :level, 0),
            
            # Author data
            account: %{
                id: post.user.id,
                username: post.user.username,
                display_name: post.user.display_name,
                avatar: post.user.avatar_url
            }
            }
        end
    end

    Why this works with your Components:

    RelativeTimestamp Compatibility: Most React timestamp components expect an ISO 8601 string. 
    By doing this on the server, you avoid complex date-parsing logic in the browser.
    The level Field: By including level (which we calculated in the Recursive CTE), 
    your ThreadStatus component can immediately set its marginLeft for indentation.
    The is_tombstone Flag: This allows your renderThreadItem function to instantly decide
    whether to show the content or the Tombstone placeholder.
    # In your Post schema
    timestamps(type: :utc_datetime)
    */

    return (
        <Stack
            space={2}
            className={clsx({ 'h-full': !useWindowScroll, 'mt-2': useWindowScroll })}
        >
            <div className={clsx('thread', { 'h-full': !useWindowScroll })}>
                <ScrollableList
                    scrollKey="thread-view"
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onLoadMore={handleLoadMore}
                    useWindowScroll={useWindowScroll}
                    listClassName={clsx({ 'h-full': !useWindowScroll })}
                >
                    {threadItems}
                </ScrollableList>
            </div>
        </Stack>
    );
};
export default Thread;

/*
2. Why this is the "Golden Path" for your List:

    1. Virtualization Friendly: By using useMemo to create a flat threadItems array, 
       you prevent the ScrollableList from re-calculating the React.Children.toArray 
       on every minor render. This keeps the scroll smooth at 60fps.
    2. Stable Identifiers: Your ScrollableList uses virtualItem.key. By mapping your ancestors 
       and descendants into components with stable IDs (the post IDs from PostgreSQL), 
       the virtualizer won't "jump" when new replies are added via Phoenix PubSub.
    3. Scroll Restoration: Your ScrollableList already includes sessionStorage logic. 
       This is perfect for a standalone app—if a user clicks a link in a thread and hits "Back," 
       they will land exactly where they were in the conversation.
*/

/*
Why this is better:

    1. Removed Helper Overhead: You no longer need three different renderSomething functions. 
       A single loop handles all states, which is easier to debug in React DevTools.
    2. Standard Arrays: Replaced ImmutableOrderedSet with a standard JavaScript Array. 
       This makes your Phoenix JSON integration much smoother.
    3. Cleaner Keys: Removed the complex 末pending- prefix logic in favor of a simple isPending 
        flag that your React State can set when you submit the Composer.
    4. Unified Visuals: The Tombstone now includes the same ml-6 (margin) as your replies, 
        ensuring the "Connector Line" doesn't break visually in the middle of a thread.

Pro-Tip for your Elixir Backend
When your Elixir Context returns the thread, it should mark 
each item with its state. This allows the frontend to be "dumb" and just render based on the data:

elixir

# lib/my_app_web/controllers/post_json.ex
def data(post) do
  %{
    id: post.id,
    is_tombstone: not is_nil(post.deleted_at),
    # ... rest of the fields
  }
end
*/

/*
Since you are using TanStack Virtual (implied by useVirtualizer and useWindowVirtualizer), 
your ScrollableList is already highly optimized. However, the way you are passing Ancestors, FocusedStatus, 
and Descendants as children needs a small adjustment to work with virtualization and your 
new "Standalone" simplified components.

1. Refined Thread Component
Because the ScrollableList uses React.Children.toArray(children), it flattens everything. 
We should clean up the ancestors and descendants mapping to ensure the keying is stable for the virtualizer.
*/

/*
Why this works:

    The Hero Connection: By passing isFirst={true} to the first descendant, the line appears to grow out of the focusedStatus above it.
    Infinite Depth: If a descendant has its own children (replies to a reply), the isLast prop ensures that the line doesn't bleed into the next unrelated post in the Virtualized List.
    Visual Logic: Your Tailwind CSS now knows exactly when to use h-full (middle of a chain) versus h-10 (end of a chain).

Pro-Tip for Elixir/Postgres:
Since we are using Recursive CTEs, you can include a depth or level field in your JSON. If level > 1, you can increase the ml- (margin-left) in renderThreadItem to create the "Indented" look seen on Reddit.
*/