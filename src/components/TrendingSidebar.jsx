//#Trending Hashtags
import React, { useState, useEffect } from 'react';

const TrendingSidebar = ({ districtName }) => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const res = await fetch('/api/discovery/trending_tags');
      const json = await res.json();
      setTags(json.data);
    };
    fetchTrending();
  }, []);

  return (
    <div className="p-4 bg-gray-50 rounded-xl border">
      <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
        Trending in {districtName}
      </h3>
      <div className="space-y-3">
        {tags.map(tag => (
          <div key={tag.id} className="cursor-pointer hover:underline">
            <p className="font-bold text-blue-600">#{tag.name}</p>
            <p className="text-xs text-gray-400">{tag.score_sum} upvotes today</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSidebar;

/*
Why this is a "Discovery" powerhouse:

    Hyper-Contextual: A user in Texas District 31 sees #PropertyTax, while a user in California District 12 sees #WildfireSafety.
    Voice Synergy: Since "Voice" posts naturally get more engagement and higher scores, they will drive the trending topics, acting as a real-time "Pulse" of the local community.
    Low Barrier to Entry: Users don't have to follow anyone to know what their neighbors are talking about.

Summary of the Complete Engine

    Posts: Standard & Voice (Expiring) with Quora-style Ranking.
    Users: Location-aware (City, State/Federal Districts) with Fuzzy Search.
    Feeds: Unified Home, Local Connection, and Hashtag-Topic feeds.
    Social: Follow/Block/Mute relationships + Notification loop.
    Analytics: Trending topics aggregated by local political boundaries.
*/
