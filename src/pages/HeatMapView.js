/*
Live HeatMap
In React, use a library like Leaflet.js or React Simple Maps to render the heatmap.
 When the heatmap_update event arrives, update your map's intensity values.
*/
// HeatmapView.js
useEffect(() => {
  const channel = socket.channel("discovery:heatmap", {});
  channel.join();

  channel.on("heatmap_update", (payload) => {
    // payload.districts = [{federal_district: "TX-10", count: 45}, ...]
    updateMapHeat(payload.districts);
  });

  return () => channel.leave();
}, []);

/*
Why this is the "Pro" way:

    Performance: By recalculating every 5 minutes instead of on every post, you protect Postgres from heavy aggregation queries.
    Real-time Feel: Users see the "glow" of districts change as protests or urgent events develop in the last 24 hours.
    Scalability: The same data is broadcast once and pushed to thousands of users simultaneously. 
*/