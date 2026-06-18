/*
Event Coordination for Voice Posts
*/
const VoiceCoordination = ({ post }) => {
  const { meeting_time, location_name, lat, lng } = post.coordination_data;

  const handleVoiceSubmit = async (formData) => {
    const payload = {
        post: {
        content: formData.content,
        category: "voice",
        urgency_level: 5,
        target_scope: "local",
        // This is the coordination data for the heatmap
        coordination_data: {
            meeting_time: "2026-02-15T10:00:00Z",
            location_name: "City Hall Plaza",
            lat: 30.2672,
            lng: -97.7431
        },
        // Pass the origin IDs so it appears in the right "Local" tab
        origin_city_id: currentUser.city_id,
        origin_federal_district: currentUser.federal_district
        }
    };

    await axios.post("/api/posts", payload);
    };

  return (
    <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
      <div className="flex justify-between items-center mb-2">
        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">LIVE COORDINATION</span>
        <span className="text-sm font-bold">{meeting_time}</span>
      </div>
      
      <p className="font-bold text-lg">{location_name}</p>
      
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">
          I'm Joining (RSVP)
        </button>
        <a 
          href={`https://www.google.com{lat},${lng}`}
          target="_blank"
          className="p-2 bg-white border border-red-500 rounded"
        >
          📍 Map
        </a>
      </div>
    </div>
  );
};


/*
PostItem.js
Your React component checks for the presence of the data before rendering the "Coordination Card."
*/
const PostItem = ({ post }) => {
  // Check if this is a Voice post WITH optional coordination
  const hasCoordination = post.category === 'voice' && post.coordination_data?.lat;

  return (
    <div className="post">
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {hasCoordination && (
        <div className="mt-4 p-4 border-2 border-red-500 bg-red-50 rounded-lg">
          <p className="font-bold">📍 Meeting at: {post.coordination_data.location_name}</p>
          <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
            RSVP to Join
          </button>
        </div>
      )}
    </div>
  );
};