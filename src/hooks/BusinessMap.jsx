import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/*
"Map View" toggle

To implement the
Map View, we will use React-Leaflet to render an interactive map. Your Elixir backend will serve the business coordinates using PostGIS functions to ensure the pins are accurately placed within your 60-mile radius or district boundaries.

2. npm install leaflet react-leaflet

This component uses the filtered businesses list from your API to render pins dynamically.
*/

const BusinessMap = ({ businesses, userLocation }) => {
  // Center map on user's home coordinates [lat, lng]
  const center = [userLocation.lat, userLocation.lng];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {businesses.map(biz => (
          <Marker key={biz.id} position={biz.coordinates}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-blue-600">{biz.name}</h4>
                <p className="text-xs text-gray-500 uppercase">{biz.category}</p>
                <button className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

/*
3. Implementation of the Toggle
In your main Local Businesses page, use a state variable 
to switch between the "Card View" and the "Map View."
*/

const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

return (
  <div>
    <div className="flex justify-end mb-4">
      <button onClick={() => setViewMode('list')} className={`px-4 ${viewMode === 'list' ? 'font-bold' : ''}`}>List</button>
      <button onClick={() => setViewMode('map')} className={`px-4 ${viewMode === 'map' ? 'font-bold' : ''}`}>Map</button>
    </div>

    {viewMode === 'map' ? (
      <BusinessMap businesses={businesses} userLocation={user.location} />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map(biz => <BusinessCard key={biz.id} business={biz} />)}
      </div>
    )}
  </div>
);

/*
Why this is a Discovery Powerhouse

    Spatial Context: Seeing business ideas as pins helps neighbors visualize clusters of activity in their specific State Senate or Federal Districts.
    Interactive Exploration: Users can click pins to see popups with quick stats, encouraging them to dive into the Business Discussion threads.
    Radius Visualization: The map naturally shows the 60-mile boundary, making the discovery process more intuitive than a simple list. 
*/

//=====================================================
