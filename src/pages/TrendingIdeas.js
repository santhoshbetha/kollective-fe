

/*
"Top Proposals" Leaderboard
*/
const [topIdeas, setTopIdeas] = useState([]);

useEffect(() => {
  fetch('/api/businesses/leaderboard', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(json => setTopIdeas(json.data));
}, []);

return (
  <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
    <h3 className="font-bold text-blue-900 mb-3">🔥 Trending in {user.federal_district}</h3>
    {topIdeas.map(({ business, upvote_count }) => (
      <div key={business.id} className="mb-3 border-b border-blue-100 pb-2">
        <p className="font-semibold text-sm">#{business.name}</p>
        <span className="text-xs text-blue-600 font-medium">
          {upvote_count} neighbors interested
        </span>
      </div>
    ))}
  </div>
);

/*
5. Why this works for Discovery

    Hyper-Local Relevance: A user in Texas District 10 sees different trending ideas than someone in District 21, ensuring the "Discovery" is actually useful for their neighborhood.
    Time-Sensitive: By limiting to the last 30 days, you prevent old, stale ideas from camping at the top of the list forever.
    Incentive to Post: Seeing an idea hit the leaderboard encourages the proposer to take the next step toward Business Verification and official launch.
*/