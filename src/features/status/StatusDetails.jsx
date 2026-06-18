import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Thread from './components/thread';
import Column from 'soapbox/components/ui/column';
import Stack from 'soapbox/components/ui/stack';
import PlaceholderStatus from '../../components/placeholder/PlaceholderStatus';
import MissingIndicator from '../../components/MissingIndicator';

const StatusDetails = () => {
  const { statusId } = useParams(); // Using React Router hook
  const [data, setData] = useState({ 
    status: null, 
    ancestors: [], 
    descendants: [], 
    next: null 
  });
  const [loading, setLoading] = useState(true);

  // Fetch the main status + thread context from Elixir
  const fetchData = useCallback(async () => {
    try {
      // Your Phoenix endpoint: GET /api/posts/:id/context
      const response = await api.get(`/api/posts/${statusId}/context`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch thread", err);
    } finally {
      setLoading(false);
    }
  }, [statusId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Infinite Scroll for deep replies
  const handleLoadMore = async () => {
    if (!data.next) return;
    const response = await api.get(data.next);
    setData(prev => ({
      ...prev,
      descendants: [...prev.descendants, ...response.data.descendants],
      next: response.data.next
    }));
  };

  if (loading) {
    return <Column><PlaceholderStatus /></Column>;
  }

  if (!data.status) {
    return <MissingIndicator />;
  }

  // Redirect logic (e.g., if it's actually an event)
  if (data.status.type === 'event') {
    return <Navigate to={`/events/${statusId}`} />;
  }

  return (
    <Stack space={4}>
      <Column label="Post Details">
        <Thread
          focusedStatus={data.status} // The "Hero" post
          ancestors={data.ancestors}   // Posts above
          descendants={data.descendants} // Posts below
          next={data.next}
          handleLoadMore={handleLoadMore}
          isLoading={loading} // Pass the Elixir loading state
          useWindowScroll={true}
        />
      </Column>
    </Stack>
  );
};

export default StatusDetails;

/*
Key Minimizations:

    Direct API State: Instead of Redux, we use a single data object to store the thread. This is much faster for a standalone app and avoids "Selector" overhead.
    Navigate vs Redirect: Swapped Soapbox's old Redirect for the modern React Router <Navigate />.
    Prop Matching: Updated the Thread inputs to match our previous "Golden Path" component:
        focusedStatus: The main post.
        ancestors: Array for the top section.
        descendants: Array for the bottom section.
    Simplified Logic: Removed the groupSlug redirect and complex intl messages. For a private standalone app, you usually want a consistent URL structure without forced slug redirects.
*/

/*
Why this works with Elixir:
Your Recursive CTE in PostgreSQL returns a list of posts. In your Phoenix Controller, you simply split them:

    Ancestors: Filter where inserted_at < status.inserted_at.
    Descendants: Filter where inserted_at > status.inserted_at.
    Next: Provide the Pagination URL for the next chunk of descendants.
*/

///==========================================================================================
/*
"Deep-Links for Media"
To implement
Deep-Links for Media, we'll use React Router to detect a specific media index in the URL
(e.g., /posts/:statusId/media/:index). This allows your Elixir backend to serve a meta-tagged 
page for SEO while your React frontend automatically opens the Portal Lightbox to the correct image.

1. The Route Configuration
Update your React Router setup to include the optional media parameter.
// App.jsx or Routes.jsx
<Route path="/posts/:statusId" element={<StatusDetails />}>
  <Route path="media/:index" element={<StatusDetails />} />
</Route>

import { useParams, useNavigate } from 'react-router-dom';

const StatusDetails = () => {
  const { statusId, index } = useParams();
  const navigate = useNavigate();

  // When the user closes the Lightbox, we navigate back to the post URL
  const handleCloseMedia = () => {
    navigate(`/posts/${statusId}`);
  };

  return (
    <Thread
      focusedStatus={data.status}
      initialMediaIndex={index ? parseInt(index, 10) : null}
      onCloseMedia={handleCloseMedia}
      // ... other props
    />
  );
};

3. The React Frontend: Auto-Opening (JSX)
Inside your ThreadStatus or VideoPost component, use a useEffect to trigger the 
setIsOpen(true) state if the initialMediaIndex matches.

jsx

useEffect(() => {
  if (initialMediaIndex !== null && status.attachments[initialMediaIndex]) {
    setGalleryIndex(initialMediaIndex);
    setGalleryOpen(true);
  }
}, [initialMediaIndex]);

4. Why this is "Pro" Grade:

    Shareability: Users can share a specific photo from a #Tech gallery (e.g., ://myapp.com) and the recipient will see that exact image full-screen instantly.
    SEO: Since the URL is unique, Search Engine Crawlers can index individual media items, driving more traffic to your Standalone App.
    Browser History: Clicking "Back" on the browser will close the Lightbox and return the user to the thread, rather than exiting the site entirely.

5. Integration with Elixir
When your Phoenix Controller renders the initial HTML for a media link, you can set the og:image OpenGraph tag to the specific S3 Signed URL for that index. This makes link previews on Discord or Twitter look perfect.
Your Media Hub is now a "Deep-Linked" Powerhouse.
*/
