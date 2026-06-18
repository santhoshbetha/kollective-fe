// React: BusinessDetail.js
const BusinessDetail = ({ business }) => {
    const categories = [
    { id: 'food_beverage', label: '🍔 Food & Coffee' },
    { id: 'technology', label: '💻 Tech' },
    { id: 'retail', label: '🛍️ Retail' },
    { id: 'construction', label: '🏗️ Construction' },
    { id: 'services', label: '🛠️ Services' }
    ];


    const BusinessFilter = ({ onSelect }) => {
        return (
            <div className="flex space-x-2 overflow-x-auto pb-4">
            <button onClick={() => onSelect(null)} className="px-4 py-2 bg-gray-100 rounded-full">All</button>
            {categories.map(cat => (
                <button 
                key={cat.id} 
                onClick={() => onSelect(cat.id)}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full whitespace-nowrap hover:bg-blue-100"
                >
                {cat.label}
                </button>
            ))}
            </div>
        );
    };
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
      <p className="text-gray-600 mt-2">{business.description}</p>
      
      <div className="mt-6 space-y-3 border-t pt-4">
        {/* Address & Map Link */}
        <div className="flex items-center text-gray-700">
          <MapPinIcon className="h-5 w-5 mr-2 text-blue-500" />
          <a href={`https://maps.google.com{business.address} ${business.zip}`} target="_blank">
            {business.address}, {business.zip}
          </a>
        </div>

        {/* Click to Call */}
        <div className="flex items-center text-gray-700">
          <PhoneIcon className="h-5 w-5 mr-2 text-green-500" />
          <a href={`tel:${business.phone}`}>{business.phone}</a>
        </div>

        {/* Email */}
        <div className="flex items-center text-gray-700">
          <EnvelopeIcon className="h-5 w-5 mr-2 text-red-400" />
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </div>
      </div>
    </div>
  );
};

/*
4. Why this is a Discovery Powerhouse

    Actionable Discovery: Users in a 60-mile radius don't just see the business; they can call or drive to it immediately.
    Trust Signals: Having a valid ZIP and phone number (verified via your Postcard Logic) prevents "Scam" listings from appearing in the district feed.
    Local SEO: Storing the zip separately allows the Elixir backend to group "Top Businesses in [Zip Code]" for a future leaderboard.

    Specific Utility: If a user is looking for a local plumber (Construction) or a new startup (Technology) in their Federal District, they can find them without scrolling through restaurant ads.
Leaderboard Synergy: You can now have "Top 5 Food Proposals" or "Top 5 Tech Ideas" leaderboards, encouraging niche innovation.
Market Gaps: By seeing which categories have many "Proposals" but no "Existing" businesses, entrepreneurs can identify what their district is missing.
*/
