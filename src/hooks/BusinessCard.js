

/*
Online business
Online Badge
In your React app, you can show a distinct badge for online businesses 
so users know there is no physical location to visit.
*/
const BusinessCard = ({ business }) => {
  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between">
        <h4 className="font-bold">{business.name}</h4>
        {business.category === 'online' && (
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
            🌐 Online Business
          </span>
        )}
      </div>
      
      {business.category === 'online' ? (
        <a href={business.website} className="text-blue-500 text-sm mt-2 block">
          Visit Online Store →
        </a>
      ) : (
        <p className="text-sm text-gray-500 mt-2">{business.address}</p>
      )}
    </div>
  );
};
/*
Why this is a Discovery Win:

    Support Local Creators: It encourages "digital residents" to stay in their districts while growing their businesses.
    Verification Synergy: Even without a storefront, an online business can be Verified via Postcard to their residential address to prove they are a real local human.
    Niche Markets: Users can filter by "Online" + "Technology" to find local software developers or freelancers.
*/
