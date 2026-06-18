// /##Mentions (@nickname) logic so users can tag their local representatives in "Voice" posts

// React Utility: Linkify.js


const renderContent = (text) => {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const nickname = part.substring(1);
      return (
        <a key={i} href={`/users/${nickname}`} className="text-blue-500 hover:underline">
          {part}
        </a>
      );
    }
    return part;
  });
};

/*
Why this is a Discovery Tool:

    Targeting Representatives: Users can tag the @nickname of their local State Representative in a "Voice" post to draw direct attention to an issue.
    Viral Loops: Mentioning a neighbor in a Federal District alert brings them into the conversation immediately, increasing the post's score.
    User Discovery: Clicking a mention in React takes users to that person's profile, helping them find new local people to follow.
*/

/*
Summary of the Final Social Discovery Stack:

    Search: Trigram-based fuzzy search for users.
    Local Feeds: Tiered district logic (City/State/Federal).
    Voice Posts: Urgency-driven, expiring posts with community extensions.
    Engagement: Upvotes, Hashtags, and @Mentions.
    Notifications: Real-time alerts for local activity and direct interactions.
*/