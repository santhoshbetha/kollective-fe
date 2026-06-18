import clsx from 'clsx';
import DetailedStatus from './DeatiledStatus';
import StatusActionBar from './StatusInteractionBar';

/**
 * FocusedStatus: The "hero" post in a thread.
 * Simplified for a standalone app without complex a11y or HotKey overhead.
 */
const FocusedStatus = ({ status, hasDescendants, showMedia, onToggleMediaVisibility }) => {
  if (!status) return null;

  return (
    <div className={clsx('bg-white dark:bg-gray-900', { 'pb-4': hasDescendants })}>
      <div 
        className="outline-none py-4 px-4"
        aria-label={`Post by ${status.account.display_name}`}
      >
        {/* Main Post Content */}
        <DetailedStatus
          status={status}
          showMedia={showMedia}
          onToggleVisibility={onToggleMediaVisibility}
        />

        {/* Action Bar (Reply, Like, Repost) */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <StatusActionBar 
            status={status} 
            expandable={false} 
          />
        </div>
      </div>

      {/* Divider between focused post and its replies */}
      <hr className="border-t-2 border-gray-100 dark:border-gray-800" />
    </div>
  );
};

export default FocusedStatus;

/*
Key Minimizations:

    Removed HotKeys: Unless you are building a power-user desktop client, native browser focus and 
    simple onClick handlers are much lighter.
    Removed textForScreenReader: Replaced with a simple template literal. For a standalone app, 
    you can add ARIA labels directly to the components.
    Simplified Dividers: Replaced the -mx-4 max-w-[100vw] hack with a standard Tailwind border-t 
    inside the container padding.
    Conditional logic: Removed the isUnderReview check. Since you are using Elixir and PostgreSQL 
    with Tombstones, you should handle "visibility" at the data fetching level, ensuring only valid 
    posts reach this component.
*/

/*
Integration Tip:
This component is the "anchor" for your thread. When your Elixir backend returns a thread via the Recursive CTE, 
the post with level: 0 is the one you pass into this FocusedStatus component.
*/

//continued "reply_compose" in Backed code. ReadMe2.txt

/*
In the context of
PostgreSQL and Elixir, a Recursive CTE (Common Table Expression) is a specialized query that "calls itself"
to traverse hierarchical or tree-structured data.

While a standard query fetches a flat list, a recursive CTE is what allows your app to pull an entire
reply thread (parent \(\rightarrow \) children \(\rightarrow \) grandchildren) in a single, efficient
database trip.

How it Works (The "Three-Part" Logic)
Every recursive CTE in PostgreSQL follows a specific three-step structure within a WITH RECURSIVE block: 

    The Anchor (Base Case): The initial SELECT that finds the "starting" post (e.g., the specific post the user clicked on).
    The Recursive Member: A second SELECT that joins the table back to the results of the anchor. It says: "Now find all posts where the parent_id matches the IDs we just found".
    The Terminator: A condition (often implicit) that stops the loop once no more replies are found (i.e., you've reached the end of the thread). 

Why You Need It for Your App

    Single Query Efficiency: Without this, you would have to run a new query for every single reply you find (the "N+1 problem"), which would crash your server under heavy load.
    Deep Nesting: It seamlessly handles branching paths. Whether a thread is 2 levels deep or 20, the recursive CTE follows every branch to the bottom.
    Ordering & Paths: As shown in the previous Elixir example, you can use it to build a path array (e.g., {1, 5, 12}) to sort the replies exactly as they should appear in the React UI. 

Elixir/Ecto Integration
In Elixir, you use the recursive_ctes(true) option in Ecto to enable this power. It transforms a complex manual "tree-climbing" task into a single, 
high-performance PostgreSQL operation. 

*/